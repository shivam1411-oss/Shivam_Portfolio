// #/account: sign in, create an account, reset a password, and (signed in) the learner's profile.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { btn, btnPrimary } from '../ui';
import { courseById } from '../catalog';
import {
  clearNotice,
  displayName,
  getAccount,
  resendConfirmation,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  subscribeAccount,
  takePendingProduct,
  updateName,
  updatePassword,
} from './store';

const MIN_PASSWORD = 8;

const input =
  'w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface text-fg text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition';

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-muted mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-subtle">{hint}</span>}
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        minLength={MIN_PASSWORD}
        required
        className={`${input} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-subtle hover:text-fg"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Message({ tone = 'info', children }) {
  const style =
    tone === 'error'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
      : tone === 'ok'
        ? 'bg-accent/10 border-accent/30 text-fg'
        : 'bg-surface-2 border-line text-fg';
  return (
    <p className={`p-3 rounded-xl border text-sm leading-relaxed ${style}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

function Submit({ busy, children }) {
  return (
    <button type="submit" disabled={busy} className={`${btnPrimary} w-full justify-center disabled:opacity-60`}>
      {busy && <Loader2 size={15} className="animate-spin" />} {children}
    </button>
  );
}

// ---------------------------------------------------------------- signed out

function SignIn({ onMode, email, setEmail }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [resent, setResent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), password });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className={input} />
      </Field>
      <Field label="Password">
        <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" id="signin-password" />
      </Field>
      {error && (
        <Message tone="error">
          {error.message}
          {error.unconfirmed && !resent && (
            <>
              {' '}
              <button
                type="button"
                className="font-bold underline underline-offset-2"
                onClick={() => resendConfirmation(email.trim()).then(() => setResent(true), (err) => setError(err))}
              >
                Send the link again
              </button>
            </>
          )}
          {resent && ' A new link is on its way.'}
        </Message>
      )}
      <Submit busy={busy}>Sign in</Submit>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button type="button" onClick={() => onMode('forgot')} className="font-bold text-muted hover:text-fg">
          Forgot password?
        </button>
        <button type="button" onClick={() => onMode('signup')} className="font-bold text-accent hover:underline">
          Create an account
        </button>
      </div>
    </form>
  );
}

