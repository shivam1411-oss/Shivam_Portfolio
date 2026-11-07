import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Eye, Lightbulb, Play, RotateCcw, Send, Server, TerminalSquare, XCircle } from 'lucide-react';
import { Playground, btn, btnPrimary } from '../ui';
import { KubeError, applyYaml, createCluster, kubectl, request, settle, step } from './sim';

const Editor = lazy(() => import('../python/Editor'));

const STATUS_COLOUR = {
  Running: 'bg-emerald-500 text-white',
  Pending: 'bg-slate-400 text-white',
  ContainerCreating: 'bg-sky-500 text-white',
  Terminating: 'bg-slate-300 text-slate-700 line-through',
  ImagePullBackOff: 'bg-amber-500 text-white',
  CrashLoopBackOff: 'bg-red-500 text-white',
  CreateContainerConfigError: 'bg-amber-600 text-white',
};

/** Nodes with their pods, plus deployments and services, redrawn on every tick. */
function ClusterView({ cluster, onRequest, lastRequest }) {
  const unscheduled = cluster.pods.filter((p) => !p.node);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {cluster.nodes.map((n) => (
          <div key={n.name} className="rounded-xl border border-line bg-surface-2 p-2 min-h-[7rem]">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-subtle mb-1.5">
              <Server size={12} /> {n.name}
            </div>
            <div className="flex flex-wrap gap-1">
              {cluster.pods
                .filter((p) => p.node === n.name)
                .map((p) => (
                  <span key={p.name} title={`${p.name} · ${p.status} · ${p.image}`} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_COLOUR[p.status] || 'bg-slate-400 text-white'} ${lastRequest === p.name ? 'ring-2 ring-accent' : ''}`}>
                    {p.labels.app || p.name.split('-')[0]}
                    {p.image.includes(':') ? `:${p.image.split(':').pop()}` : ''}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
      {unscheduled.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-300">
          Not scheduled ({unscheduled.length}): {unscheduled.map((p) => `${p.name}${p.reason ? ` (${p.reason})` : ''}`).join(', ')}
        </p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        {Object.entries(STATUS_COLOUR).map(([s, cls]) => (
          <span key={s} className="inline-flex items-center gap-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${cls.split(' ')[0]}`} /> {s}
          </span>
        ))}
      </div>
      {Object.values(cluster.services).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.values(cluster.services).map((s) => (
            <button key={s.name} type="button" onClick={() => onRequest(s.name)} className={`${btn} !px-3 !py-1.5 !text-xs`}>
              <Send size={12} /> Send a request to service/{s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Keeps a simulated cluster ticking and re-renders on every change. */
function useCluster(setup) {
  const ref = useRef(null);
  if (!ref.current) {
    ref.current = createCluster();
    if (setup) {
      applyYaml(ref.current, setup);
      settle(ref.current, 8);
    }
  }
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  useEffect(() => {
    const id = setInterval(() => {
      step(ref.current);
      bump();
    }, 800);
    return () => clearInterval(id);
  }, []);
  const reset = () => {
    ref.current = createCluster();
    if (setup) {
      applyYaml(ref.current, setup);
      settle(ref.current, 8);
    }
    bump();
  };
  return [ref.current, bump, reset];
}

/**
 * A practice cluster: a kubectl terminal, an optional YAML editor (used by "kubectl apply -f"),
 * and a live view of nodes, pods and services.
 */
export function ClusterLab({ title = 'Practice cluster', hint, setup, yaml: initialYaml, suggestions = [], onState }) {
  const [cluster, bump, reset] = useCluster(setup);
  const [manifest, setManifest] = useState(initialYaml || '');
  const [line, setLine] = useState('');
  const [history, setHistory] = useState([]);
  const [log, setLog] = useState([{ kind: 'info', text: 'A 3-node practice cluster (Kubernetes v1.36). Type "help" for the commands you can use.' }]);
  const [cursor, setCursor] = useState(-1);
  const [lastRequest, setLastRequest] = useState(null);
  const out = useRef(null);

  useEffect(() => {
    if (out.current) out.current.scrollTop = out.current.scrollHeight;
  }, [log]);
  useEffect(() => {
    onState?.(cluster);
  });

  const run = (cmd) => {
    if (!cmd.trim()) return;
    setHistory((h) => [...h, cmd]);
    setCursor(-1);
    if (cmd.trim() === 'clear') {
      setLog([]);
      return;
    }
    let entry;
    try {
      entry = { kind: 'out', text: kubectl(cluster, cmd, manifest) };
    } catch (e) {
      entry = { kind: 'err', text: e instanceof KubeError ? e.message : `error: ${e.message}` };
    }
    setLog((l) => [...l, { kind: 'cmd', text: `$ ${cmd}` }, entry].slice(-120));
    bump();
  };

  const sendRequest = (svc) => {
    const r = request(cluster, svc);
    setLastRequest(r.pod?.name || null);
    setLog((l) => [...l, { kind: 'cmd', text: `$ curl http://${svc}` }, r.error ? { kind: 'err', text: r.error } : { kind: 'out', text: `200 OK: answered by pod ${r.pod.name} (${r.pod.image}) on ${r.pod.node}` }]);
  };

  return (
    <Playground title={title} hint={hint}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="min-w-0 space-y-3">
          {initialYaml !== undefined && (
            <div className="rounded-xl overflow-hidden border border-line">
              <div className="px-3 py-1.5 border-b border-line text-[11px] font-bold uppercase tracking-wider text-subtle bg-surface-2">manifest.yaml (used by kubectl apply -f)</div>
              <Suspense fallback={<pre className="m-0 p-3 bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] whitespace-pre-wrap">{manifest}</pre>}>
                <Editor value={manifest} onChange={setManifest} language="yaml" label="Kubernetes manifest" />
              </Suspense>
            </div>
          )}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0c0f]">
            <pre ref={out} className="m-0 h-52 overflow-auto px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap [font-variant-ligatures:none]" aria-live="polite">
              {log.map((l, i) => (
                <div key={i} className={l.kind === 'cmd' ? 'text-[#7dd3fc]' : l.kind === 'err' ? 'text-amber-300' : l.kind === 'info' ? 'text-white/40 italic' : 'text-[#d6f5f0]'}>
                  {l.text}
                </div>
              ))}
            </pre>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(line);
                setLine('');
              }}
              className="flex items-center gap-2 px-3 py-2 border-t border-white/10"
            >
              <TerminalSquare size={14} className="text-[#5eead4] shrink-0" />
              <input
                value={line}
                onChange={(e) => setLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' && history.length) {
                    e.preventDefault();
                    const n = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
                    setCursor(n);
                    setLine(history[n]);
                  }
                }}
                placeholder="kubectl get pods"
                spellCheck={false}
                autoCapitalize="off"
                aria-label="kubectl command"
                className="flex-1 bg-transparent outline-none font-mono text-[13px] text-[#d6f5f0] [font-variant-ligatures:none]"
              />
              <button type="submit" className="text-[#5eead4]" aria-label="Run command">
                <Play size={14} />
              </button>
            </form>
          </div>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => run(s)} className="px-2 py-1 rounded-lg bg-surface-2 border border-line font-mono text-[11px] text-muted hover:text-fg">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <ClusterView cluster={cluster} onRequest={sendRequest} lastRequest={lastRequest} />
          <button
            type="button"
            onClick={() => {
              reset();
              setLog([{ kind: 'info', text: 'Cluster reset.' }]);
            }}
            className={`${btn} !px-3 !text-xs mt-3`}
          >
            <RotateCcw size={13} /> Reset cluster
          </button>
        </div>
      </div>
    </Playground>
  );
}

