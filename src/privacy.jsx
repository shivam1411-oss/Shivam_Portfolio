import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ThemeProvider } from './theme/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import { Reveal, ease } from './components/motion';
import './index.css';

const EFFECTIVE_DATE = 'November 19, 2026';

// Section headings become link targets (#your-rights) for the contents list.
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// One row per kind of information: what it is, why it is used, where it is kept, and for how long.
const dataSummary = [
  ['Theme choice, welcome-screen flag', 'To remember your settings', 'Only on your device', 'Until you clear your browser or app data'],
  [
    'Lesson progress, quiz answers, solved exercises, checklist and step ticks, code you type',
    'To let you carry on where you left off',
    'Only on your device (progress is also saved to your account if you have one; ticks and code are not)',
    'Until you clear your browser or app data',
  ],
  ['A copy of the Python engine and its libraries', 'So lessons start quickly next time', 'Only on your device (browser cache)', 'Until you clear your browser or app data'],
  ['Name and email for "Get Resume"', 'To email you the resume', 'Passed through a Supabase function to Brevo, which sends the email; not stored by Shivam Soni', 'As long as Brevo keeps its delivery logs'],
  ['Scrambled (hashed) email address and IP for "Get Resume"', 'To stop the form being used to flood inboxes', 'Supabase', 'Two days'],
  ['Account name, email and scrambled password', 'To sign you in and send account emails', 'Supabase (emails are delivered by Brevo)', 'Until you delete your account'],
  ['Learning progress saved to your account', 'To follow you across devices', 'Supabase', 'Until you delete your account'],
  ['Purchase records and payment reference numbers', 'To unlock your courses, give refunds and keep accounts', 'Supabase and Razorpay', 'As long as Indian tax and accounting laws require'],
  ['Card, UPI or bank details', 'To take your payment', 'Razorpay only; never seen by Shivam Soni', "Under Razorpay's own policy"],
  ['Messages you type to the AI assistant', 'To answer your question', 'Passed through Cloudflare to Anthropic; not stored by Shivam Soni', 'Gone from your page when you close or reload it'],
];

