import { motion } from 'motion/react';
import { ArrowUpRight, Download } from 'lucide-react';
import { contacts, profile } from '../data/content';
import { contactIcons } from './icons';
import { Reveal, SectionHeading, fadeUp, stagger } from './motion';

/** Every way to reach Shivam, on the page itself (the Connect pop-up shows the same details). */
export default function Contact({ onResume }) {
  return (
    <section id="contact" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Contact" title="Let's talk">
            For conversations about collection strategy, credit risk and portfolio analytics. Email is the quickest way to reach me.
          </SectionHeading>
          <Reveal delay={0.15} as="p" className="eyebrow text-subtle mt-6">
            {profile.location} · {profile.relocation}
          </Reveal>
          <Reveal delay={0.2}>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResume}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-fg text-bg font-bold text-sm shadow-soft"
            >
              <Download size={16} /> Get Resume
            </motion.button>
          </Reveal>
        </div>

        <motion.div
          variants={stagger(0.06, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {contacts.map((c) => {
            const Icon = contactIcons[c.key];
            return (
              <motion.a
                key={c.key}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noreferrer' : undefined}
                className="group flex items-center gap-4 p-5 rounded-2xl bg-surface border border-line shadow-soft hover:border-accent/40 transition-colors"
              >
                <span className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block eyebrow text-subtle mb-0.5">{c.label}</span>
                  <span className="block text-fg font-bold text-sm truncate">{c.value}</span>
                </span>
                <ArrowUpRight size={16} className="text-subtle opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