// ---------------------------------------------------------------- exercises

const readSaved = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key, v) => {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
};

function Results({ results }) {
  const all = results.every((r) => r.passed);
  return (
    <ul className="mt-3 space-y-1.5">
      {results.map((r) => (
        <li key={r.name} className="flex items-start gap-2 text-sm">
          {r.passed ? <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> : <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
          <span>
            <span className="font-semibold text-fg">{r.name}</span>
            {!r.passed && r.message && <span className="block text-xs text-muted font-mono break-words">{r.message}</span>}
          </span>
        </li>
      ))}
      <li className={`text-sm font-bold ${all ? 'text-accent' : 'text-amber-600 dark:text-amber-300'}`}>{all ? 'All checks passed. Well done!' : 'Not quite yet. Keep going.'}</li>
    </ul>
  );
}

/** Run named checks: each returns true, or a message saying what is wrong. */
const runChecks = (cluster, checks) =>
  checks.map(({ name, test }) => {
    try {
      const r = test(cluster);
      return { name, passed: r === true, message: r === true ? '' : r || 'not yet' };
    } catch (e) {
      return { name, passed: false, message: e.message };
    }
  });

/**
 * YAML exercise: the manifest is applied to a fresh cluster (after `ex.setup`), the cluster settles,
 * then `ex.checks` run. Command exercises (`ex.mode === 'commands'`) check the live practice cluster.
 */
export function K8sExercise({ ex, storageKey, passed, onPass }) {
  const [manifest, setManifest] = useState(() => readSaved(storageKey) ?? ex.starter ?? '');
  const [results, setResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const live = useRef(null);

  const check = () => {
    let res;
    if (ex.mode === 'commands') {
      const copy = structuredClone(live.current);
      settle(copy, 30);
      res = runChecks(copy, ex.checks);
    } else {
      const c = createCluster();
      try {
        if (ex.setup) applyYaml(c, ex.setup);
        applyYaml(c, manifest);
        settle(c, 40);
        res = [{ name: 'kubectl apply succeeds', passed: true }, ...runChecks(c, ex.checks)];
      } catch (e) {
        res = [{ name: 'kubectl apply succeeds', passed: false, message: e.message }];
      }
    }
    setResults(res);
    if (res.every((r) => r.passed)) onPass?.();
  };

  const header = (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-surface-2/60">
      <span className="eyebrow text-accent">Exercise · Kubernetes</span>
      {(passed || results?.every((r) => r.passed)) && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold">
          <CheckCircle2 size={12} /> Solved
        </span>
      )}
    </div>
  );

  const buttons = (
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={check} className={btnPrimary}>
        {ex.mode === 'commands' ? 'Check the cluster' : 'Apply and check'}
      </button>
      {ex.mode !== 'commands' && (
        <button
          type="button"
          onClick={() => {
            setManifest(ex.starter);
            setResults(null);
          }}
          className={`${btn} !px-3`}
        >
          <RotateCcw size={13} /> Reset
        </button>
      )}
      {ex.hint && (
        <button type="button" onClick={() => setShowHint((s) => !s)} className={`${btn} !px-3`}>
          <Lightbulb size={13} /> Hint
        </button>
      )}
      {ex.solution && ex.mode !== 'commands' && (
        <button
          type="button"
          onClick={() => {
            setManifest(ex.solution);
            setResults(null);
          }}
          className={`${btn} !px-3`}
        >
          <Eye size={13} /> Show solution
        </button>
      )}
    </div>
  );

  if (ex.mode === 'commands') {
    return (
      <div className="my-6 rounded-2xl border border-accent/40 bg-surface shadow-soft overflow-hidden">
        {header}
        <div className="px-4 pb-4">
          <ClusterLab title="Your cluster" setup={ex.setup} suggestions={ex.suggestions || []} onState={(c) => (live.current = c)} />
          {buttons}
          {showHint && <p className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-fg font-mono">{ex.hint}</p>}
          {results && <Results results={results} />}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-accent/40 bg-surface shadow-soft overflow-hidden">
      {header}
      <div className="p-4">
        <div className="rounded-xl overflow-hidden border border-line">
          <Suspense fallback={<pre className="m-0 p-3 bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] whitespace-pre-wrap">{manifest}</pre>}>
            <Editor
              value={manifest}
              onChange={(v) => {
                setManifest(v);
                save(storageKey, v);
                setResults(null);
              }}
              onRun={check}
              language="yaml"
              label="Kubernetes manifest"
            />
          </Suspense>
        </div>
        {buttons}
        {showHint && <p className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-fg">{ex.hint}</p>}
        {results && <Results results={results} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- containers vs virtual machines

export function ContainersVsVms() {
  const [mode, setMode] = useState('containers');
  const vm = mode === 'vms';
  const apps = ['Portfolio', 'Chat API', 'Reports'];
  return (
    <Playground title="Virtual machines vs containers" hint="Switch between the two to see what each app carries with it.">
      <div className="flex gap-2 mb-4">
        {['vms', 'containers'].map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`${btn} !px-3 !py-1.5 !text-xs ${mode === m ? '!border-accent !text-accent' : ''}`}>
            {m === 'vms' ? 'Virtual machines' : 'Containers'}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-line overflow-hidden text-center text-xs font-bold">
        <div className="grid grid-cols-3 gap-2 p-2">
          {apps.map((a) => (
            <div key={a} className="space-y-1">
              <div className="p-2 rounded-lg bg-accent text-bg">{a}</div>
              <div className="p-1.5 rounded-lg bg-accent/20 text-fg">Libraries</div>
              {vm && <div className="p-3 rounded-lg bg-amber-400/30 text-fg">Full guest OS (GBs, slow to boot)</div>}
            </div>
          ))}
        </div>
        <div className="p-2 bg-surface-2 border-t border-line text-fg">{vm ? 'Hypervisor' : 'Container runtime (shares one OS kernel)'}</div>
        <div className="p-2 bg-surface-2 border-t border-line text-fg">Host operating system and hardware</div>
      </div>
      <p className="mt-3 text-sm text-muted">
        {vm
          ? 'Each VM carries a whole operating system: heavy (gigabytes) and slow to start (minutes).'
          : 'Containers share the host\'s kernel and carry only the app and its libraries: light (megabytes) and quick to start (seconds). Kubernetes runs and manages many of them.'}
      </p>
    </Playground>
  );
}
