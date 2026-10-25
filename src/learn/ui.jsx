import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, FileCode2, Lightbulb, MousePointerClick, TriangleAlert } from 'lucide-react';
import { glossary } from './glossary';
import { ease } from '../components/motion';

/** A glossary word: dotted underline, click or hover for a plain-English definition. */
export function Term({ id, children }) {
  const entry = glossary[id];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  if (!entry) return children;
  return (
    <span ref={ref} className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-semibold text-fg underline decoration-dotted decoration-accent underline-offset-4 cursor-help"
      >
        {children ?? entry.term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            className="absolute z-40 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 max-w-[80vw] p-3 rounded-xl bg-fg text-bg text-xs leading-relaxed font-medium shadow-soft text-left"
          >
            <span className="block font-extrabold mb-1">{entry.term}</span>
            {entry.def}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const KEYWORDS =
  /^(import|from|export|default|const|let|function|return|if|else|for|of|new|await|async|try|catch|SELECT|FROM|WHERE|GROUP|BY|ORDER|JOIN|ON|AND|AS|SUM|CASE|WHEN|THEN|END|ELSE|run|uses|with|on|jobs|steps)$/;

/** Very small highlighter: comments, strings and keywords. Builds elements, never HTML strings. */
function highlight(line, li) {
  const parts = line.split(/(\/\/.*$|--.*$|#\s.*$|'[^']*'|"[^"]*"|`[^`]*`|\b[A-Za-z_]+\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    const key = `${li}-${i}`;
    if (/^(\/\/|--|#\s)/.test(p)) return <span key={key} className="text-white/40 italic">{p}</span>;
    if (/^['"`]/.test(p)) return <span key={key} className="text-[#fcd28d]">{p}</span>;
    if (KEYWORDS.test(p)) return <span key={key} className="text-[#9196f6] font-semibold">{p}</span>;
    return <span key={key}>{p}</span>;
  });
}

/** Code excerpt with the file it comes from and a copy button. */
export function Code({ file, children, note }) {
  const code = children.replace(/^\n/, '').replace(/\s+$/, '');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <figure className="my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#0d1014] text-white shadow-soft">
      <figcaption className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
        <span className="flex items-center gap-2 font-mono text-[12px] text-white/70 min-w-0">
          <FileCode2 size={14} className="shrink-0 text-[#5eead4]" />
          <span className="truncate">{file}</span>
        </span>
        <button type="button" onClick={copy} className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white transition-colors">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed font-mono text-[#d6f5f0]">
        <code>
          {code.split('\n').map((line, i) => (
            <div key={i}>{line ? highlight(line, i) : ' '}</div>
          ))}
        </code>
      </pre>
      {note && <div className="px-4 py-3 border-t border-white/10 text-xs text-white/60 leading-relaxed">{note}</div>}
    </figure>
  );
}

export function Callout({ tone = 'tip', title, children }) {
  const warn = tone === 'warn';
  const Icon = warn ? TriangleAlert : Lightbulb;
  return (
    <div className={`my-5 flex gap-3 p-4 rounded-2xl border ${warn ? 'bg-amber-400/10 border-amber-400/30' : 'bg-accent/10 border-accent/25'}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${warn ? 'text-amber-500' : 'text-accent'}`} />
      <div className="text-sm leading-relaxed text-fg">
        {title && <div className="font-extrabold mb-1">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/** Frame around an interactive playground. */
export function Playground({ title, hint, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease }}
      className="my-6 rounded-2xl border border-accent/30 bg-surface shadow-soft overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-3 border-b border-line bg-accent/5">
        <MousePointerClick size={15} className="text-accent" />
        <span className="eyebrow text-accent">Try it</span>
        <span className="text-sm font-bold text-fg">{title}</span>
      </div>
      <div className="p-5">
        {hint && <p className="text-xs text-muted mb-4 leading-relaxed">{hint}</p>}
        {children}
      </div>
    </motion.div>
  );
}

/** Labelled range slider used across the playgrounds. */
export function Slider({ label, value, min, max, step = 1, onChange, format = (v) => v }) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-xs font-semibold text-muted mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-fg tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer accent-[var(--accent)]"
      />
    </label>
  );
}

/** Small segmented control. */
export function Choice({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-surface-2 border border-line">
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const text = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${active ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg'}`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

export const btn =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-line bg-surface-2 text-fg hover:border-line-strong transition-colors disabled:opacity-50';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-fg text-bg hover:opacity-90 transition-opacity disabled:opacity-50';
