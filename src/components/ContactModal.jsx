import { motion } from 'motion/react';
import { ArrowUpRight, Download } from 'lucide-react';
import { contacts, profile } from '../data/content';
import { contactIcons } from './icons';
import Modal from './Modal';
import { fadeUp, stagger } from './motion';

export default function ContactModal({ open, onClose, onResume }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xl" label="Contact Shivam">
      <h2 className="text-3xl font-extrabold text-fg mb-2 pr-12">
        Let's <span className="text-gradient">Connect.</span>
      </h2>
      <p className="text-muted mb-2 text-sm font-medium">Collection strategy, credit risk and portfolio analytics leadership.</p>
      <p className="eyebrow text-subtle mb-8">
        {profile.location} · {profile.relocation}
      </p>

      <motion.div variants={stagger(0.06, 0.15)} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-2 border border-line hover:border-accent/40 transition-colors"
            >
              <span className="w-10 h-10 shrink-0 rounded-xl bg-surface border border-line flex items-center justify-center text-accent">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block eyebrow text-subtle mb-0.5">{c.label}</span>
                <span className="block text-fg font-bold text-xs truncate">{c.value}</span>
              </span>
              <ArrowUpRight size={16} className="text-subtle opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </motion.a>
          );
        })}
      </motion.div>

      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onClose();
          onResume();
        }}
        className="mt-6 w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-fg text-bg font-bold text-sm shadow-soft"
      >
        <Download size={16} /> Get Resume
      </motion.button>
    </Modal>
  );
}
