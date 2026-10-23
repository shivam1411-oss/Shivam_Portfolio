import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ThemeProvider } from './theme/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import { Reveal, ease } from './components/motion';
import './index.css';

const sections = [
  {
    title: 'Overview',
    body: (
      <p>
        This privacy policy applies to Shivam Soni's portfolio website (this site) and the accompanying iOS app (together, "the App"). It explains what
        information is collected, how it's used, and who it's shared with. This is a personal portfolio, not a commercial product, and the App collects
        the minimum information needed to provide the features described below.
      </p>
    ),
  },
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>
          The App collects information only when you choose to use the <strong>"Get Resume"</strong> feature:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Name</strong> — used to personalize the email you receive.
          </li>
          <li>
            <strong>Email address</strong> — used solely to send you a copy of the resume.
          </li>
        </ul>
        <p className="mt-3">
          No other personal information is collected. The App does not use cookies, does not track your browsing activity, and does not collect location
          data, device identifiers, or analytics of any kind.
        </p>
      </>
    ),
  },
  {
    title: 'How We Use Your Information',
    body: (
      <p>
        The name and email you provide are used for exactly one purpose: sending you the requested resume by email. This information is not used for
        marketing, is not added to any mailing list, and is not used to contact you for any other reason.
      </p>
    ),
  },
  {
    title: 'Third-Party Services',
    body: (
      <>
        <p>
          To deliver the resume by email, the App sends your name and email address to <strong>EmailJS</strong>, a third-party email delivery service,
          which processes the request and sends the message. EmailJS's own handling of this data is governed by their privacy policy, available at{' '}
          <a href="https://www.emailjs.com/legal/privacy-policy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            emailjs.com/legal/privacy-policy
          </a>
          .
        </p>
        <p className="mt-3">
          No other third parties receive your information. The App does not sell, rent, or share your data with advertisers or data brokers.
        </p>
      </>
    ),
  },
  {
    title: 'Data Storage & Retention',
    body: (
      <p>
        Shivam Soni does not maintain a database of names or email addresses submitted through this feature. Your information is transmitted directly to
        EmailJS for the purpose of sending the email and is not separately stored, logged, or retained by this website or app beyond what EmailJS itself
        retains as part of its standard email delivery logs.
      </p>
    ),
  },
  {
    title: "Children's Privacy",
    body: (
      <p>
        This App is not directed at children and is not intended for use by anyone under the age of 13. We do not knowingly collect personal information
        from children.
      </p>
    ),
  },
  {
    title: 'Your Rights',
    body: (
      <p>
        If you've submitted your name and email through the "Get Resume" feature and would like to know what information was sent or would like it
        removed from EmailJS's delivery logs, contact us using the details below and we'll assist or direct you to EmailJS's own data request process.
      </p>
    ),
  },
  {
    title: 'Changes to This Policy',
    body: (
      <p>
        This policy may be updated occasionally to reflect changes to the App's features. The effective date at the top of this page will always reflect
        the most recent version.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: (
      <>
        <p>Questions about this policy or your information can be sent to:</p>
        <p className="mt-3 font-bold text-fg">
          Shivam Soni
          <br />
          <a href="mailto:Shivam.soni1495@outlook.com" className="underline hover:text-accent">
            Shivam.soni1495@outlook.com
          </a>
        </p>
      </>
    ),
  },
];

function PrivacyPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-80 dot-grid opacity-60 -z-10" />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between"
        >
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
          Privacy <span className="text-gradient">Policy</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="eyebrow text-subtle mb-12"
        >
          Effective Date: July 27, 2026
        </motion.p>

        <div className="space-y-5 text-muted leading-relaxed">
          {sections.map((s) => (
            <Reveal key={s.title} as="section" className="p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft [&_strong]:text-fg">
              <h2 className="text-xl font-extrabold text-fg mb-3">{s.title}</h2>
              {s.body}
            </Reveal>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-line text-center">
          <p className="text-[10px] text-subtle font-bold uppercase tracking-[0.2em]">© 2026 Shivam Soni</p>
        </div>
      </div>
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PrivacyPage />
    </ThemeProvider>
  </StrictMode>
);
