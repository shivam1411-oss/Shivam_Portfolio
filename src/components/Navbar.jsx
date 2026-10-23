import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { FileText, Menu, X } from 'lucide-react';
import { navLinks, profile } from '../data/content';
import ThemeToggle from './ThemeToggle';

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const ids = navLinks.map((l) => l.id);

export default function Navbar({ onConnect, onResume }) {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(ids);

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pt-3"
    >
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-500 ${
          scrolled || menuOpen ? 'glass border border-line shadow-soft' : 'border border-transparent'
        }`}
      >
        <div className={`px-4 sm:px-5 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
          <a href="#top" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-line"
            >
              <img src={profile.photo} alt="" className="w-full h-full object-cover" />
            </motion.div>
            <div className="hidden min-[400px]:flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-fg uppercase">{profile.name}</span>
              <span className="text-[9px] font-bold text-subtle uppercase tracking-widest">{profile.tagline}</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative px-4 py-2 eyebrow transition-colors ${active === link.id ? 'text-fg' : 'text-subtle hover:text-muted'}`}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-surface-2 border border-line"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResume}
              className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl border border-line bg-surface text-[10px] font-bold tracking-widest text-muted hover:text-fg hover:border-line-strong transition-colors"
            >
              <FileText size={14} /> GET RESUME
            </button>
            <ThemeToggle />
            <motion.button
              type="button"
              onClick={onConnect}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="h-10 px-5 rounded-xl bg-fg text-bg text-[10px] font-extrabold uppercase tracking-widest shadow-soft"
            >
              Connect
            </motion.button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-line bg-surface text-fg"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              key="mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 flex flex-col gap-1 border-t border-line">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => setMenuOpen(false)}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="py-3 text-xs font-extrabold uppercase tracking-widest text-muted hover:text-fg"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onResume();
                  }}
                  className="py-3 text-left text-xs font-extrabold uppercase tracking-widest text-muted hover:text-fg flex items-center gap-2"
                >
                  <FileText size={14} /> Get Resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-accent to-accent-2"
      />
    </motion.nav>
  );
}
