import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import CodeTrail from './components/CodeTrail';
import Intro from './components/Intro';

// The site (charts, PDF preview, email, every section) is a separate chunk so the
// welcome screen shows as soon as possible; it starts downloading straight away.
const loadSite = () => import('./Site');
const Site = lazy(loadSite);

// Show the welcome screen once per browser session (not again when coming back from another page).
const introSeen = () => {
  try {
    return sessionStorage.getItem('intro-seen') === '1';
  } catch {
    return false;
  }
};

export default function App() {
  const [entered, setEntered] = useState(introSeen);
  const [showIntro, setShowIntro] = useState(() => !introSeen());

  // Prefetch the site while the welcome screen is up, so entering is instant.
  useEffect(() => {
    loadSite();
  }, []);

  const enterSite = useCallback(() => {
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage unavailable: the intro will just show again next time */
    }
    setEntered(true);
  }, []);
  const closeIntro = useCallback(() => setShowIntro(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden />
      <CodeTrail />
      {showIntro && <Intro onEnter={enterSite} onDone={closeIntro} />}

      {/* Mounted on entry so the entrance animations play as the welcome screen opens */}
      {entered && (
        <Suspense fallback={null}>
          <Site />
        </Suspense>
      )}
    </MotionConfig>
  );
}
