export const profile = {
  name: 'Shivam Soni',
  tagline: 'Business & Collection Strategy',
  role: 'Manager, Business & Collection Strategy',
  location: 'Pune, India',
  relocation: 'Open to relocation: Gurgaon or Indore',
  // Profile photo, two crops of the same picture in public/assets/: `photo` (head to chest, 720px) for the
  // large hero and `photoFace` (head and shoulders, 256px) for the small round avatars. Set `photo` to ''
  // and the Avatar component shows the initials instead.
  photo: 'assets/profile-photo.jpg',
  photoFace: 'assets/profile-photo-face.jpg',
  // Built from resume/resume.html by `npm run resume`; change the month here when you rebuild it.
  resume: 'assets/Shivam-Soni-Resume.pdf',
  resumeUpdated: 'November 2026',
};

// Phone numbers are shown masked; the links still open WhatsApp / the dialler.
export const contacts = [
  { key: 'email', label: 'Email', value: 'Shivam.soni1495@outlook.com', href: 'mailto:Shivam.soni1495@outlook.com' },
  { key: 'whatsapp', label: 'WhatsApp', value: '+91 ••••• ••456', href: 'https://wa.me/918962882456', external: true },
  { key: 'linkedin', label: 'LinkedIn', value: 'shivamsoni-strategy', href: 'https://www.linkedin.com/in/shivamsoni-strategy', external: true },
  { key: 'github', label: 'GitHub', value: 'shivam1411-oss', href: 'https://github.com/shivam1411-oss', external: true },
  { key: 'phone', label: 'Phone', value: '+91 ••••• ••456', href: 'tel:+918962882456' },
];

// The page's sections, in order. Each id is the section's element id.
export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'impact', label: 'Metrics' },
  { id: 'experience', label: 'Timeline' },
  { id: 'skills', label: 'Skills' },
  { id: 'lab', label: 'Lab' },
  { id: 'contact', label: 'Contact' },
];

// "About" section. Every statement here comes from the experience list below; nothing is added.
export const about = {
  // Shown large in the About section; `hl` words take the accent gradient.
  quote: [{ t: 'Where ' }, { t: 'finance', hl: true }, { t: ' meets ' }, { t: 'tech', hl: true }, { t: ', every rupee recovered is engineered, not chased.' }],
  experience: '7+ years in credit: banking, NBFC and fintech',
  paragraphs: [
    'I am a business and collection strategy manager with 7+ years in consumer credit across Bandhan Bank, HDFC Bank and OneCard. I started in micro-lending and SME credit, ran collections for a consumer durable and point-of-sale credit portfolio, and now own the treatment strategy for OneCard\'s credit card book.',
    'My work combines strategy with hands-on analysis. I segment accounts by risk, behaviour and recovery likelihood, test changes to channel mix, timing and messaging with champion-challenger experiments, and write the SQL to check the results myself.',
    'I also take changes from idea to rollout. I led One Accord, a CRM platform that replaced Excel tracking, from requirements and UAT to adoption by every internal team and partner agency, built the collections strategy for a new Personal Loan product with L&T Finance, and write the business cases that get initiatives approved.',
  ],
};

// How the work is done, shown as three cards in the About section.
export const heroPillars = [
  {
    key: 'automation',
    title: 'Automated collections',
    body: 'Moved collections from Excel to a CRM-driven model, needing fewer agencies at a lower cost.',
  },
  {
    key: 'testing',
    title: 'Strategy, tested',
    body: 'Champion-challenger tests decide channel, timing and messaging. Only proven winners scale.',
  },
  {
    key: 'results',
    title: 'Measurable results',
    body: 'Collection efficiency 50%\u00A0→\u00A065%, forward roll rates −15%, DSO −12\u00A0days.',
  },
];

export const competencies = [
  'Treatment Strategy Design',
  'Champion-Challenger Testing',
  'Portfolio Segmentation',
  'Go-to-Market Strategy',
  'Business Case Development',
  'Cost of Collections',
];

// Taking a change from idea to adoption (the One Accord rollout, the Personal Loan launch).
export const deliverySkills = ['Product Rollout & Adoption', 'Requirements Definition', 'User Acceptance Testing (UAT)', 'Agile Delivery (Sprints, Backlog)', 'Stakeholder Management'];

export const techStack = [
  'SQL (hands-on query writing)',
  'Advanced Excel (Power Query, Pivot Tables, Index-Match)',
  'Power BI',
  'Python for Analysis',
  'CRM Platforms (One Accord)',
  'MIS & Reporting',
  'Jira (boards, sprints, JQL)',
  'React',
];

