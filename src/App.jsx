import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Metrics from './components/Metrics';
import Experience from './components/Experience';
import Lab from './components/Lab';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import ResumeModal from './components/ResumeModal';
import CursorReveal from './components/CursorReveal';
import StarTrail from './components/StarTrail';
import Intro from './components/Intro';

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

  const enterSite = useCallback(() => {
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage unavailable: the intro will just show again next time */
    }
    setEntered(true);
  }, []);
  const closeIntro = useCallback(() => setShowIntro(false), []);

  const [contactOpen, setContactOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openResume = useCallback(() => setResumeOpen(true), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden />
      <StarTrail />
      {showIntro && <Intro onEnter={enterSite} onDone={closeIntro} />}

      {/* Mounted on entry so the entrance animations play as the welcome screen opens */}
      {entered && (
        <>
          <CursorReveal />
          <Navbar onConnect={openContact} onResume={openResume} />
          <main>
            <Hero onConnect={openContact} />
            <Marquee />
            <Metrics />
            <Experience />
            <Lab />
          </main>
          <Footer onResume={openResume} />

          <ContactModal open={contactOpen} onClose={closeContact} onResume={openResume} />
          <ResumeModal open={resumeOpen} onClose={closeResume} />
        </>
      )}
    </MotionConfig>
  );
}
