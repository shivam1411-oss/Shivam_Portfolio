// CodeJack's Help page (#/support, or #/support/<category> to pre-select one): quick answers, a form that raises
// a support request (signed-in learners only), and the learner's own requests with their reply threads.
// The server side is the "support" Edge Function (supabase/functions/support); you answer from the admin page.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, ChevronDown, LifeBuoy, Loader2, LogIn, Mail, MessageSquare, Send } from 'lucide-react';
import { btn, btnPrimary } from '../ui';
import { getAccount, isApp, subscribeAccount, supportCall, supportOrigin } from './store';

export const CATEGORIES = [
  { id: 'payment', label: 'Payment or course unlock' },
  { id: 'account', label: 'Account or sign-in' },
  { id: 'content', label: 'Lesson, exercise or quiz' },
  { id: 'bug', label: 'Something is broken' },
  { id: 'other', label: 'Something else' },
];
const label = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;

export const STATUS = {
  open: { text: 'Open', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  answered: { text: 'Answered', className: 'bg-accent/15 text-accent' },
  resolved: { text: 'Resolved', className: 'bg-surface-2 text-muted' },
};
export const StatusChip = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS[status]?.className || ''}`}>{STATUS[status]?.text || status}</span>
);
export const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const input = 'w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-line text-sm text-fg placeholder:text-subtle focus:outline-none focus:border-accent';

const FAQ = [
  [
    'I paid but the course is still locked',
    'Unlocking usually takes a few seconds. Sign out and back in, or close and reopen CodeJack. If it is still locked after an hour, raise a request below with your payment reference (it starts with pay_, in Razorpay\'s receipt email) and we will unlock it or refund you.',
  ],
  ['I forgot my password', 'On the Sign in page, choose "Forgot password?" and we will email you a link to set a new one.'],
  ['How do refunds work?', 'Card and UPI payments can be refunded within 7 days if you have completed less than a quarter of the course. See the refund policy for details.'],
  ['My progress is missing on another device', 'Progress follows you only when you are signed in to the same account on both devices. Sign in, then open any lesson to sync.'],
];

function Faq() {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold text-fg">Quick answers</h2>
      <div className="mt-3 space-y-2">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group rounded-2xl bg-surface border border-line px-4 py-3">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-sm font-bold text-fg">
              {q} <ChevronDown size={15} className="text-subtle transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {a}{' '}
              {q.startsWith('How do refunds') && (
                <a href="./refund.html" className="font-bold underline underline-offset-2 text-fg">
                  Refund policy
                </a>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function NewRequest({ preset, onCreated }) {
  const [category, setCategory] = useState(CATEGORIES.some((c) => c.id === preset) ? preset : '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState('');
  const [state, setState] = useState({ busy: false, error: '', done: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', done: null });
    try {
      const { ticket } = await supportCall({
        action: 'create',
        category,
        subject,
        message,
        context: { from: supportOrigin(), platform: isApp() ? 'app' : 'web', payment: category === 'payment' ? payment : '' },
      });
      setState({ busy: false, error: '', done: ticket.number });
      setSubject('');
      setMessage('');
      setPayment('');
      onCreated();
    } catch (err) {
      setState({ busy: false, error: err.message, done: null });
    }
  };

  if (state.done)
    return (
      <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30" role="status">
        <div className="flex items-center gap-2 font-extrabold text-fg">
          <CheckCircle2 size={18} className="text-accent" /> Request {state.done} received
        </div>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          We have emailed you a copy. We usually reply within 48 hours: you will get an email, and the reply appears under "Your requests" below.
        </p>
        <button type="button" className={`${btn} mt-4`} onClick={() => setState({ busy: false, error: '', done: null })}>
          Raise another request
        </button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-bold text-muted mb-1.5">What is it about?</span>
        <select required value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          <option value="" disabled>
            Choose one
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {category === 'payment' && (
        <label className="block">
          <span className="block text-xs font-bold text-muted mb-1.5">Payment reference (optional)</span>
          <input value={payment} onChange={(e) => setPayment(e.target.value)} maxLength={80} placeholder="pay_… from Razorpay's receipt email" className={input} />
        </label>
      )}
      <label className="block">
        <span className="block text-xs font-bold text-muted mb-1.5">Subject</span>
        <input required minLength={3} maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="One line, e.g. Paid for Python but it is locked" className={input} />
      </label>
      <label className="block">
        <span className="block text-xs font-bold text-muted mb-1.5">Describe the problem</span>
        <textarea
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What happened, what you expected, and the course or lesson if it is about one."
          className={input}
        />
      </label>
      {state.error && (
        <p className="text-sm text-[#e5484d]" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state.busy} className={btnPrimary}>
          {state.busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send request
        </button>
        <span className="text-xs text-subtle">We reply by email, usually within 48 hours.</span>
      </div>
    </form>
  );
}

function Thread({ ticket, onChanged }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [state, setState] = useState({ busy: false, error: '' });
  const send = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '' });
    try {
      await supportCall({ action: 'reply', ticket_id: ticket.id, message: reply });
      setReply('');
      setState({ busy: false, error: '' });
      onChanged();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return (
    <li className="rounded-2xl bg-surface border border-line">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-3 p-4 text-left">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-subtle">{ticket.number}</span>
            <StatusChip status={ticket.status} />
            {ticket.replies.some((r) => r.author === 'support') && ticket.status === 'answered' && <span className="text-[11px] font-bold text-accent">New reply</span>}
          </span>
          <span className="mt-1 block font-bold text-fg truncate">{ticket.subject}</span>
          <span className="block text-xs text-subtle">
            {label(ticket.category)} · updated {when(ticket.updated_at)}
          </span>
        </span>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <Message author="You" at={ticket.created_at} text={ticket.message} />
          {ticket.replies.map((r) => (
            <Message key={r.id} author={r.author === 'support' ? 'CodeJack Support' : 'You'} support={r.author === 'support'} at={r.created_at} text={r.message} />
          ))}
          <form onSubmit={send} className="pt-1">
            <textarea rows={3} maxLength={4000} required value={reply} onChange={(e) => setReply(e.target.value)} placeholder={ticket.status === 'resolved' ? 'Still not right? Add a message to reopen this request.' : 'Add more detail or reply'} className={input} />
            {state.error && <p className="mt-2 text-sm text-[#e5484d]">{state.error}</p>}
            <button type="submit" disabled={state.busy} className={`${btn} mt-2`}>
              {state.busy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />} Send message
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

function Message({ author, at, text, support = false }) {
  return (
    <div className={`rounded-xl p-3 text-sm ${support ? 'bg-accent/10 border border-accent/25' : 'bg-surface-2 border border-line'}`}>
      <div className="text-[11px] font-bold text-subtle">
        {author} · {when(at)}
      </div>
      <p className="mt-1 text-fg whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

export default function SupportPage({ sub }) {
  const account = useSyncExternalStore(subscribeAccount, getAccount);
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');
  const signedIn = account.status === 'signed-in';

  const load = useCallback(() => {
    supportCall({ action: 'list' })
      .then((r) => {
        setTickets(r.tickets);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (signedIn) load();
  }, [signedIn, load]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="eyebrow text-accent flex items-center gap-2">
        <LifeBuoy size={14} /> CodeJack help
      </div>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-fg">Help & support</h1>
      <p className="mt-3 text-sm text-muted leading-relaxed">Check the quick answers first. If they do not help, raise a request and we will reply by email.</p>

      <Faq />

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-fg">Raise a request</h2>
        <div className="mt-3 p-5 md:p-6 rounded-[1.5rem] bg-surface border border-line shadow-soft">
          {account.status === 'loading' ? (
            <p className="text-sm text-muted flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Loading your account…
            </p>
          ) : signedIn ? (
            <NewRequest preset={sub} onCreated={load} />
          ) : (
            <div>
              <p className="text-sm text-fg font-bold">Sign in to raise a request</p>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                Requests are linked to your CodeJack account, so we can see your purchases and reply to you there.
              </p>
              <a href="#/account" className={`${btnPrimary} mt-4`}>
                <LogIn size={15} /> Sign in
              </a>
              <p className="mt-4 text-xs text-subtle leading-relaxed flex items-start gap-1.5">
                <Mail size={13} className="mt-0.5 shrink-0" /> Cannot sign in at all? Email{' '}
                <a href="mailto:hello@shivam-soni.com" className="font-bold text-fg underline underline-offset-2">
                  hello@shivam-soni.com
                </a>{' '}
                from the address you signed up with.
              </p>
            </div>
          )}
        </div>
      </section>

      {signedIn && (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-fg">Your requests</h2>
          {error && <p className="mt-3 text-sm text-[#e5484d]">{error}</p>}
          {!tickets && !error && (
            <p className="mt-3 text-sm text-muted flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Loading…
            </p>
          )}
          {tickets && !tickets.length && <p className="mt-3 text-sm text-muted">You have not raised any requests yet.</p>}
          {tickets && tickets.length > 0 && (
            <ul className="mt-3 space-y-2">
              {tickets.map((t) => (
                <Thread key={t.id} ticket={t} onChanged={load} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
