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

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openResume = useCallback(() => setResumeOpen(true), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden />
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
    </MotionConfig>
  );
}