const sections = [
  {
    title: 'At a Glance',
    body: (
      <>
        <p>The short version. The sections below give the detail.</p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>You can use almost everything without giving any information:</strong> the portfolio, the free lessons, the Python
            exercises and the Android app.
          </li>
          <li>
            <strong>No tracking:</strong> no cookies, no analytics, no advertising and no location data.
          </li>
          <li>
            <strong>Information is collected only when you choose to give it:</strong> your name and email to get the resume, your name, email
            and password to create a CodeJack account, or the messages you type to the AI assistant.
          </li>
          <li>
            <strong>Your code stays on your device:</strong> Python, pandas, SQL and Matplotlib run inside your browser or the app. Nothing you
            type in a code box is uploaded.
          </li>
          <li>
            <strong>Payments go through Razorpay:</strong> Shivam Soni never sees your card, UPI or bank details.
          </li>
          <li>
            <strong>Nothing is sold or used for marketing.</strong>
          </li>
          <li>
            <strong>You are in control:</strong> you can see, correct or delete your account information by emailing the address under Contact.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Overview',
    body: (
      <p>
        This privacy policy applies to Shivam Soni's portfolio website at <strong>shivam-soni.com</strong> (this site), including its{' '}
        <strong>CodeJack</strong> ("Crack the Code"), and the <strong>Shivam Soni Android app</strong> (together, "the website and app"). It explains what information is collected, how it's used, and who it's shared with. This is a personal portfolio that also offers optional paid
        courses in CodeJack. The website and app collect the minimum information needed to provide the features described below. It
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
          <strong>AI assistant</strong> chat, or a <strong>CodeJack account</strong> (each described in its own section below). For "Get
          Resume":
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Name</strong> — used to personalize the email you receive.
          </li>
          <li>
            <strong>Email address</strong> — used solely to send you a copy of the resume.
          </li>
          <li>
            <strong>A scrambled record of the request</strong> — a one-way code made from your email address and your IP address, kept for
            two days so the form cannot be used to send large numbers of emails. Neither can be read back from it.
          </li>
        </ul>
        <p className="mt-3">
          No other personal information is collected. The website and app do not use cookies, do not track your browsing activity, and do not
          collect location data, device identifiers, or analytics of any kind.
        </p>
        <p className="mt-3">
          <strong>Stored on your device:</strong> your light/dark theme choice, a note that you have already seen the welcome screen
          during the current visit, and, if you use CodeJack, your lesson progress, quiz answers, solved exercises, the ticks you make
          on a lesson's checklist and step-by-step walkthrough, the code you write in the code boxes and practice boxes and, if you sign in, a
          sign-in token that keeps you logged in. The first time you run Python, your browser also keeps a copy of the Python engine and its
          libraries so later lessons start quickly. All of this stays in your browser or in the app on your device and can be removed by
          clearing your browser data, clearing the app's storage, or uninstalling the app. If you have a CodeJack account, your progress
          is also saved to it, as described below; your checklist ticks and the code you type are never uploaded.
        </p>
      </>
    ),
  },
  {
    title: 'Summary: What Is Kept, Where and for How Long',
    body: (
      <>
        <p>Each row is one kind of information. Anything marked "only on your device" never reaches Shivam Soni or anyone else.</p>
        <div className="mt-4 space-y-3">
          {dataSummary.map(([what, why, where, howLong]) => (
            <div key={what} className="p-4 rounded-xl bg-surface-2 border border-line">
              <div className="font-bold text-fg">{what}</div>
              <dl className="mt-2 grid sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="eyebrow text-subtle">Why</dt>
                  <dd>{why}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-subtle">Where it is kept</dt>
                  <dd>{where}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-subtle">How long</dt>
                  <dd>{howLong}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    title: 'The Android App',
    body: (
      <>
        <p>
          The Shivam Soni Android app shows the same portfolio as this website, packaged inside the app. It handles your information in exactly
          the same way as the website, and only collects anything if you use the "Get Resume" feature, the AI assistant, or a CodeJack
          account.
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Permissions:</strong> the app requests internet access only, used to email the resume you request, sign in to CodeJack,
            download courses you have unlocked and open links. It does
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
            <strong>Updates:</strong> the app does not update itself or check for updates in the background. A new version reaches your device
            only when you install a newer installation file. Installing it over the old version keeps what the app stored on your device.
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
    title: 'CodeJack ("Crack the Code")',
    body: (
      <>
        <p>
          CodeJack offers interactive courses on how this site was built, Python, data analysis with pandas, SQL and Matplotlib, React,
          Jira, Kubernetes, and Cloudflare &amp; web security. "Learn the Code" and the first module of every course are free and need no account and no personal information.
          The rest of each course is available to buy, which requires a free account (see "CodeJack Accounts &amp; Payments" below).
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Your progress:</strong> without an account, completed lessons, quiz answers, solved exercises, checklist and step ticks and
            the code you type are saved only in your browser or the app on your device. With an account, your progress (but not your ticks or
            your code) is also saved to your account so it follows you to other devices.
          </li>
          <li>
            <strong>Python runs on your device:</strong> code you run in the Python, pandas, SQL and Matplotlib exercises is executed entirely
            inside your browser or the app. The Python engine and its data libraries are served from this site itself (and are built into the
            Android app), not from a third-party service. Your code, its output, the charts it draws and any query results are never sent
            anywhere. The other practice tools work the same way: the live React editor, the practice Kubernetes cluster and the sample Jira
            board and search all run on your device.
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
    title: 'CodeJack Accounts & Payments',
    body: (
      <>
        <p>
          Creating a CodeJack account is optional. You need one only to save your progress across devices or to buy a course. When you
          create and use an account, the following is collected:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong>Name and email address</strong>, which you enter when you sign up, to identify your account, show your name in CodeJack and
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
          Razorpay's checkout window is loaded from Razorpay's own servers only when you press an Unlock button, so Razorpay receives standard
          technical information, such as your IP address and browser type, at that moment. If the window cannot open, no payment is started
          and nothing is charged.
        </p>
        <p className="mt-3">
          <strong>Who can see your account information:</strong> only you and Shivam Soni. As the owner of the site, Shivam Soni can see
          account names and email addresses, purchases and course progress on a private administration page, in order to answer your
          questions, give refunds and grant access to courses. Passwords and payment details are not visible there. Nobody else has access.
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
          The website and app can show an optional AI assistant that answers questions about receivables, record to report, collections and
          automation. It appears only while the feature is switched on, and it only runs when you open it and send a message. If you do not
          see an "Ask my AI" button, the assistant is switched off and this section does not apply to your visit.
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
        The name and email you give through "Get Resume" are used for exactly one purpose: sending you the requested resume by email. CodeJack
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
          To deliver the resume by email, the website or app sends your name and email address to a small server function hosted on{' '}
          <strong>Supabase</strong>, which passes them to <strong>Brevo</strong>, the email delivery service that sends the message from
          shivam-soni.com. Brevo handles this data under its privacy policy (
          <a href="https://www.brevo.com/legal/privacypolicy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            brevo.com/legal/privacypolicy
          </a>
          ). If you reply to the email, your reply reaches Shivam Soni through Cloudflare's email forwarding.
        </p>
        <p className="mt-3">
          Messages you type into the AI assistant are handled by Cloudflare and Anthropic, as described in the AI Assistant section above.
          CodeJack accounts, emails and payments are handled by Supabase, Brevo and Razorpay, as described in CodeJack Accounts &amp;
          Payments section above.
        </p>
        <p className="mt-3">
          <strong>Hosting, delivery and fonts:</strong> the website is hosted on <strong>GitHub Pages</strong> and delivered through{' '}
          <strong>Cloudflare</strong>, which sits in front of it to make pages load quickly and reliably. Like any website host, both receive
          standard technical information, such as your IP address and browser type, when your browser requests the site's pages, and may
          keep it in their logs under their own privacy policies (
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            GitHub
          </a>
          ,{' '}
          <a href="https://www.cloudflare.com/privacypolicy/" className="underline hover:text-fg" target="_blank" rel="noreferrer">
            Cloudflare
          </a>
          ). Cloudflare is used only to deliver the site: it does not set cookies or run analytics on it. Shivam Soni does not receive or use
          this information. The site's fonts are served from the site itself and are built into the Android app; they are not loaded from
          Google Fonts, so Google receives nothing when you visit.
        </p>
        <p className="mt-3">
          <strong>Emails to @shivam-soni.com addresses:</strong> if you email an address at shivam-soni.com, Cloudflare's email routing
          service passes the message on to Shivam Soni's inbox. Cloudflare does not keep a copy of the message beyond what is needed to
          deliver it.
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
          <strong>Get Resume:</strong> Shivam Soni does not keep a database of names or email addresses submitted through this feature. They are
          passed to Brevo to send the email and are not stored beyond what Brevo keeps in its standard delivery logs. The only record kept is a
          scrambled (hashed) code made from the email address and IP address, which cannot be turned back into either, and which is deleted
          after two days.
        </p>
        <p className="mt-3">
          <strong>CodeJack accounts:</strong> your account information and progress are kept for as long as your account exists. When you ask
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
        The website and app are not directed at children. CodeJack accounts and purchases are intended for people aged 18 or over; anyone
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
          <li>correct or update it (you can change your name and password yourself on CodeJack account page);</li>
          <li>delete your CodeJack account and its data, apart from purchase records the law requires us to keep;</li>
          <li>withdraw your consent at any time, which ends your account (it does not undo processing already done);</li>
          <li>nominate someone to exercise these rights for you in case of death or incapacity.</li>
        </ul>
        <p className="mt-3">
          To make a request or raise a concern, email the contact below from the address linked to your account. Requests are answered within
          30 days. If you are not satisfied with the response, you may complain to the Data Protection Board of India.
        </p>
        <p className="mt-3">
          For "Get Resume" requests, there is nothing to look up beyond the two-day scrambled record described above; we will help you with
          anything Brevo holds about the email that was sent.
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
          <li>All CodeJack courses, lessons, explanations, quizzes, coding exercises, diagrams and interactive examples.</li>
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
          Shivam Soni for professional opportunities. You may also use CodeJack for your own personal, non-commercial learning,
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
      <>
        <p>
          This policy may be updated occasionally to reflect changes to the features of the website or app. The effective date at the top of
          this page will always reflect the most recent version.
        </p>
        <p className="mt-3">
          <strong>What changed in this version ({EFFECTIVE_DATE}):</strong>
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>The Learning Lab is now called CodeJack. Only the name changed: accounts, progress and purchases are the same.</li>
          <li>Added the new "Cloudflare &amp; Web Security" course to the list of CodeJack courses. Nothing about what is collected changed.</li>
        </ul>
        <p className="mt-3">
          <strong>Changes on November 18, 2026:</strong>
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>"Get Resume" emails are now sent from shivam-soni.com through Brevo, by a server function on Supabase, instead of EmailJS.</li>
          <li>Added the two-day scrambled record that stops the form being used to flood inboxes.</li>
        </ul>
        <p className="mt-3">
          <strong>Changes on November 17, 2026:</strong>
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>The website is now delivered through Cloudflare, in front of GitHub Pages, and Cloudflare forwards emails sent to @shivam-soni.com addresses.</li>
        </ul>
        <p className="mt-3">
          <strong>Changes on November 15, 2026:</strong>
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>Added the "At a Glance" summary, a contents list and the table of what is kept, where and for how long.</li>
          <li>
            Described what the new step-by-step lessons save on your device: checklist and step ticks, and the code in practice boxes. None of
            it is uploaded.
          </li>
          <li>Explained that your browser keeps a copy of the Python engine so lessons start quickly.</li>
          <li>Stated who can see account information, and that Razorpay's checkout is loaded only when you press Unlock.</li>
          <li>Explained how the Android app is updated, and that the AI assistant appears only while it is switched on.</li>
          <li>Fonts are now served from this site instead of Google Fonts, so no request goes to Google when you visit.</li>
        </ul>
        <p className="mt-3">
          <strong>Related pages:</strong> the{' '}
          <a href="terms.html" className="underline hover:text-fg">
            Terms of Use
          </a>{' '}
          and the{' '}
          <a href="refund.html" className="underline hover:text-fg">
            Refund &amp; Cancellation Policy
          </a>{' '}
          cover buying and using CodeJack courses.
        </p>
      </>
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
          Effective Date: {EFFECTIVE_DATE}
        </motion.p>

        <nav aria-label="Contents" className="mb-5 p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft">
          <h2 className="eyebrow text-subtle mb-3">On this page</h2>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal list-inside text-muted">
            {sections.map((s) => (
              <li key={s.title}>
                <a href={`#${slug(s.title)}`} className="font-semibold text-fg hover:text-accent hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-5 text-muted leading-relaxed">
          {sections.map((s) => (
            <Reveal
              key={s.title}
              as="section"
              id={slug(s.title)}
              className="p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft scroll-mt-6 [&_strong]:text-fg"
            >
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
