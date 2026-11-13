// #/admin: the site owner's dashboard. Sales, buyers, how far each buyer has got (for the 7-day / 25% refund
// rule), refunds through Razorpay, and free course grants. The server (admin Edge Function) only answers admins.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { BadgeCheck, ExternalLink, Gift, Loader2, RefreshCw, ShieldAlert, Undo2, Users, Wallet } from 'lucide-react';
import { btn, btnPrimary } from '../ui';
import { courses, courseById } from '../catalog';
import { formatRupees } from '../access';
import { adminCall, getAccount, subscribeAccount } from './store';

const DAY = 24 * 60 * 60 * 1000;
const REFUND_DAYS = 7;
const REFUND_MAX_COMPLETION = 0.25;

/** Paid lesson keys ("course/lesson") a product unlocks. */
function paidLessons(product) {
  const list = product === 'all' ? courses.filter((c) => c.paid) : [courseById[product]].filter(Boolean);
  return list.flatMap((c) => c.lessons.filter((l) => !l.free).map((l) => `${c.id}/${l.id}`));
}

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-line">
      <div className="flex items-center gap-2 text-xs font-bold text-subtle uppercase tracking-wider">
        <Icon size={14} /> {label}
      </div>
      <div className="mt-1.5 text-2xl font-extrabold text-fg tabular-nums">{value}</div>
    </div>
  );
}

function Grant({ onDone }) {
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('all');
  const [state, setState] = useState({ busy: false, msg: '', tone: '' });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, msg: '', tone: '' });
    try {
      await adminCall({ action: 'grant', email, product });
      setState({ busy: false, msg: `Granted ${product === 'all' ? 'all courses' : courseById[product]?.title} to ${email}.`, tone: 'ok' });
      setEmail('');
      onDone();
    } catch (err) {
      setState({ busy: false, msg: err.message, tone: 'error' });
    }
  };
  return (
    <form onSubmit={submit} className="p-5 rounded-2xl bg-surface border border-line">
      <h2 className="font-extrabold text-fg flex items-center gap-2">
        <Gift size={16} className="text-accent" /> Give a course for free
      </h2>
      <p className="mt-1 text-sm text-muted">For giveaways, testers or support. The person must have signed up first. Recorded as a ₹0 purchase.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="their account email"
          className="flex-1 min-w-[14rem] px-3 py-2 rounded-xl border border-line bg-surface text-sm text-fg"
        />
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-fg">
          <option value="all">All courses</option>
          {courses
            .filter((c) => c.paid)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
        </select>
        <button type="submit" disabled={state.busy} className={btnPrimary}>
          {state.busy && <Loader2 size={14} className="animate-spin" />} Grant
        </button>
      </div>
      {state.msg && <p className={`mt-2 text-sm ${state.tone === 'error' ? 'text-amber-700 dark:text-amber-300' : 'text-accent'}`}>{state.msg}</p>}
    </form>
  );
}

