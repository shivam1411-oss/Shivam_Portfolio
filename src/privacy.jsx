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
        This privacy policy applies to Shivam Soni's portfolio website at <strong>shivam-soni.com</strong> (this site), including its{' '}
        <strong>Learning Lab</strong> ("Crack the Code"), and the <strong>Shivam Soni Android app</strong> (together, "the website and app"). It explains what information is collected, how it's used, and who it's shared with. This is a personal portfolio that also offers optional paid
        courses in the Learning Lab. The website and app collect the minimum information needed to provide the features described below. It
        also sets out who owns their content and the restrictions on copying or reusing it.
      </p>
    ),
  },
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>
          The website and app collect information only when you choose to use the <strong>"Get Resume"</strong> feature, the{' '}
          <strong>AI assistant</strong> chat, or a <strong>Learning Lab account</strong> (each described in its own section below). For "Get
          Resume":
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
          <strong>Stored on your device:</strong> your light/dark theme choice, a note that you have already seen the welcome screen
          during the current visit, and, if you use the Learning Lab, your lesson progress, quiz answers, solved exercises, the code you write
          there and, if you sign in, a sign-in token that keeps you logged in. These stay in your browser or in the app on your device and can be
          removed by clearing your browser data, clearing the app's storage, or uninstalling the app. If you have a Learning Lab account, your
          progress is also saved to it, as described below; the code you type in the editors is never uploaded.
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
          the same way as the website, and only collects anything if you use the "Get Resume" feature, the AI assistant, or a Learning Lab
          account.
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Permissions:</strong> the app requests internet access only, used to email the resume you request, sign in to the Learning
            Lab, download courses you have unlocked and open links. It does
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
    title: 'Learning Lab ("Crack the Code")',
    body: (
      <>
        <p>
          The Learning Lab offers interactive courses on how this site was built, Python, data analysis with pandas, SQL and Matplotlib, React,
          Jira and Kubernetes. "Learn the Code" and the first module of every course are free and need no account and no personal information.
          The rest of each course is available to buy, which requires a free account (see "Learning Lab Accounts &amp; Payments" below).
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Your progress:</strong> without an account, completed lessons, quiz answers, solved exercises and the code you type are saved
            only in your browser or the app on your device. With an account, your progress (but not your code) is also saved to your account so it
            follows you to other devices.
          </li>
          <li>
            <strong>Python runs on your device:</strong> code you run in the Python, pandas, SQL and Matplotlib exercises is executed entirely
            inside your browser or the app. The Python engine and its data libraries are served from this site itself (and are built into the
            Android app), not from a third-party service. Your code, its output, the charts it draws and any query results are never sent
            anywhere.
          </li>
          <li>
            <strong>Sample data is made up:</strong> the customer accounts, payments and other records used in the data courses are fictional
            examples bundled with the site. They do not describe real people, and nothing you change in them leaves your device.
          </li>
          <li>
            <strong>Starting over:</strong> clearing your browser data for this site, clearing the app's storage, or uninstalling the app removes
            the progress and code saved on your device. Progress saved to an account is removed when the account is deleted.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Learning Lab Accounts & Payments',
    body: (
      <>
        <p>
          Creating a Learning Lab account is optional. You need one only to save your progress across devices or to buy a course. When you
          create and use an account, the following is collected:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Name and email address</strong>, which you enter when you sign up, to identify your account, show your name in the Lab and
            send you account emails.
          </li>
          <li>
            <strong>Password</strong>, which is stored only in scrambled (hashed) form by the account provider. Nobody, including Shivam Soni,
            can read it.
          </li>
          <li>
            <strong>Learning progress</strong>: completed lessons, quiz answers, solved exercises and knowledge-base topics you mark as
            understood. The code you write is not uploaded.
          </li>
          <li>
            <strong>Purchase records</strong>: which course you bought, the amount, the date, and the payment reference numbers from the payment
            provider, so the right courses unlock for you and for accounting.
          </li>
          <li>
            <strong>Account activity</strong>: the account provider keeps basic security logs, such as when you signed in and the IP address it
            came from, to protect accounts and prevent abuse.
          </li>
        </ul>
        <p className="mt-3">
          <strong>Payment details are never seen or stored by Shivam Soni.</strong> When you buy a course, you pay on a secure checkout run by 
          <strong>Razorpay</strong>, which collects your card, UPI or bank details directly under its own policies. Shivam Soni receives only
          whether the payment succeeded, the amount and Razorpay's reference numbers.
        </p>
        <p className="mt-3">
          <strong>Emails you will receive:</strong> only account emails you trigger, such as confirming your email address, resetting your
          password and purchase confirmations. Your email address is not used for marketing or newsletters and is never sold or shared for
          advertising.
        </p>
        <p className="mt-3">
          <strong>Who stores and processes it:</strong>
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Supabase</strong> stores accounts, progress and purchase records on secure cloud servers, which may be located outside
            India (
            <a href="https://supabase.com/privacy" className="underline hover:text-fg" target="_blank" rel="noreferrer">
              supabase.com/privacy
            </a>
            ).
          </li>
          <li>
            <strong>Brevo</strong> delivers account emails on Shivam Soni's behalf (
            <a href="https://www.brevo.com/legal/privacypolicy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
              brevo.com/legal/privacypolicy
            </a>
            ).
          </li>
          <li>
            <strong>Razorpay</strong> processes payments (
            <a href="https://razorpay.com/privacy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
              razorpay.com/privacy
            </a>
            ).
          </li>
        </ul>
        <p className="mt-3">
          <strong>Security:</strong> all connections are encrypted (HTTPS). Each account can read only its own progress and purchases, and paid
          lessons are downloaded only to accounts that own them.
        </p>
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
        The name and email you give through "Get Resume" are used for exactly one purpose: sending you the requested resume by email. Learning Lab
        account information is used only to run your account: signing you in, saving your progress, unlocking courses you have bought, sending
        account emails, keeping purchase records required by law, and protecting accounts from misuse. None of this information is used for
        marketing, added to a mailing list, sold, or used to contact you for any other reason.
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
          Messages you type into the AI assistant are handled by Cloudflare and Anthropic, as described in the AI Assistant section above.
          Learning Lab accounts, emails and payments are handled by Supabase, Brevo and Razorpay, as described in the Learning Lab Accounts &amp;
          Payments section above.
        </p>
        <p className="mt-3">
          <strong>Hosting and fonts:</strong> the website is hosted on <strong>GitHub Pages</strong>, and its fonts are loaded from{' '}
          <strong>Google Fonts</strong>. Like any website host, these services receive standard technical information, such as your IP
          address and browser type, when your browser requests the site's pages or fonts, and may keep it in their logs under their own privacy
          policies (
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            GitHub
          </a>
          ,{' '}
          <a href="https://policies.google.com/privacy" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            Google
          </a>
          ). Shivam Soni does not receive or use this information.
        </p>
        <p className="mt-3">
          No other third parties receive your information. The website and app do not sell, rent, or share your data with advertisers or data brokers.
        </p>
      </>
    ),
  },
  {
    title: 'Data Storage & Retention',
    body: (
      <>
        <p>
          <strong>Get Resume:</strong> Shivam Soni does not keep a database of names or email addresses submitted through this feature. Your
          information is sent directly to EmailJS to send the email and is not separately stored, logged, or retained beyond what EmailJS itself
          keeps in its standard email delivery logs.
        </p>
        <p className="mt-3">
          <strong>Learning Lab accounts:</strong> your account information and progress are kept for as long as your account exists. When you ask
          for your account to be deleted, it and its progress are deleted within 30 days. Purchase records are kept only for as long as Indian
          tax and accounting laws require, and are then deleted.
        </p>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    body: (
      <p>
        The website and app are not directed at children. Learning Lab accounts and purchases are intended for people aged 18 or over; anyone
        under 18 may use an account only if a parent or guardian creates it and agrees to this policy on their behalf. We do not knowingly
        collect personal information from children without that consent, and will delete it if we learn that we have.
      </p>
    ),
  },
  {
    title: 'Your Rights',
    body: (
      <>
        <p>
          Under India's Digital Personal Data Protection Act, 2023 and other applicable laws, you can ask to:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>see a summary of the personal information held about you and who it has been shared with;</li>
          <li>correct or update it (you can change your name and password yourself on the Learning Lab account page);</li>
          <li>delete your Learning Lab account and its data, apart from purchase records the law requires us to keep;</li>
          <li>withdraw your consent at any time, which ends your account (it does not undo processing already done);</li>
          <li>nominate someone to exercise these rights for you in case of death or incapacity.</li>
        </ul>
        <p className="mt-3">
          To make a request or raise a concern, email the contact below from the address linked to your account. Requests are answered within
          30 days. If you are not satisfied with the response, you may complain to the Data Protection Board of India.
        </p>
        <p className="mt-3">
          For "Get Resume" requests, we will help you or direct you to EmailJS's own data request process.
        </p>
      </>
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
          <li>All Learning Lab courses, lessons, explanations, quizzes, coding exercises, diagrams and interactive examples.</li>
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
          Shivam Soni for professional opportunities. You may also use the Learning Lab for your own personal, non-commercial learning,
          including writing and running practice code in its exercises; this does not permit republishing or redistributing its lessons or
          materials. You may share a link to the website. Any other use requires written permission, which can
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
        <p>Questions, requests or complaints about this policy or your information (including as grievance officer under the DPDP Act) can be sent to:</p>
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
          Effective Date: November 13, 2026
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
