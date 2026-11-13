// Razorpay Standard Checkout for Learning Lab courses.
// 1. Ask our create-order function (Supabase Edge Function) for an order; the server sets the price.
// 2. Open Razorpay's payment window with that order.
// 3. Send Razorpay's reply to verify-payment, which checks the signature and unlocks the course.
// No keys live in this file: the public key id comes back from create-order; the secret stays on the server.
import { SUPABASE_KEY, SUPABASE_URL } from '../supabase.config';
import { supabase } from './client';
import { displayName } from './store';

const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;
const CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;
function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CHECKOUT_JS;
    s.onload = resolve;
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('The payment window could not load. Check your connection and try again.'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function callFunction(name, body) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Please sign in again to continue.');
  let res;
  try {
    res = await fetch(`${FUNCTIONS}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the payment server. Check your connection and try again.');
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `Payment server error (${res.status}).`);
  return out;
}

/**
 * Buy `product` ('python', … or 'all'). `say(text)` shows progress and results next to the button.
 * Resolves true when the course is unlocked.
 */
export async function startCheckout(product, { say, onPaid }) {
  say?.('Starting a secure payment…');
  const [order] = await Promise.all([callFunction('create-order', { product }), loadCheckoutScript()]);
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
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
        say?.('Payment received. Unlocking your course…');
        try {
          await callFunction('verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await onPaid?.();
          say?.('Unlocked! Every lesson in the course is now open. Thank you for your support.');
          resolve(true);
        } catch (e) {
          say?.(`${e.message} Your payment reference is ${response.razorpay_payment_id}.`);
          resolve(false);
        }
      },
      modal: {
        ondismiss: () => {
          say?.('Payment cancelled. You have not been charged.');
          resolve(false);
        },
      },
    });
    rzp.on('payment.failed', (resp) => {
      const reason = resp?.error?.description || 'The payment did not go through.';
      say?.(`${reason} You can try again or use another payment method.`);
    });
    rzp.open();
  });
}
