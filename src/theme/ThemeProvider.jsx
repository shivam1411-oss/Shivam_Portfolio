import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const readStored = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export function ThemeProvider({ children }) {
  // index.html sets the class before paint; start from whatever it decided.
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Follow the OS setting until the visitor picks a theme explicitly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (readStored()) return;
      const next = e.matches ? 'dark' : 'light';
      applyTheme(next);
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(
    (event) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable: theme still switches for this visit */
      }

      // Flip the theme in one go. Per-element colour transitions are paused for the switch so the
      // new theme appears crisply instead of every button, card and border fading separately.
      const switchTo = () => {
        const root = document.documentElement;
        root.classList.add('theme-switching');
        applyTheme(next);
        flushSync(() => setTheme(next));
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
      };

      // The circular reveal needs full-page snapshots, which are slow on phones: switch instantly there.
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      if (!document.startViewTransition || reduce || !finePointer) {
        switchTo();
        return;
      }

      // Circular reveal expanding from the toggle button: quick, and fast at the start.
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? 0;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(switchTo);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
    },
    [theme]
  );

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
