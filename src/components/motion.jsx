import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useSpring } from 'motion/react';

export const ease = [0.22, 1, 0.36, 1];

/** Fades and lifts children into view once they scroll on screen. */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const stagger = (step = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/** Counts up from 0 to `value` when it first enters the viewport. */
export function Counter({ value, decimals = 0, suffix = '', prefix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/** Card with a soft glow that follows the cursor. */
export function Spotlight({ as = 'div', className = '', children, ...rest }) {
  const Tag = as;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={onMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Element that leans toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.25, className }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={reset} className={className}>
      {children}
    </motion.div>
  );
}

/** Splits text into words that slide up from a mask, one after another. */
export function SplitWords({ text, className = '', wordClassName = '', delay = 0, step = 0.07 }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease, delay: delay + i * step }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, children, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && (
        <Reveal className="eyebrow text-accent mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-accent/60" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal delay={0.05} as="h2" className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg mb-5">
        {title}
      </Reveal>
      {children && (
        <Reveal delay={0.1} as="p" className="text-muted font-medium leading-relaxed max-w-2xl">
          {children}
        </Reveal>
      )}
    </div>
  );
}
