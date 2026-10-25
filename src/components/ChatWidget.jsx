import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Bot, Loader2, RotateCcw, X } from 'lucide-react';
import { profile } from '../data/content';

// AI assistant for AR, R2R, collections and automation questions. Answers come from Claude via
// the Cloudflare Worker in chat-worker/ (the API key lives there, never in the site). The widget
// only renders when VITE_CHAT_API_URL is set at build time.
const API_URL = import.meta.env.VITE_CHAT_API_URL;
const MAX_HISTORY = 20; // must match the Worker's MAX_MESSAGES
const MAX_CHARS = 2000;

const GREETING =
  "Hi! I'm Shivam's AI assistant. Ask me anything about **accounts receivable**, **record to report**, **collections strategy**, or how to **automate** these processes for better productivity and profit.";

const SUGGESTIONS = [
  'How can I reduce DSO?',
  'How is CEI calculated, and what is a good score?',
  'How do I automate cash application?',
  'How should I design a champion-challenger test?',
];

/** Minimal, safe Markdown: headings, bullet and numbered lists, **bold**, _italic_, `code`. */
function inline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={key} className="font-bold text-fg">{p.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(p)) return <code key={key} className="px-1 py-0.5 rounded bg-surface-2 font-mono text-[0.85em]">{p.slice(1, -1)}</code>;
    if (/^_[^_]+_$/.test(p)) return <em key={key}>{p.slice(1, -1)}</em>;
    return <Fragment key={key}>{p}</Fragment>;
  });
}

function Markdown({ text }) {
  const blocks = [];
  let list = null;
  text.split('\n').forEach((raw) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        list = { type, items: [] };
        blocks.push(list);
      }
      list.items.push(bullet ? bullet[1] : numbered[2]);
      return;
    }
    list = null;
    if (!line.trim()) return;
    const heading = line.match(/^#{1,4}\s+(.*)/);
    blocks.push(heading ? { type: 'h', text: heading[1] } : { type: 'p', text: line });
  });

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <p key={i} className="font-extrabold text-fg">{inline(b.text, i)}</p>;
        if (b.type === 'p') return <p key={i}>{inline(b.text, i)}</p>;
        const List = b.type === 'ul' ? 'ul' : 'ol';
        return (
          <List key={i} className={`pl-5 space-y-1 ${b.type === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-accent`}>
            {b.items.map((item, j) => (
              <li key={j}>{inline(item, `${i}-${j}`)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role, content, error? }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!API_URL) return null;

  const send = async (text) => {
    const question = text.trim().slice(0, MAX_CHARS);
    if (!question || busy) return;
    // Keep only completed question-and-answer pairs: a question whose answer failed is dropped
    // with it, so turns always alternate as the API requires.
    const completed = [];
    for (let i = 0; i + 1 < messages.length; i += 2) {
      const [q, a] = [messages[i], messages[i + 1]];
      if (q.role === 'user' && a.role === 'assistant' && !a.error && a.content) completed.push(q, a);
    }
    const history = [...completed, { role: 'user', content: question }];
    setMessages([...messages, { role: 'user', content: question }, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    // Send the most recent turns, starting from a visitor message as the Worker requires.
    let recent = history.slice(-MAX_HISTORY);
    if (recent[0]?.role !== 'user') recent = recent.slice(1);

    const update = (content, error = false) =>
      setMessages((all) => [...all.slice(0, -1), { role: 'assistant', content, error }]);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recent.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        update(body.error || 'Sorry, something went wrong. Please try again.', true);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        const errorAt = answer.indexOf('\u0000');
        if (errorAt !== -1) {
          update(answer.slice(errorAt + 1) || 'Sorry, something went wrong.', true);
          return;
        }
        update(answer);
      }
      if (!answer.trim()) update('Sorry, I did not get an answer. Please try again.', true);
    } catch {
      update("Couldn't reach the assistant. Check your connection and try again.", true);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Ask my AI assistant"
            className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[95] flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-fg text-bg font-bold shadow-soft"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-accent/50 animate-ping opacity-30" />
            <Bot size={20} />
            <span className="text-sm">Ask my AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="AI assistant chat"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed z-[95] inset-x-2 bottom-2 h-[85svh] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[min(640px,calc(100svh-3rem))] flex flex-col rounded-3xl bg-surface border border-line shadow-2xl overflow-hidden origin-bottom-right"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <img src={profile.photo} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/40" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-fg">Shivam&apos;s AI assistant</div>
                <div className="text-[11px] text-subtle font-semibold truncate">AR · R2R · Collections · Automation</div>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  disabled={busy}
                  aria-label="Start a new chat"
                  title="New chat"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-fg hover:bg-surface-2 disabled:opacity-40"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-fg hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm leading-relaxed" aria-live="polite">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3 text-muted">
                <Markdown text={GREETING} />
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-left text-xs font-semibold px-3 py-2 rounded-xl border border-line text-fg hover:border-accent/50 hover:bg-accent/5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-tr-sm bg-fg text-bg px-4 py-2.5 whitespace-pre-wrap">
                    {m.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-3 ${
                      m.error ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30' : 'bg-surface-2 text-muted'
                    }`}
                  >
                    {m.content ? (
                      m.error ? m.content : <Markdown text={m.content} />
                    ) : (
                      <span className="inline-flex items-center gap-2 text-subtle">
                        <Loader2 size={14} className="animate-spin" /> Thinking…
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-line p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface-2 px-3 py-2 focus-within:border-accent/60">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about receivables, R2R, collections…"
                  aria-label="Your question"
                  className="flex-1 resize-none bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none max-h-32 py-1.5"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="w-9 h-9 shrink-0 rounded-xl bg-fg text-bg flex items-center justify-center disabled:opacity-30"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-subtle text-center">
                AI answers can be wrong and aren&apos;t professional advice.{' '}
                <a href="privacy.html" className="underline hover:text-muted">Privacy</a>
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
