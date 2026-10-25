import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { profile } from '../data/content';
import { createMatrix, currentMatrixTheme, randomGlyph } from './codeMatrix';
import ThemeToggle from './ThemeToggle';
import { ease } from './motion';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Full-screen code matrix running behind the welcome screen. */
function MatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const cell = isTouch ? 20 : 16;
    const maxDpr = isTouch ? 1 : 1.5;
    const glow = isTouch ? 0 : 8;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const matrix = createMatrix(cell);
    let dpr = 1;
    let w = 0;
    let h = 0;
    let frame = 0;
    let tickCount = 0;

    const resize = () => {
      if (isTouch && w === window.innerWidth && Math.abs(h - window.innerHeight) < 160) return;
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      matrix.resize(w, h);
    };
    resize();

    const tick = () => {
      // ~30fps is plenty for falling code and halves the drawing work.
      if (tickCount++ % 2 === 0) {
        matrix.step();
        matrix.step();
        matrix.drawFull(ctx, currentMatrixTheme(), glow, dpr);
      }
      frame = requestAnimationFrame(tick);
    };

    if (reduceMotion()) {
      matrix.drawFull(ctx, currentMatrixTheme(), 0, dpr);
    } else {
      frame = requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full" />;
}

/** Text that decodes from random code glyphs into the real characters, left to right. */
function Decode({ text, delay = 0, className }) {
  const [out, setOut] = useState(() => (reduceMotion() ? text : ''));

  useEffect(() => {
    if (reduceMotion()) return undefined;
    let step = 0;
    let id;
    const start = setTimeout(() => {
      id = setInterval(() => {
        step++;
        const done = step;
        setOut(
          text
            .split('')
            .map((c, i) => (c === ' ' ? ' ' : i < done ? c : i < done + 6 ? randomGlyph() : ''))
            .join('')
        );
        if (done >= text.length) clearInterval(id);
      }, 28);
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, delay]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out || ' '}</span>
    </span>
  );
}

const quoteParts = [
  { t: 'Where ' },
  { t: 'finance', hl: true },
  { t: ' meets ' },
  { t: 'tech', hl: true },
  { t: ', every rupee recovered is engineered, not chased.' },
];

/**
 * Welcome screen shown on arrival: code matrix in the background, name and quote
 * up front. Clicking (or pressing Enter) opens a growing portal from that point
 * that reveals the site underneath, then the screen removes itself.
 */
export default function Intro({ onEnter, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const r = useMotionValue(0);
  const edge = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, #000 ${edge}px)`;
  const ringSize = useMotionTemplate`${edge}px`;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const enter = (px, py) => {
    if (leaving) return;
    setLeaving(true);
    onEnter();

    if (reduceMotion()) {
      setTimeout(onDone, 300);
      return;
    }
    x.set(px);
    y.set(py);
    const max = Math.hypot(Math.max(px, window.innerWidth - px), Math.max(py, window.innerHeight - py)) + 120;
    animate(r, max, { duration: 0.6, ease: [0.7, 0, 0.3, 1] });
    animate(edge, max + 120, { duration: 0.6, ease: [0.7, 0, 0.3, 1], onComplete: onDone });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('[data-no-enter]')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enter(window.innerWidth / 2, window.innerHeight / 2);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      onClick={(e) => {
        if (e.target.closest('[data-no-enter]')) return;
        enter(e.clientX, e.clientY);
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving && reduceMotion() ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      style={leaving && !reduceMotion() ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      className="fixed inset-0 z-[80] bg-bg cursor-pointer select-none overflow-hidden"
    >
      <MatrixBackground />

      {/* Soft spotlight behind the text so it stays readable over the code */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, color-mix(in oklab, var(--bg) 94%, transparent) 0%, color-mix(in oklab, var(--bg) 70%, transparent) 45%, transparent 80%)',
        }}
      />

      {/* z-20: the full-screen content below is z-10 and would otherwise swallow clicks on the toggle */}
      <div data-no-enter className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.05 }}
          className="font-mono text-xs sm:text-sm text-accent mb-6 sm:mb-8"
        >
          <span className="text-subtle">~/portfolio $</span> ./welcome<span className="caret" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-accent/50 ring-offset-4 ring-offset-bg mb-6 sm:mb-8 shadow-soft"
        >
          <img src={profile.photo} alt="" className="w-full h-full object-cover" />
        </motion.div>

        <h1 className="font-mono font-semibold text-[2.6rem] leading-none sm:text-7xl md:text-8xl tracking-tight text-fg mb-4 sm:mb-5">
          <Decode text={profile.name.toUpperCase()} delay={0.2} />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="eyebrow text-muted mb-8 sm:mb-10"
        >
          Collection Strategy &amp; Credit Risk Leader
        </motion.p>

        <motion.blockquote
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.6 } } }}
          className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-fg mb-10 sm:mb-12"
        >
          <span className="text-accent">“</span>
          {quoteParts.flatMap((part, pi) =>
            part.t.split(/(\s+)/).map((word, wi) =>
              word.trim() ? (
                <motion.span
                  key={`${pi}-${wi}`}
                  variants={{ hidden: { opacity: 0, y: 10, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease } } }}
                  className={`inline-block ${part.hl ? 'text-gradient' : ''}`}
                >
                  {word}
                </motion.span>
              ) : (
                ' '
              )
            )
          )}
          <span className="text-accent">”</span>
        </motion.blockquote>

        <motion.button
          type="button"
          autoFocus
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 1.1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            enter(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
          }}
          className="group relative flex items-center gap-2 px-8 py-4 rounded-full bg-fg text-bg font-bold shadow-soft"
        >
          <span className="absolute inset-0 rounded-full ring-2 ring-accent/60 animate-ping opacity-40" />
          Enter Portfolio
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-5 text-[11px] sm:text-xs text-subtle font-medium"
        >
          {window.matchMedia('(pointer: coarse)').matches ? 'Tap anywhere to enter' : 'Click anywhere or press Enter'}
        </motion.p>
      </div>

      {/* Glowing rim of the portal while it opens */}
      {leaving && !reduceMotion() && (
        <motion.div
          aria-hidden
          style={{ left: x, top: y, width: ringSize, height: ringSize, translateX: '-50%', translateY: '-50%' }}
          className="pointer-events-none absolute rounded-full"
        >
          <div className="w-full h-full rounded-full shadow-[0_0_60px_10px_var(--glow)] border border-accent/40" style={{ transform: 'scale(2)' }} />
        </motion.div>
      )}
    </motion.div>
  );
}
