import { A, ContactDetails, renderLegal } from './LegalPage';

const sections = [
  {
    title: 'In Short',
    body: (
      <ul className="list-disc list-inside">
        <li>
          Not happy with a course? Ask within <strong>7 days</strong> of buying it for a <strong>full refund</strong>.
        </li>
        <li>Failed or duplicate payments are refunded automatically.</li>
        <li>There are no subscriptions, so there is nothing to cancel and you are never charged again.</li>
        <li>Refunds go back to the original payment method, usually within 5–7 working days.</li>
      </ul>
    ),
  },
  {
    title: '7-Day Refund',
    body: (
      <>
        <p>
          The first module of every course is free so you can try it before buying. If you buy a course or the all-access bundle and are not satisfied,
          email us within <strong>7 days of your purchase</strong> from the address on your account, with your payment reference (shown in the receipt
          from Razorpay), and we will refund the full amount. You do not need to give a reason.
        </p>
        <p className="mt-3">
          To keep this fair, the 7-day refund applies once per course per person. It does not apply to accounts suspended for breaking the{' '}
          <A href="terms.html">Terms of Use</A>, for example by sharing access or copying paid content.
        </p>
      </>
    ),
  },
  {
    title: 'Upgrading to All-Access',
    body: (
      <p>
        If you buy all-access within 7 days of buying a single course, email us and we will refund the single course, so you do not pay twice for it.
      </p>
    ),
  },
  {
    title: 'Failed, Duplicate or Unconfirmed Payments',
    body: (
      <ul className="list-disc list-inside">
        <li>
          If money left your account but the payment failed, your bank or Razorpay returns it automatically, usually within 5–7 working days. Nothing
          needs to be done.
        </li>
        <li>If you were charged twice for the same course, we refund the extra payment as soon as we see it, or when you tell us.</li>
        <li>If you paid but the course did not unlock within one hour, contact us with the payment reference. We will unlock it or refund you.</li>
      </ul>
    ),
  },
  {
    title: 'Cancellation',
    body: (
      <p>
        Courses are one-time purchases with no subscription or automatic renewal, so there is nothing to cancel. A payment can be cancelled before it is
        completed by closing the Razorpay window; you are not charged. After a refund, access to the refunded course is removed; your progress is kept in
        case you buy it again.
      </p>
    ),
  },
  {
    title: 'How Refunds Are Paid',
    body: (
      <p>
        Approved refunds are issued through Razorpay to the original payment method (card, UPI, bank account or wallet) within 2 working days of approval.
        Banks then usually take 5–7 working days to show the money in your account. We will email you when the refund is issued.
      </p>
    ),
  },
  {
    title: 'Withdrawn Courses',
    body: (
      <p>
        If we permanently withdraw a paid course within 12 months of your purchase, you may ask for a full refund of that course, as described in the{' '}
        <A href="terms.html">Terms of Use</A>.
      </p>
    ),
  },
  {
    title: 'How to Ask for a Refund',
    body: (
      <>
        <p>Email us from the address on your Learning Lab account with the course name and the Razorpay payment reference:</p>
        <ContactDetails />
      </>
    ),
  },
];

renderLegal({ title: 'Refund &', accent: 'Cancellation Policy', sections });
