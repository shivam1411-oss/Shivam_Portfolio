import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { contacts, profile } from '../data/content';
import { contactIcons } from './icons';
import { Reveal, ease, stagger } from './motion';

export default function Footer({ onResume }) {
  return (
    <footer className="relative py-28 px-6 text-center border-t border-line overflow-hidden">
      <div className="glow-accent absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[60rem] h-[36rem] opacity-80 -z-10" />
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <motion.div whileHover={{ scale: 1.06, rotate: 3 }} className="w-20 h-20 rounded-full mx-auto mb-6 overflow-hidden ring-4 ring-surface shadow-soft">
            <img src={profile.photo} alt="Shivam Soni" className="w-full h-full object-cover" />
          </motion.div>
        </Reveal>
        <Reveal delay={0.05} as="h3" className="text-4xl md:text-6xl font-extrabold text-fg mb-3 tracking-tighter uppercase">
          {profile.name}
        </Reveal>
        <Reveal delay={0.1} as="p" className="text-[10px] font-extrabold text-subtle uppercase tracking-[0.5em] mb-12">
          {profile.tagline}
        </Reveal>

        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {contacts.map((c) => {
            const Icon = contactIcons[c.key];
            return (
              <motion.a
                key={c.key}
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noreferrer' : undefined}
                aria-label={c.label}
                title={c.label}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 shadow-soft transition-colors"
              >
                <Icon size={20} />
              </motion.a>
            );
          })}
        </motion.div>

        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={onResume}
            className="group relative text-xs font-extrabold text-muted hover:text-fg uppercase tracking-widest pb-1 transition-colors"
          >
            Get Resume
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-line" />
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-accent to-accent-2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </button>
          <a href="privacy.html" className="text-[10px] font-bold text-subtle hover:text-muted uppercase tracking-widest transition-colors">
            Privacy Policy
          </a>
          <div className="text-[10px] text-subtle font-bold uppercase tracking-[0.2em] mt-8">© 2026 Shivam Soni. All rights reserved. Built for the future of Finance.</div>
        </div>
      </div>

      <motion.a
        href="#top"
        aria-label="Back to top"
        whileHover={{ y: -4 }}
        className="absolute right-6 bottom-8 w-11 h-11 rounded-full border border-line bg-surface flex items-center justify-center text-muted hover:text-fg shadow-soft"
      >
        <ArrowUp size={18} />
      </motion.a>
    </footer>
  );
}
