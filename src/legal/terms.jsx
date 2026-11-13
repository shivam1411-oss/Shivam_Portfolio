import { A, ContactDetails, renderLegal } from './LegalPage';
import { LEGAL } from './details';

const sections = [
  {
    title: 'About These Terms',
    body: (
      <>
        <p>
          These terms apply to the <strong>Learning Lab</strong> ("Crack the Code") at <strong>{LEGAL.site}/learn.html</strong> and in the Shivam Soni Android
          app, run by <strong>{LEGAL.owner}</strong> ("we", "us"). By creating an account or buying a course you agree to these terms, the{' '}
          <A href="refund.html">Refund &amp; Cancellation Policy</A> and the <A href="privacy.html">Privacy Policy</A>. If you do not agree, please do not
          create an account or make a purchase. Free lessons can be used without an account.
        </p>
        <p className="mt-3">
          You must be 18 or older to create an account or buy a course. Anyone under 18 may use an account only if a parent or guardian creates it and
          accepts these terms on their behalf.
        </p>
      </>
    ),
  },
  {
    title: 'Your Account',
    body: (
      <ul className="list-disc list-inside">
        <li>Give your real name and an email address you can access, and keep them up to date.</li>
        <li>Keep your password secret. You are responsible for what happens in your account; tell us straight away if you think someone else has used it.</li>
        <li>An account is for one person. Do not share your login or let others use your purchases.</li>
        <li>You can ask us to delete your account at any time (see the Privacy Policy).</li>
      </ul>
    ),
  },
  {
    title: 'Free and Paid Courses',
    body: (
      <p>
        "Learn the Code" and the first module of every course are free. The rest of each paid course, including its lessons, exercises, quizzes and
        knowledge base, is unlocked by buying that course or the all-access bundle. The page you buy from shows exactly what is included and the price.
      </p>
    ),
  },
  {
    title: 'Prices and Payment',
    body: (
      <ul className="list-disc list-inside">
        <li>
          Prices are shown in <strong>Indian Rupees (INR)</strong> and are the total you pay, including any applicable taxes. They are one-time
          payments; there are no subscriptions or automatic renewals.
        </li>
        <li>
          Payments are processed securely by <strong>Razorpay</strong> using cards, UPI, netbanking, wallets and other methods it offers. We never see or
          store your card, UPI or bank details.
        </li>
        <li>A purchase is complete only when Razorpay confirms the payment. Prices may change in future, but never for a purchase already made.</li>
      </ul>
    ),
  },
  {
    title: 'Delivery of Courses',
    body: (
      <>
        <p>
          Courses are <strong>digital and delivered online only</strong>; nothing is shipped. The paid lessons unlock in your account immediately after
          payment is confirmed, usually within seconds, and you can open them in any browser or the app where you sign in.
        </p>
        <p className="mt-3">
          If a course has not unlocked within one hour of a successful payment, sign out and back in, then contact us with your payment reference and we
          will fix it.
        </p>
      </>
    ),
  },
  {
    title: 'Your Licence to Use the Courses',
    body: (
      <>
        <p>
          Buying a course gives you a personal, non-exclusive, non-transferable licence to access and use it for your own learning, for as long as the
          Learning Lab is offered. It does not transfer ownership of any content.
        </p>
        <p className="mt-3">You may not:</p>
        <ul className="list-disc list-inside">
          <li>share, resell, publish or distribute lessons, exercises, solutions, quizzes or knowledge-base articles, or your account access;</li>
          <li>download, scrape, copy or record course content in bulk, or use it to train AI systems;</li>
          <li>try to get around the payment system or access paid content you have not bought;</li>
          <li>interfere with the site, attack it, or misuse the code playgrounds or the AI assistant.</li>
        </ul>
        <p className="mt-3">
          The full copyright and permitted-use terms are in the <A href="privacy.html">Privacy Policy</A> under "Ownership &amp; Copyright" and "Prohibited
          Use".
        </p>
      </>
    ),
  },
  {
    title: 'Refunds',
    body: (
      <p>
        Refunds are covered by the <A href="refund.html">Refund &amp; Cancellation Policy</A>. If we suspend an account for breaking these terms, purchases
        made by that account are not refunded.
      </p>
    ),
  },
  {
    title: 'About the Content',
    body: (
      <ul className="list-disc list-inside">
        <li>The courses are for education. They are not professional, financial, legal or career advice, and do not guarantee a job, exam result or income.</li>
        <li>We work to keep lessons accurate and up to date and may improve, reorganise or update them at any time.</li>
        <li>
          We may change or withdraw courses. Refunds are only available as set out in the Refund &amp; Cancellation Policy (within 7 days of purchase), not
          when a course is changed or withdrawn later.
        </li>
        <li>The site is provided "as is". We aim to keep it available but cannot promise it will always be free of errors or interruptions.</li>
      </ul>
    ),
  },
  {
    title: 'Suspension and Termination',
    body: (
      <p>
        We may suspend or close an account that breaks these terms, for example by sharing access or copying paid content, after telling you why where
        reasonably possible. You can stop using the Learning Lab and ask us to delete your account at any time.
      </p>
    ),
  },
  {
    title: 'Limitation of Liability',
    body: (
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability for any claim relating to the
        Learning Lab is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits rights you have under Indian
        consumer protection law that cannot be excluded.
      </p>
    ),
  },
  {
    title: 'Governing Law and Disputes',
    body: (
      <p>
        These terms are governed by the laws of India. Please contact us first so we can try to resolve any problem quickly. Any dispute that cannot be
        resolved will be subject to the jurisdiction of the courts{LEGAL.jurisdiction ? ` in ${LEGAL.jurisdiction}` : ' in India'}.
      </p>
    ),
  },
  {
    title: 'Changes to These Terms',
    body: (
      <p>
        We may update these terms when the Learning Lab changes. The effective date at the top always shows the latest version, and important changes
        will be shown in the Learning Lab. Purchases already made keep the terms that applied when you bought them, unless the law requires otherwise.
      </p>
    ),
  },
  {
    title: 'Contact and Grievances',
    body: (
      <>
        <p>
          For questions, problems with a purchase, or complaints, contact us below. We acknowledge complaints within 48 hours and aim to resolve them within
          30 days.
        </p>
        <ContactDetails />
      </>
    ),
  },
];

renderLegal({ title: 'Terms of', accent: 'Use', sections });
