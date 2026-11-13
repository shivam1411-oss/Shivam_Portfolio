// Razorpay Standard Checkout for Learning Lab courses.
// 1. Ask our create-order function (Supabase Edge Function) for an order; the server sets the price.
// 2. Open Razorpay's payment window with that order.
// 3. Send Razorpay's reply to verify-payment, which checks the signature and unlocks the course.
// No keys live in this file: the public key id comes back from create-order; the secret stays on the server.
//
// Every step has a time limit, and if Razorpay cannot show its window (for example when the website is not
// approved in the Razorpay account) the page is put back as it was, so it never ends up stuck.
import { SUPABASE_KEY, SUPABASE_URL } from '../supabase.config';
import { supabase } from './client';
import { displayName } from './store';

const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;
const CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';

const SCRIPT_TIMEOUT_MS = 20000; // loading Razorpay's script
const ORDER_TIMEOUT_MS = 25000; // creating the order
const VERIFY_TIMEOUT_MS = 60000; // checking a finished payment (worth waiting longer: money has moved)
const WINDOW_TIMEOUT_MS = 15000; // Razorpay's window appearing after open()

let scriptPromise = null;
function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ||= new Promise((resolve, reject) => {
    const fail = (message) => {
      clearTimeout(timer);
      scriptPromise = null;
      s.remove();
      reject(new Error(message));
    };
    const s = document.createElement('script');
    const timer = setTimeout(() => fail('The payment window is taking too long to load. Check your connection and try again.'), SCRIPT_TIMEOUT_MS);
    s.src = CHECKOUT_JS;
    s.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    s.onerror = () => fail('The payment window could not load. Check your connection and try again.');
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function callFunction(name, body, timeoutMs = ORDER_TIMEOUT_MS) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Please sign in again to continue.');
  let res;
  try {
    res = await fetch(`${FUNCTIONS}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    if (e?.name === 'TimeoutError') throw new Error('The payment server is taking too long to answer. Please try again in a minute.');
    throw new Error('Could not reach the payment server. Check your connection and try again.');
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `Payment server error (${res.status}).`);
  return out;
}

/** Razorpay's window counts as shown once its container is on screen with a size. */
const windowShown = () => [...document.querySelectorAll('.razorpay-container')].some((c) => c.offsetWidth > 0 && c.offsetHeight > 0);

let busy = false;

/**
 * Buy `product` ('python', … or 'all'). `say(text)` shows progress and results next to the button.
 * Resolves true when the course is unlocked.
 */
export async function startCheckout(product, { say, onPaid }) {
  if (busy) {
    say?.('A payment is already in progress.');
    return false;
  }
  busy = true;
  try {
    say?.('Starting a secure payment…');
    const [order] = await Promise.all([callFunction('create-order', { product }), loadCheckoutScript()]);
    const { data } = await supabase.auth.getUser();
    say?.('Opening the payment window…');
    return await openWindow(order, data.user, { say, onPaid });
  } finally {
    busy = false;
  }
}

/** Open Razorpay's window for an order from create-order. Exported so it can be tried on its own. */
export function openWindow(order, user, { say, onPaid }) {
  // Razorpay locks page scrolling while its window is open, and reports some failures with alert(), which
  // blocks the whole page. Remember the scroll settings and catch those alerts, so we can recover cleanly.
  const html = document.documentElement;
  const saved = { html: html.style.overflow, body: document.body.style.overflow };
  const realAlert = window.alert;
  let alerted = '';
  window.alert = (message) => {
    alerted = String(message ?? '').replace(/\s+/g, ' ').trim();
  };

  return new Promise((resolve) => {
    let settled = false;
    let watcher = 0;
    const finish = (ok, message) => {
      if (settled) return;
      settled = true;
      clearInterval(watcher);
      window.alert = realAlert;
      html.style.overflow = saved.html;
      document.body.style.overflow = saved.body;
      if (message) say?.(message);
      resolve(ok);
    };
    // Anything left over from Razorpay (hidden window, scroll lock) is removed when it never managed to open.
    const giveUp = (why) => {
      try {
        rzp.close();
      } catch {
        /* the window never opened */
      }
      document.querySelectorAll('.razorpay-container').forEach((c) => {
        if (!(c.offsetWidth > 0 && c.offsetHeight > 0)) c.remove();
      });
      finish(
        false,
        `The payment window could not open${why ? ` (Razorpay said: "${why}")` : ''}. You have not been charged. Please try again later; if it keeps happening, contact us.`
      );
    };

    let rzp;
    try {
      rzp = new window.Razorpay({
        key: order.key_id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Shivam Soni · Learning Lab',
        description: order.product === 'all' ? 'All-access: every course' : `${order.title} course`,
        prefill: { name: displayName(user), email: user?.email || '' },
        notes: { product: order.product },
        theme: { color: '#0f766e' },
        handler: async (response) => {
          clearInterval(watcher);
          window.alert = realAlert;
          say?.('Payment received. Unlocking your course…');
          try {
            await callFunction(
              'verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              VERIFY_TIMEOUT_MS
            );
            await onPaid?.();
            finish(true, 'Unlocked! Every lesson in the course is now open. Thank you for your support.');
          } catch (e) {
            finish(
              false,
              `${e.message} Your payment went through, so your course will unlock as soon as it is confirmed: reload this page in a minute. Your payment reference is ${response.razorpay_payment_id}.`
            );
          }
        },
        modal: {
          ondismiss: () => finish(false, 'Payment cancelled. You have not been charged.'),
        },
      });
    } catch (e) {
      finish(false, `The payment window could not open (${e?.message || 'unknown error'}). You have not been charged.`);
      return;
    }

    rzp.on('payment.failed', (resp) => {
      const reason = resp?.error?.description || 'The payment did not go through.';
      say?.(`${reason} You can try again or use another payment method.`);
    });

    try {
      rzp.open();
    } catch (e) {
      giveUp(e?.message);
      return;
    }

    // Wait for the window to actually appear. Razorpay reports start-up failures with an alert (caught above);
    // if that happens, or nothing shows within the time limit, give up and put the page back.
    const started = Date.now();
    let seen = false;
    watcher = setInterval(() => {
      if (windowShown()) {
        if (!seen) {
          seen = true;
          window.alert = realAlert; // the window is up: alerts from here on are Razorpay's normal behaviour
        }
        return;
      }
      if (seen) return; // closed by the learner: ondismiss handles it
      if (alerted) giveUp(alerted);
      else if (Date.now() - started > WINDOW_TIMEOUT_MS) giveUp('');
    }, 250);
  });
}
