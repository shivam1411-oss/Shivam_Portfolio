// The learner's account: who is signed in, what they own, and the actions on the account page.
// The Supabase library loads in the background after the page appears, so free lessons are never slowed.
//
// Email links (confirm sign-up, reset password) come back to learn.html with ?token_hash=…&type=… (our email
// templates, see supabase/email-templates) or ?code=… (Supabase's default templates); both are handled here.
import { courseById, forgetLoadedCourses } from '../catalog';
import { setAuthHeaders, setOwned } from '../access';

const listeners = new Set();
let state = { status: 'loading', user: null, owned: [], notice: null, recovering: false, toast: null, isAdmin: false };
let client = null;
let clientPromise = null;

const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
export const subscribeAccount = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getAccount = () => state;

/** Load the Supabase library (once) and start listening for sign-in and sign-out. */
const getClient = () => {
  clientPromise ||= import('./client').then((m) => {
    client = m.supabase;
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        set({ recovering: true });
        window.location.hash = '#/account/reset';
      }
      // Run outside the callback, as Supabase recommends, so other auth calls are not blocked.
      setTimeout(() => onSession(session), 0);
    });
    return client;
  });
  return clientPromise;
};

/** Where email links should come back to: this page, without the route or any query. */
const returnUrl = () => `${window.location.origin}${window.location.pathname}`;

// ---------------------------------------------------------------- friendly messages

export function friendly(error) {
  const msg = String(error?.message || error || '');
  const code = error?.code || '';
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) return 'That email and password do not match an account.';
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(msg)) return 'Please confirm your email first: open the link we sent you.';
  if (code === 'user_already_exists' || /already registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
  if (code === 'weak_password' || /password should be/i.test(msg)) return 'Choose a stronger password: at least 8 characters, ideally with letters and numbers.';
  if (code === 'same_password') return 'The new password must be different from the old one.';
  if (/rate limit|too many/i.test(msg) || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit')
    return 'Too many attempts. Please wait a minute and try again.';
  if (/expired|invalid.*(token|link|otp)|otp_expired/i.test(msg + code)) return 'This link has expired or was already used. Ask for a new one below.';
  if (/fetch|network/i.test(msg)) return 'Could not reach the server. Check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------- session and purchases

async function onSession(session) {
  if (!session?.user) {
    setAuthHeaders(async () => ({}));
    setOwned([]);
    forgetLoadedCourses();
    set({ status: 'signed-out', user: null, owned: [], isAdmin: false });
    return;
  }
  setAuthHeaders(async () => {
    const { data } = await client.auth.getSession();
    return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  });
  set({ status: 'signed-in', user: session.user });
  // Admins (the site owner) have every course without buying it. Before supabase/admin.sql is run, this is false.
  const { data: isAdmin } = await client.rpc('is_admin').then((r) => r, () => ({ data: false }));
  set({ isAdmin: isAdmin === true });
  await refreshPurchases();
}

/** Re-read what the learner owns (after sign-in, and after a purchase). */
export async function refreshPurchases() {
  if (!client || state.status !== 'signed-in') return;
  const { data, error } = await client.from('purchases').select('product_id').eq('status', 'paid');
  const bought = error ? [] : data.map((r) => r.product_id);
  const owned = [...new Set(state.isAdmin ? ['all', ...bought] : bought)];
  setOwned(owned);
  forgetLoadedCourses();
  set({ owned });
}

/** Handle an email link in the URL, then remove it from the address bar. */
async function handleEmailLink() {
  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  const linkError = params.get('error_description');
  if (!tokenHash && !linkError && !params.get('code')) return;
  const clean = () => window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
  if (linkError) {
    clean();
    set({ notice: { tone: 'error', text: friendly(linkError) } });
    window.location.hash = '#/account';
    return;
  }
  if (tokenHash) {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    clean();
    if (error) {
      set({ notice: { tone: 'error', text: friendly(error) } });
      window.location.hash = '#/account';
    } else if (type === 'recovery') {
      set({ recovering: true });
      window.location.hash = '#/account/reset';
    } else {
      set({ notice: { tone: 'ok', text: 'Your email is confirmed and you are signed in. Welcome to the Learning Lab!' } });
      window.location.hash = '#/account';
    }
  } else {
    // ?code=… is exchanged by the Supabase client itself (detectSessionInUrl); just tidy the address bar.
    setTimeout(clean, 1500);
  }
}

let started = false;
/**
 * Start the account system (call once when the Lab opens). The Supabase library is only downloaded if this
 * browser has signed in before or an email link was opened; otherwise it loads when the account page is used.
 */
export function initAccount() {
  if (started) return;
  started = true;
  window.addEventListener('lab:unlock', onUnlock);
  let hasSession = false;
  try {
    hasSession = !!localStorage.getItem('lab-auth');
  } catch {
    /* storage blocked */
  }
  const hasLink = /[?&](token_hash|code|error_description)=/.test(window.location.search);
  if (!hasSession && !hasLink) {
    set({ status: 'signed-out' });
    return;
  }
  getClient()
    .then(async () => {
      await handleEmailLink();
      const { data } = await client.auth.getSession();
      await onSession(data.session);
    })
    .catch(() => set({ status: 'signed-out', notice: { tone: 'error', text: 'Accounts are unavailable right now. Free lessons still work.' } }));
}

// ---------------------------------------------------------------- unlock buttons

let pendingProduct = null;
function onUnlock(event) {
  event.preventDefault(); // tell the unlock card we handled it
  const { product, say } = event.detail || {};
  if (state.status !== 'signed-in') {
    pendingProduct = product;
    set({ notice: { tone: 'info', text: 'Sign in or create a free account, then you can unlock the course.' } });
    window.location.hash = '#/account';
    return;
  }
  if (state.owned.includes(product) || state.owned.includes('all')) {
    say?.('You already own this course.');
    return;
  }
  const onPaid = async () => {
    await refreshPurchases();
    const title = product === 'all' ? 'Every course' : courseById[product]?.title || 'Your course';
    set({ toast: `${title} unlocked! Every lesson, exercise and the knowledge base are now open. Thank you for your support.` });
  };
  import('./checkout')
    .then((m) => m.startCheckout(product, { say, onPaid }))
    .catch((e) => say?.(e.message || 'Could not start the payment. Please try again.'));
}
export const takePendingProduct = () => {
  const p = pendingProduct;
  pendingProduct = null;
  return p;
};

// ---------------------------------------------------------------- account actions (used by the account page)

export const clearNotice = () => set({ notice: null });
export const clearToast = () => set({ toast: null });

export async function signUp({ name, email, password }) {
  await getClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: returnUrl() },
  });
  if (error) throw new Error(friendly(error));
  // With email confirmation on, an existing address returns a user with no identities (no email is sent).
  if (data.user && data.user.identities?.length === 0) throw new Error(friendly({ code: 'user_already_exists' }));
  return { needsConfirmation: !data.session };
}