export default function AdminPage() {
  const account = useSyncExternalStore(subscribeAccount, getAccount);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('paid');

  const load = useCallback(() => {
    setError('');
    adminCall({ action: 'overview' }).then(setData, (e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (account.status === 'signed-in') load();
  }, [account.status, load]);

  const rows = useMemo(() => {
    if (!data) return [];
    const users = Object.fromEntries(data.users.map((u) => [u.id, u]));
    return data.purchases.map((p) => {
      const lessons = paidLessons(p.product_id);
      const done = new Set(data.done[p.user_id] || []);
      const completed = lessons.filter((k) => done.has(k)).length;
      const pct = lessons.length ? completed / lessons.length : 0;
      const age = p.paid_at ? (Date.now() - new Date(p.paid_at)) / DAY : null;
      const paidByCard = !!p.razorpay_payment_id;
      const eligible = p.status === 'paid' && paidByCard && age !== null && age <= REFUND_DAYS && pct < REFUND_MAX_COMPLETION;
      return { ...p, user: users[p.user_id], completed, total: lessons.length, pct, age, paidByCard, eligible };
    });
  }, [data]);

  if (account.status === 'loading') return <p className="max-w-6xl mx-auto px-4 py-16 text-muted">Loading…</p>;
  if (account.status !== 'signed-in' || !account.isAdmin)
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShieldAlert size={36} className="mx-auto text-subtle" />
        <h1 className="mt-3 text-2xl font-extrabold text-fg">Owner only</h1>
        <p className="mt-2 text-sm text-muted">This page is for the site owner. Sign in with the admin account.</p>
        <a href="#/account" className={`${btn} mt-5 inline-flex`}>
          Go to sign in
        </a>
      </div>
    );

  const paid = rows.filter((r) => r.status === 'paid' && r.paidByCard);
  const revenue = paid.reduce((s, r) => s + r.amount_paise, 0);
  const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'paid' ? r.status === 'paid' : r.status === filter));

  const act = async (r, action) => {
    const who = r.user?.email || 'this buyer';
    const what = r.product_id === 'all' ? 'all-access' : courseById[r.product_id]?.title;
    const question =
      action === 'refund'
        ? `Refund ${formatRupees(r.amount_paise)} to ${who} for ${what}?\n\nRazorpay sends the money back and their access to ${what} is removed.` +
          (r.eligible ? '' : '\n\nNote: this purchase is OUTSIDE the refund policy (over 7 days or 25%+ completed).')
        : `Remove ${who}'s free access to ${what}?`;
    if (!window.confirm(question)) return;
    setBusyId(r.id);
    try {
      await adminCall({ action, purchase_id: r.id });
      load();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-accent">Owner</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-fg">Admin dashboard</h1>
        </div>
        <button type="button" onClick={load} className={btn}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <p className="mt-6 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-fg">{error}</p>}
      {!data && !error && (
        <p className="mt-6 text-muted flex items-center gap-2">
          <Loader2 size={15} className="animate-spin" /> Loading sales and accounts…
        </p>
      )}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={Wallet} label="Revenue" value={formatRupees(revenue)} />
            <Stat icon={BadgeCheck} label="Paid purchases" value={paid.length} />
            <Stat icon={Users} label="Accounts" value={data.users.length} />
            <Stat icon={Undo2} label="Refunded" value={rows.filter((r) => r.status === 'refunded').length} />
          </div>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-fg">Purchases</h2>
              <div className="flex gap-1.5 text-xs font-bold">
                {['paid', 'refunded', 'created', 'all'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg border ${filter === f ? 'bg-fg text-bg border-fg' : 'border-line bg-surface text-muted hover:text-fg'}`}
                  >
                    {f === 'created' ? 'unpaid' : f}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-subtle">
              Refund policy: within {REFUND_DAYS} days and under {REFUND_MAX_COMPLETION * 100}% of the paid lessons completed. "Unpaid" are checkouts that were
              opened but not paid.
            </p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wider text-subtle border-b border-line">
                  <tr>
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Completed</th>
                    <th className="p-3">Refund</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0 align-top">
                      <td className="p-3">
                        <div className="font-bold text-fg">{r.user?.name || '—'}</div>
                        <div className="text-xs text-muted break-all">{r.user?.email || r.user_id}</div>
                      </td>
                      <td className="p-3 text-fg">{r.product_id === 'all' ? 'All-access' : courseById[r.product_id]?.title || r.product_id}</td>
                      <td className="p-3 tabular-nums text-fg">{r.paidByCard || r.status !== 'paid' ? formatRupees(r.amount_paise) : 'Free grant'}</td>
                      <td className="p-3 text-xs text-muted">
                        {fmtDate(r.paid_at || r.created_at)}
                        {r.age !== null && <div>{r.age < 1 ? 'today' : `${Math.floor(r.age)} days ago`}</div>}
                        {r.razorpay_payment_id && (
                          <a
                            href={`https://dashboard.razorpay.com/app/payments/${r.razorpay_payment_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            {r.razorpay_payment_id} <ExternalLink size={11} />
                          </a>
                        )}
                      </td>
                      <td className="p-3 tabular-nums">
                        <div className="text-fg font-bold">{Math.round(r.pct * 100)}%</div>
                        <div className="text-xs text-muted">
                          {r.completed}/{r.total} paid lessons
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        {r.status === 'refunded' ? (
                          <span className="text-muted">Refunded</span>
                        ) : r.status !== 'paid' ? (
                          <span className="text-subtle">{r.status === 'created' ? 'Not paid' : r.status}</span>
                        ) : !r.paidByCard ? (
                          <span className="text-subtle">—</span>
                        ) : r.eligible ? (
                          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">Eligible</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                            {r.age > REFUND_DAYS ? 'Over 7 days' : '25%+ done'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {r.status === 'paid' && (
                          <button type="button" disabled={busyId === r.id} onClick={() => act(r, r.paidByCard ? 'refund' : 'revoke')} className={`${btn} !py-1.5 !text-xs`}>
                            {busyId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Undo2 size={13} />} {r.paidByCard ? 'Refund' : 'Remove access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!shown.length && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted">
                        Nothing here yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8">
            <Grant onDone={load} />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-fg">Accounts ({data.users.length})</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wider text-subtle border-b border-line">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Signed up</th>
                    <th className="p-3">Last sign-in</th>
                    <th className="p-3">Lessons done</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.users]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((u) => (
                      <tr key={u.id} className="border-b border-line last:border-0">
                        <td className="p-3 text-fg">{u.name || '—'}</td>
                        <td className="p-3 text-muted break-all">
                          {u.email} {!u.confirmed && <span className="text-xs text-amber-700 dark:text-amber-300">(not confirmed)</span>}
                        </td>
                        <td className="p-3 text-xs text-muted">{fmtDate(u.created_at)}</td>
                        <td className="p-3 text-xs text-muted">{fmtDate(u.last_sign_in_at)}</td>
                        <td className="p-3 tabular-nums text-fg">{(data.done[u.id] || []).length}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
