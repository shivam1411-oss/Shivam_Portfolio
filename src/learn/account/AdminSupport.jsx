// Support inbox on the admin page: every learner request with its thread, a reply box that emails the learner,
// and status buttons. Loads separately from the sales overview, so a missing support table never breaks the rest.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, LifeBuoy, Loader2, RefreshCw, RotateCcw, Send } from 'lucide-react';
import { btn, btnPrimary } from '../ui';
import { adminCall } from './store';
import { CATEGORIES, StatusChip, when } from './SupportPage';

const label = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;
const FILTERS = [
  ['active', 'Needs attention'],
  ['answered', 'Answered'],
  ['resolved', 'Resolved'],
  ['all', 'All'],
];

function Ticket({ t, onChanged }) {
  const [open, setOpen] = useState(t.status === 'open');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');

  const run = async (kind, body) => {
    setBusy(kind);
    setNote('');
    try {
      const out = await adminCall(body);
      const who = t.name || t.email;
      if (kind !== 'status') setReply('');
      onChanged(
        kind === 'status'
          ? `${t.number} marked ${body.status}.`
          : out.emailed === false
            ? `${t.number}: reply saved, but the email to ${who} failed (check the admin function logs). They will still see it in CodeJack.`
            : `${t.number}: reply sent to ${who}${kind === 'resolve' ? ' and the request resolved' : ''}.`
      );
    } catch (e) {
      setNote(e.message);
    } finally {
      setBusy('');
    }
  };
  const send = (resolve) => (e) => {
    e?.preventDefault();
    if (reply.trim()) run(resolve ? 'resolve' : 'reply', { action: 'support_reply', ticket_id: t.id, message: reply, resolve });
  };

  return (
    <li className="rounded-2xl bg-surface border border-line">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-3 p-4 text-left">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-subtle">{t.number}</span>
            <StatusChip status={t.status} />
            <span className="text-[11px] font-bold text-muted">{label(t.category)}</span>
            {t.context?.platform === 'app' && <span className="text-[11px] font-bold text-subtle">Android app</span>}
          </span>
          <span className="mt-1 block font-bold text-fg truncate">{t.subject}</span>
          <span className="block text-xs text-subtle truncate">
            {t.name ? `${t.name} · ` : ''}
            {t.email} · {when(t.updated_at)}
          </span>
        </span>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {(t.context?.payment || t.context?.from) && (
            <p className="text-xs text-muted">
              {t.context.payment && (
                <>
                  Payment reference: <span className="font-mono text-fg">{t.context.payment}</span>.{' '}
                </>
              )}
              {t.context.from && (
                <>
                  Raised from <span className="font-mono text-fg">{t.context.from}</span>.
                </>
              )}
            </p>
          )}
          <Bubble who={t.name || t.email} at={t.created_at} text={t.message} />
          {t.replies.map((r) => (
            <Bubble key={r.id} who={r.author === 'support' ? 'You (support)' : t.name || t.email} at={r.created_at} text={r.message} mine={r.author === 'support'} />
          ))}
          <form onSubmit={send(false)}>
            <textarea
              rows={4}
              maxLength={4000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Reply to ${t.name || t.email}. It is emailed to them and shown in CodeJack.`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-line text-sm text-fg placeholder:text-subtle focus:outline-none focus:border-accent"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="submit" disabled={!!busy || !reply.trim()} className={`${btnPrimary} !py-2 !text-xs`}>
                {busy === 'reply' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send reply
              </button>
              <button type="button" disabled={!!busy || !reply.trim()} onClick={send(true)} className={`${btn} !py-2 !text-xs`}>
                {busy === 'resolve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Reply and resolve
              </button>
              {t.status !== 'resolved' ? (
                <button type="button" disabled={!!busy} onClick={() => run('status', { action: 'support_status', ticket_id: t.id, status: 'resolved' })} className={`${btn} !py-2 !text-xs`}>
                  Mark resolved
                </button>
              ) : (
                <button type="button" disabled={!!busy} onClick={() => run('status', { action: 'support_status', ticket_id: t.id, status: 'open' })} className={`${btn} !py-2 !text-xs`}>
                  <RotateCcw size={13} /> Reopen
                </button>
              )}
              {note && <span className="text-xs text-muted">{note}</span>}
            </div>
          </form>
        </div>
      )}
    </li>
  );
}

function Bubble({ who, at, text, mine = false }) {
  return (
    <div className={`rounded-xl p-3 text-sm ${mine ? 'bg-accent/10 border border-accent/25' : 'bg-surface-2 border border-line'}`}>
      <div className="text-[11px] font-bold text-subtle">
        {who} · {when(at)}
      </div>
      <p className="mt-1 text-fg whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    adminCall({ action: 'support_list' }).then(
      (r) => {
        setTickets(r.tickets);
        setError('');
      },
      (e) => setError(e.message)
    );
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(
    () => (tickets || []).filter((t) => (filter === 'all' ? true : filter === 'active' ? t.status === 'open' : t.status === filter)),
    [tickets, filter]
  );
  const openCount = (tickets || []).filter((t) => t.status === 'open').length;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-fg flex items-center gap-2">
          <LifeBuoy size={18} className="text-accent" /> Support {tickets && <span className="text-sm font-bold text-muted">({openCount} open)</span>}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(([id, text]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} className={`${btn} !py-1.5 !text-xs ${filter === id ? 'border-accent/60 bg-accent/10 text-fg' : ''}`}>
              {text}
            </button>
          ))}
          <button type="button" onClick={load} className={`${btn} !py-1.5 !text-xs`}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>
      {notice && (
        <p className="mt-3 p-3 rounded-xl border border-accent/30 bg-accent/10 text-sm text-fg flex items-center gap-2" role="status">
          <CheckCircle2 size={15} className="text-accent shrink-0" /> {notice}
        </p>
      )}
      {error && <p className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-fg">{error}</p>}
      {!tickets && !error && (
        <p className="mt-3 text-sm text-muted flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Loading requests…
        </p>
      )}
      {tickets && !shown.length && <p className="mt-3 text-sm text-muted">{filter === 'active' ? 'No open requests. Nice.' : 'Nothing here.'}</p>}
      {shown.length > 0 && (
        <ul className="mt-3 space-y-2">
          {shown.map((t) => (
            <Ticket
              key={t.id}
              t={t}
              onChanged={(msg) => {
                setNotice(msg);
                load();
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