function SignUp({ onMode, email, setEmail }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
    setBusy(true);
    setError('');
    try {
      const { needsConfirmation } = await signUp({ name: name.trim(), email: email.trim(), password });
      if (needsConfirmation) setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  if (sent)
    return (
      <div className="space-y-4 text-center">
        <Mail size={36} className="mx-auto text-accent" />
        <h2 className="text-xl font-extrabold text-fg">Check your inbox</h2>
        <p className="text-sm text-muted leading-relaxed">
          We sent a link to <b className="text-fg">{email}</b>. Open it to confirm your email and you will be signed in. It can take a minute; check spam if
          you do not see it.
        </p>
        <button type="button" className={btn} onClick={() => resendConfirmation(email.trim()).catch(() => {})}>
          Send it again
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name">
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={60} className={input} />
      </Field>
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className={input} />
      </Field>
      <Field label="Password" hint={`At least ${MIN_PASSWORD} characters.`}>
        <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" id="signup-password" />
      </Field>
      <label className="flex items-start gap-2 text-xs text-muted leading-relaxed">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required className="mt-0.5 accent-[var(--accent)]" />
        <span>
          I agree to the{' '}
          <a href="./terms.html" target="_blank" rel="noreferrer" className="font-bold text-fg underline underline-offset-2">
            terms of use
          </a>{' '}
          and the{' '}
          <a href="./privacy.html" target="_blank" rel="noreferrer" className="font-bold text-fg underline underline-offset-2">
            privacy policy
          </a>
          . Your name, email and progress are stored to run your account.
        </span>
      </label>
      {error && <Message tone="error">{error}</Message>}
      <Submit busy={busy}>Create account</Submit>
      <p className="text-sm text-center text-muted">
        Already have an account?{' '}
        <button type="button" onClick={() => onMode('signin')} className="font-bold text-accent hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

function Forgot({ onMode, email, setEmail }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted leading-relaxed">Enter your email and we will send you a link to choose a new password.</p>
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className={input} />
      </Field>
      {sent && <Message tone="ok">If an account exists for {email}, a reset link is on its way. It works once and expires in an hour.</Message>}
      {error && <Message tone="error">{error}</Message>}
      <Submit busy={busy}>Send reset link</Submit>
      <button type="button" onClick={() => onMode('signin')} className="w-full text-sm font-bold text-muted hover:text-fg">
        Back to sign in
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- set a new password (from the reset email, or signed in)

function NewPassword({ onDone, title = 'Choose a new password' }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    setBusy(true);
    setError('');
    try {
      await updatePassword(password);
      setDone(true);
      setPassword('');
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-extrabold text-fg">{title}</h2>
      <Field label="New password" hint={`At least ${MIN_PASSWORD} characters.`}>
        <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" id="new-password" />
      </Field>
      {done && <Message tone="ok">Your password has been changed.</Message>}
      {error && <Message tone="error">{error}</Message>}
      <Submit busy={busy}>Save password</Submit>
    </form>
  );
}

// ---------------------------------------------------------------- signed in

function Profile({ account }) {
  const { user, owned } = account;
  const [name, setName] = useState(displayName(user));
  const [nameState, setNameState] = useState('');
  const [pending] = useState(() => takePendingProduct());
  const courses = owned.includes('all') ? 'all' : owned.map((id) => courseById[id]?.title).filter(Boolean);
  const saveName = async (e) => {
    e.preventDefault();
    setNameState('saving');
    try {
      await updateName(name.trim());
      setNameState('saved');
    } catch {
      setNameState('error');
    }
  };
  return (
    <div className="space-y-6">
      {pending && (
        <Message tone="info">
          You are signed in. Go back to the course to unlock it:{' '}
          <a className="font-bold underline underline-offset-2" href={pending === 'all' ? '#/courses' : `#/c/${pending}`}>
            {pending === 'all' ? 'all courses' : courseById[pending]?.title}
          </a>
          .
        </Message>
      )}
      <section className="p-5 rounded-2xl bg-surface border border-line">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-accent/15 text-accent flex items-center justify-center font-extrabold">{(displayName(user)[0] || '?').toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block font-extrabold text-fg truncate">{displayName(user)}</span>
            <span className="block text-sm text-muted truncate">{user.email}</span>
          </span>
        </div>
        <form onSubmit={saveName} className="mt-5 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[12rem]">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className={input} />
            </Field>
          </div>
          <button type="submit" className={btn} disabled={nameState === 'saving'}>
            {nameState === 'saved' ? <CheckCircle2 size={15} className="text-accent" /> : null} Save
          </button>
        </form>
      </section>

      <section className="p-5 rounded-2xl bg-surface border border-line">
        <h2 className="font-extrabold text-fg flex items-center gap-2">
          <Sparkles size={16} className="text-accent" /> Your courses
        </h2>
        {account.isAdmin && (
          <p className="mt-2 text-sm text-fg leading-relaxed">
            <b>Admin:</b> you have every course without buying it.{' '}
            <a href="#/admin" className="font-bold text-accent underline underline-offset-2">
              Open the admin dashboard
            </a>
          </p>
        )}
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {courses === 'all'
            ? 'All-access: every course is unlocked.'
            : courses.length
              ? `Unlocked: ${courses.join(', ')}.`
              : 'Learn the Code and the first module of every course are free. Unlock a full course from any locked lesson.'}
        </p>
        <p className="mt-2 text-xs text-subtle">Your progress is saved to your account, so it follows you to any device where you sign in.</p>
      </section>

      <section className="p-5 rounded-2xl bg-surface border border-line">
        <NewPassword title="Change password" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={signOut} className={btn}>
          <LogOut size={15} /> Sign out
        </button>
        <p className="text-xs text-subtle max-w-sm">
          To delete your account and its data, use Connect on{' '}
          <a href="./index.html" className="underline underline-offset-2">
            the portfolio
          </a>{' '}
          and ask; it will be removed.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- page

export default function AccountPage({ sub }) {
  const account = useSyncExternalStore(subscribeAccount, getAccount);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const notice = account.notice;
  useEffect(() => () => clearNotice(), []);

  let body;
  if (account.status === 'loading')
    body = (
      <p className="text-sm text-muted flex items-center gap-2">
        <Loader2 size={15} className="animate-spin" /> Loading your account…
      </p>
    );
  else if (sub === 'reset' && account.status === 'signed-in') body = <NewPassword onDone={() => setTimeout(() => (window.location.hash = '#/account'), 1500)} />;
  else if (sub === 'reset')
    body = <Message tone="error">This reset link has expired or was already used. Ask for a new one from "Forgot password?" below.</Message>;
  else if (account.status === 'signed-in') body = <Profile account={account} />;
  else if (mode === 'signup') body = <SignUp onMode={setMode} email={email} setEmail={setEmail} />;
  else if (mode === 'forgot') body = <Forgot onMode={setMode} email={email} setEmail={setEmail} />;
  else body = <SignIn onMode={setMode} email={email} setEmail={setEmail} />;

  const signedOut = account.status === 'signed-out';
  const heading = account.status === 'signed-in' ? 'Your account' : mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Sign in';

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="eyebrow text-accent flex items-center gap-2">
        {account.status === 'signed-in' ? <UserRound size={14} /> : <ShieldCheck size={14} />} Learning Lab account
      </div>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-fg">{sub === 'reset' ? 'Set a new password' : heading}</h1>
      {signedOut && mode !== 'forgot' && sub !== 'reset' && (
        <p className="mt-3 text-sm text-muted leading-relaxed">Save your progress across devices and unlock full courses. Free lessons never need an account.</p>
      )}
      {notice && (
        <div className="mt-5">
          <Message tone={notice.tone}>{notice.text}</Message>
        </div>
      )}
      <div className="mt-6 p-5 md:p-6 rounded-[1.5rem] bg-surface border border-line shadow-soft">{body}</div>
      {signedOut && sub === 'reset' && (
        <div className="mt-6 p-5 rounded-[1.5rem] bg-surface border border-line">
          <Forgot onMode={setMode} email={email} setEmail={setEmail} />
        </div>
      )}
    </div>
  );
}
