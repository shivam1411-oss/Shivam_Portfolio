// Shared layout for the Terms and Refund pages (same look as the privacy policy).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ThemeProvider } from '../theme/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import { Reveal, ease } from '../components/motion';
import { LEGAL } from './details';
import '../index.css';

export const A = ({ href, children }) => (
  <a href={href} className="underline hover:text-fg">
    {children}
  </a>
);

function LegalPage({ title, accent, sections }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-80 dot-grid opacity-60 -z-10" />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="flex items-center justify-between">
          <a href="index.html" className="group inline-flex items-center gap-2 eyebrow text-muted hover:text-fg transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
          </a>
          <ThemeToggle />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold text-fg mt-10 mb-3 tracking-tight"
        >
          {title} <span className="text-gradient">{accent}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="eyebrow text-subtle mb-12">
          Effective Date: {LEGAL.effective}
        </motion.p>
        <div className="space-y-5 text-muted leading-relaxed">
          {sections.map((s) => (
            <Reveal key={s.title} as="section" className="p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft [&_strong]:text-fg [&_li]:mt-2">
              <h2 className="text-xl font-extrabold text-fg mb-3">{s.title}</h2>
              {s.body}
            </Reveal>
          ))}
        </div>
        <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-subtle">
          <A href="terms.html">Terms of Use</A>
          <A href="refund.html">Refund &amp; Cancellation</A>
          <A href="privacy.html">Privacy Policy</A>
          <A href="learn.html">Learning Lab</A>
        </nav>
        <div className="mt-10 pt-8 border-t border-line text-center">
          <p className="text-[10px] text-subtle font-bold uppercase tracking-[0.2em]">© 2026 {LEGAL.owner}. All rights reserved.</p>
        </div>
      </div>
    </MotionConfig>
  );
}

export function renderLegal(props) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider>
        <LegalPage {...props} />
      </ThemeProvider>
    </StrictMode>
  );
}

/** Contact block used by both pages. */
export function ContactDetails() {
  return (
    <p className="mt-3 font-bold text-fg">
      {LEGAL.owner}
      <br />
      Email:{' '}
      <a href={`mailto:${LEGAL.email}`} className="underline hover:text-accent">
        {LEGAL.email}
      </a>
      {LEGAL.phone && (
        <>
          <br />
          Phone: {LEGAL.phone}
        </>
      )}
      {LEGAL.address && (
        <>
          <br />
          Address: {LEGAL.address}
        </>
      )}
    </p>
  );
}
