import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { profile } from '../data/content';
import { Counter, Magnetic, SplitWords, ease } from './motion';

function TiltPhoto() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease, delay: 0.3 }}
      className="relative [perspective:1000px]"
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry }} className="relative [transform-style:preserve-3d]">
        {/* Spinning gradient ring */}
        <div className="ring-spin absolute -inset-[3px] rounded-[3.2rem] opacity-70 blur-[1px]" />
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[3rem] overflow-hidden bg-surface-2 border-[6px] border-surface shadow-2xl">
          <img src={profile.photo} alt="Shivam Soni - Finance Manager" className="w-full h-full object-cover scale-105" />
        </div>

        {/* Floating stat cards */}
        <motion.div
          style={{ translateZ: 60 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease }}
          className="absolute -right-6 md:-right-14 bottom-10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass border border-line shadow-soft rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-accent/12 text-accent flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-fg leading-none">
                <Counter value={15} suffix="%" />
              </div>
              <div className="eyebrow text-subtle mt-1 !text-[8px]">CEI Growth</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ translateZ: 40 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 0.8, ease }}
          className="absolute -left-6 md:-left-12 top-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="glass border border-line shadow-soft rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-accent-2/12 text-accent-2 flex items-center justify-center">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-fg leading-none">
                <Counter value={7} suffix="+" />
              </div>
              <div className="eyebrow text-subtle mt-1 !text-[8px]">Years in Credit</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero({ onConnect }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] flex items-center pt-32 pb-24 px-6 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 dot-grid opacity-60 -z-10" />
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-[120px] -z-10"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 30, 0], y: [0, 50, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-accent-2/15 blur-[130px] -z-10"
      />

      <motion.div style={{ y, opacity: fade }} className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-line bg-surface/70 eyebrow text-muted mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {profile.role}
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold text-fg leading-[0.98] mb-8 tracking-tighter">
            <SplitWords text="Data-Driven" delay={0.35} />
            <br />
            <SplitWords text="Recovery" delay={0.5} wordClassName="text-gradient" />{' '}
            <SplitWords text="Control." delay={0.6} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.85 }}
            className="text-lg text-muted mb-10 leading-relaxed font-medium max-w-2xl"
          >
            7+ years in unsecured consumer credit across banking, NBFC, and fintech environments. Specializing in transforming AR from a cost
            center into a{' '}
            <span className="text-fg font-bold underline decoration-accent/40 decoration-2 underline-offset-4">strategic cash-flow engine</span>{' '}
            through treatment strategy design, champion-challenger testing, and SQL-driven portfolio decisioning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1 }}
            className="flex flex-wrap gap-4"
          >
            <Magnetic>
              <button
                type="button"
                onClick={onConnect}
                className="group relative overflow-hidden flex items-center gap-2 bg-fg text-bg px-8 py-4 rounded-xl font-bold shadow-soft"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent to-accent-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Contact Shivam</span>
                <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnetic>
            <Magnetic>
              <a
                href="#lab"
                className="flex items-center bg-surface text-fg border border-line px-8 py-4 rounded-xl font-bold hover:border-line-strong transition-colors"
              >
                Explore Analytical Lab
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <TiltPhoto />
        </div>
      </motion.div>

      <motion.a
        href="#impact"
        aria-label="Scroll to metrics"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-subtle hover:text-fg transition-colors"
      >
        <span className="eyebrow !text-[9px]">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDown size={16} />
        </motion.span>
      </motion.a>
    </section>
  );
}
