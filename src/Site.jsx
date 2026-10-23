import { useCallback, useState } from 'react';
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

/** The portfolio itself. Loaded as its own chunk so the welcome screen can appear first. */
export default function Site() {
  const [contactOpen, setContactOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openResume = useCallback(() => setResumeOpen(true), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  return (
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
  );
}