export async function signIn({ email, password }) {
  await getClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const e = new Error(friendly(error));
    e.unconfirmed = error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message);
    throw e;
  }
}

export async function resendConfirmation(email) {
  await getClient();
  const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: returnUrl() } });
  if (error) throw new Error(friendly(error));
}

export async function sendPasswordReset(email) {
  await getClient();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: returnUrl() });
  if (error) throw new Error(friendly(error));
}

export async function updatePassword(password) {
  await getClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) throw new Error(friendly(error));
  set({ recovering: false });
}

export async function updateName(name) {
  await getClient();
  const { data, error } = await client.auth.updateUser({ data: { name } });
  if (error) throw new Error(friendly(error));
  set({ user: data.user });
}

export async function signOut() {
  await getClient();
  await client.auth.signOut();
}

// ---------------------------------------------------------------- progress sync

/** The learner's saved progress, or null. */
export async function loadRemoteProgress() {
  if (!client || state.status !== 'signed-in') return null;
  const { data, error } = await client.from('progress').select('data').eq('user_id', state.user.id).maybeSingle();
  if (error) return null;
  return data?.data || {};
}

/** Save progress to the account (last write wins; callers debounce). */
export async function saveRemoteProgress(payload) {
  if (!client || state.status !== 'signed-in') return;
  await client.from('progress').upsert({ user_id: state.user.id, data: payload, updated_at: new Date().toISOString() });
}

/** Call the admin Edge Function (only works for admins; the server checks). */
export async function adminCall(body) {
  await getClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Please sign in.');
  const { SUPABASE_KEY, SUPABASE_URL } = await import('../supabase.config');
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the admin server.');
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `Admin server error (${res.status}).`);
  return out;
}

export const displayName = (user) => user?.user_metadata?.name || user?.email?.split('@')[0] || '';
