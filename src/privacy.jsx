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
        This privacy policy applies to Shivam Soni's portfolio website (this site) and the <strong>Shivam Soni Android app</strong> (together,
        "the website and app"). It explains what information is collected, how it's used, and who it's shared with. This is a personal portfolio,
        not a commercial product, and the website and app collect the minimum information needed to provide the features described below. It
        also sets out who owns their content and the restrictions on copying or reusing it.
      </p>
    ),
  },
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>
          The website and app collect information only when you choose to use the <strong>"Get Resume"</strong> feature or the{' '}
          <strong>AI assistant</strong> chat (described in its own section below). For "Get Resume":
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
          No other personal information is collected. The website and app do not use cookies, do not track your browsing activity, and do not
          collect location data, device identifiers, or analytics of any kind.
        </p>
        <p className="mt-3">
          <strong>Stored only on your device:</strong> your light/dark theme choice, and a note that you have already seen the welcome screen
          during the current visit. These stay in your browser or in the app on your device, are never sent anywhere, and can be removed by
          clearing your browser data, clearing the app's storage, or uninstalling the app.
        </p>
      </>
    ),
  },
  {
    title: 'The Android App',
    body: (
      <>
        <p>
          The Shivam Soni Android app shows the same portfolio as this website, packaged inside the app. It handles your information in exactly
          the same way as the website, and only collects anything if you use the "Get Resume" feature.
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Permissions:</strong> the app requests internet access only, used to email the resume you request and to open links. It does
            not access your contacts, camera, microphone, photos, files, location or phone identifiers.
          </li>
          <li>
            <strong>No tracking:</strong> the app contains no analytics, advertising or crash-reporting tools.
          </li>
          <li>
            <strong>Distribution:</strong> the app is currently provided directly as an installation file (APK) rather than through an app store,
            so no app store collects data about you on Shivam Soni's behalf.
          </li>
          <li>
            <strong>Links to other apps:</strong> contact links open your email, WhatsApp, phone, LinkedIn or GitHub apps, which handle any
            information under their own privacy policies.
          </li>
          <li>
            <strong>Removing your data:</strong> uninstalling the app deletes everything it stored on your device.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'AI Assistant (Chat)',
    body: (
      <>
        <p>
          The website and app include an optional AI assistant that answers questions about receivables, record to report, collections and
          automation. It only runs when you open it and send a message.
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>What is sent:</strong> the messages you type in the current chat, together with the assistant's earlier replies in that chat
            so it can follow the conversation. Nothing else about you or your device is attached.
          </li>
          <li>
            <strong>Who processes it:</strong> your messages pass through a small service hosted on <strong>Cloudflare</strong>, which forwards
            them to <strong>Anthropic</strong>, the company that provides the Claude AI model, to generate the answer. Anthropic handles this data
            under its commercial terms and privacy policy, available at{' '}
            <a href="https://www.anthropic.com/legal/privacy" className="underline hover:text-fg" target="_blank" rel="noreferrer">
              anthropic.com/legal/privacy
            </a>
            , and Cloudflare may keep standard service logs under its own policy.
          </li>
          <li>
            <strong>What is kept:</strong> Shivam Soni does not store your chat. The conversation lives only in your open page or app and is gone
            when you close or reload it. Your IP address is used briefly to limit how many messages can be sent per minute, and is not stored by
            Shivam Soni.
          </li>
          <li>
            <strong>Please don't share sensitive details:</strong> avoid entering personal, customer or confidential company information in the
            chat.
          </li>
          <li>
            <strong>Accuracy:</strong> answers are generated by AI, can be wrong, and are not professional, legal, tax or financial advice.
          </li>
        </ul>
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
          To deliver the resume by email, the website or app sends your name and email address to <strong>EmailJS</strong>, a third-party email delivery service,
          which processes the request and sends the message. EmailJS's own handling of this data is governed by their privacy policy, available at{' '}
          <a href="https://www.emailjs.com/legal/privacy-policy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            emailjs.com/legal/privacy-policy
          </a>
          .
        </p>
        <p className="mt-3">
          Messages you type into the AI assistant are handled by Cloudflare and Anthropic, as described in the AI Assistant section below.
          No other third parties receive your information. The website and app do not sell, rent, or share your data with advertisers or data brokers.
        </p>
      </>
    ),
  },
  {
    title: 'Data Storage & Retention',
    body: (
      <p>
        Shivam Soni does not maintain a database of names or email addresses submitted through this feature. Your information is transmitted directly to
        EmailJS for the purpose of sending the email and is not separately stored, logged, or retained by the website or app beyond what EmailJS itself
        retains as part of its standard email delivery logs.
      </p>
    ),
  },
  {
    title: "Children's Privacy",
    body: (
      <p>
        The website and app are not directed at children and is not intended for use by anyone under the age of 13. We do not knowingly collect personal information
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
    title: 'Ownership & Copyright: All Rights Reserved',
    body: (
      <>
        <p>
          This website, the Android app and everything they contain are the exclusive property of <strong>Shivam Soni</strong> and are
          protected by applicable copyright, intellectual property and other laws. <strong>All rights are reserved by Shivam Soni.</strong>
        </p>
        <p className="mt-3">This includes, without limitation:</p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>All text, including the professional summary, role descriptions, achievements, quotes and the content of the Analytical Lab.</li>
          <li>All data, figures, metrics, charts and performance statistics presented on the site.</li>
          <li>The resume and any document made available for preview or by email.</li>
          <li>Photographs, images, graphics, icons and the visual design, layout, colour scheme and overall look and feel.</li>
          <li>The source code, animations, effects, interactive features and the structure and arrangement of the site.</li>
        </ul>
        <p className="mt-3">
          No ownership or licence of any kind is transferred to you by visiting the website, using the app or receiving the resume. Nothing on
          this site should be read as granting any right to use its content except as expressly permitted below.
        </p>
      </>
    ),
  },
  {
    title: 'Prohibited Use: No Copying or Reproduction',
    body: (
      <>
        <p>
          <strong>Copying of the data or the website, in whole or in part, is strictly prohibited.</strong> Without Shivam Soni's prior written
          permission, you may not:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>Copy, reproduce, download, store or republish any content, data, design or code from this website or app.</li>
          <li>Clone, mirror, imitate or recreate the website or app, their design, animations or features, whether for personal or commercial use.</li>
          <li>Decompile, reverse-engineer, modify, repackage or redistribute the app or its installation file (APK).</li>
          <li>Modify, adapt, translate or create derivative works based on any part of the website, the app or their content.</li>
          <li>Distribute, sell, license, rent or otherwise make the content available to any third party.</li>
          <li>
            Use automated tools such as scrapers, crawlers, bots or data-mining software to extract content or data, or use any of it to train
            or feed artificial intelligence or machine-learning systems.
          </li>
          <li>Frame or embed the website, or present its content as your own or as associated with anyone other than Shivam Soni.</li>
          <li>Remove, alter or obscure any copyright notice, watermark or other proprietary marking, including the watermark on the resume preview.</li>
        </ul>
        <p className="mt-3">
          <strong>Permitted use:</strong> you may view the website, use the app and read the resume you requested, solely for the purpose of evaluating
          Shivam Soni for professional opportunities. You may share a link to the website. Any other use requires written permission, which can
          be requested using the contact details below.
        </p>
        <p className="mt-3">
          Names and trademarks of employers and other organisations mentioned on the site belong to their respective owners and are used only to
          describe Shivam Soni's professional experience.
        </p>
      </>
    ),
  },
  {
    title: 'Enforcement',
    body: (
      <p>
        Any unauthorised copying, reproduction or use of this website, the app or their content is a violation of Shivam Soni's rights. Shivam
        Soni reserves the right to take any action available under applicable law, including requesting the removal of copied material,
        seeking injunctive relief and claiming damages, without prior notice.
      </p>
    ),
  },
  {
    title: 'Changes to This Policy',
    body: (
      <p>
        This policy may be updated occasionally to reflect changes to the features of the website or app. The effective date at the top of this page will always reflect
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
          Effective Date: October 25, 2026
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
          <p className="text-[10px] text-subtle font-bold uppercase tracking-[0.2em]">© 2026 Shivam Soni. All rights reserved.</p>
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