// The Skills section: the same skills as above, grouped by what they are used for, each group with
// one line of evidence taken from the experience list or from this site itself.
export const skillGroups = [
  {
    key: 'strategy',
    title: 'Business & collection strategy',
    blurb: 'Deciding who to contact, through which channel, when, and at what cost, and making the case for it.',
    items: competencies,
    proof: 'Collection efficiency 50% → 65% on the DPD 30–150 buckets.',
  },
  {
    key: 'delivery',
    title: 'Product delivery',
    blurb: 'Taking a change from requirements to the day every team is using it.',
    items: deliverySkills,
    proof: 'Led One Accord from requirements and UAT to adoption by every internal team and partner agency.',
  },
  {
    key: 'data',
    title: 'Data & analysis',
    blurb: 'Getting the numbers myself instead of waiting for a report.',
    items: ['SQL (hands-on query writing)', 'Python for Analysis', 'Advanced Excel (Power Query, Pivot Tables, Index-Match)', 'Power BI', 'MIS & Reporting'],
    proof: 'I write the SQL that checks test results independently of MIS.',
  },
  {
    key: 'tools',
    title: 'Tools',
    blurb: 'The systems the work runs on, and the tools used to plan and ship it.',
    items: ['CRM Platforms (One Accord)', 'Jira (boards, sprints, JQL)', 'React'],
    proof: 'Led the move from Excel tracking to a CRM-driven model. This site and its Learning Lab are built in React.',
  },
];

export const education = [
  { degree: 'MBA Finance', school: 'International Institute of Professional Studies, DAVV', year: '2019' },
  { degree: 'BBA Finance/Marketing', school: 'Shri RGP Gujrati Professional Institute, DAVV', year: '2017' },
];

export const experience = [
  {
    period: 'June 2026 – Present',
    title: 'Manager, Business & Collection Strategy',
    company: 'FPL Technologies (OneCard), Pune',
    current: true,
    points: [
      'Own treatment strategy for the credit card portfolio, segmenting accounts by risk, payment behaviour and recovery likelihood.',
      'Run champion-challenger experiments on channel mix, contact timing and messaging; winners become standard logic.',
      'Led the rollout of One Accord, a CRM platform replacing Excel tracking: requirements, UAT and onboarding of every team and agency.',
      'Rollout outcome: fewer agencies needed, more of the book on digital channels, and a lower cost of collections.',
      'Built the collections strategy for a new Personal Loan product while onboarding L&T Finance as the lending partner.',
      'Write business cases that secured leadership approval for initiatives such as a field-channel callback mechanism.',
      'Deliver strategy and product changes through Agile sprints with cross-functional teams.',
      'Write SQL to build performance views, size opportunities and check test results independently of MIS.',
    ],
  },
  {
    period: 'June 2023 – May 2026',
    title: 'Manager, Repayments',
    company: 'FPL Technologies (OneCard), Pune',
    points: [
      'Owned the DPD 30–150 credit card book, raising collection efficiency from 50% to 65% within six months.',
      'Cut forward roll rates by 15% and net slippage by 1.5% using roll-rate and flow analysis.',
      'Reduced DSO by 12 days through changes to the collection cycle.',
      'Built field allocation logic around risk segment and recovery probability.',
      'Managed field, tele-calling and tracing agencies on productivity and compliance.',
    ],
  },
  {
    period: 'Sep 2020 – June 2023',
    title: 'Retail Portfolio Management, Collections',
    company: 'HDFC Bank, Pune · Consumer Durables & Point of Sale Credit',
    summary:
      'Ran collections for a consumer durable and point-of-sale credit portfolio across Pune and Nashik, working through 7–8 field, tele-calling, and tracing agencies alongside an in-house team. Conducted ageing, roll rate, and slippage analysis, and reduced portfolio opening balance through rollback and normalisation, holding the team to budgeted Account Collection Ratio (ACR) targets.',
  },
  {
    period: 'July 2019 – July 2020',
    title: 'Area Manager',
    company: 'Bandhan Bank, Indore',
    summary:
      'Appraised, sanctioned, and disbursed micro-lending and SME credit against borrower eligibility and repayment capacity, covering the full credit lifecycle from origination through delinquency management. Produced weekly, monthly, and quarterly MIS for senior management across the assigned territory.',
  },
];

