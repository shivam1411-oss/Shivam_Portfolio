export const profile = {
  name: 'Shivam Soni',
  tagline: 'Collection Strategy Leader',
  role: 'Manager, Business & Collection Strategy',
  location: 'Pune, India',
  relocation: 'Open to relocation: Gurgaon or Indore',
  photo: 'assets/profile-photo.jpg',
  resume: 'assets/Shivam-Soni-Resume.pdf',
};

// Phone numbers are shown masked; the links still open WhatsApp / the dialler.
export const contacts = [
  { key: 'email', label: 'Email', value: 'Shivam.soni1495@outlook.com', href: 'mailto:Shivam.soni1495@outlook.com' },
  { key: 'whatsapp', label: 'WhatsApp', value: '+91 ••••• ••456', href: 'https://wa.me/918962882456', external: true },
  { key: 'linkedin', label: 'LinkedIn', value: 'shivam-soni-99240584', href: 'https://www.linkedin.com/in/shivam-soni-99240584', external: true },
  { key: 'github', label: 'GitHub', value: 'shivam1411-oss', href: 'https://github.com/shivam1411-oss', external: true },
  { key: 'phone', label: 'Phone', value: '+91 ••••• ••456', href: 'tel:+918962882456' },
];

export const navLinks = [
  { id: 'impact', label: 'Metrics' },
  { id: 'experience', label: 'Timeline' },
  { id: 'lab', label: 'Analytical Lab' },
];

export const headlineStats = [
  { value: 1.5, decimals: 1, suffix: '%', label: 'Slippage Cut' },
  { value: 65, suffix: '%', label: 'Efficiency' },
  { value: 12, suffix: ' Days', label: 'DSO Cut' },
];

export const competencies = [
  'Treatment Strategy Design',
  'Champion-Challenger Testing',
  'Portfolio Segmentation',
  'Digital Collection Campaigns',
  'Cost of Collections',
];

export const techStack = [
  'SQL (hands-on query writing)',
  'Advanced Excel (Power Query, Pivot Tables, Index-Match)',
  'Power BI',
  'Python for Analysis',
  'CRM Platforms (One Accord)',
  'MIS & Reporting',
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
      'Build treatment strategies segmenting accounts by risk, behaviour, and recovery likelihood.',
      'Run champion-challenger tests on channel mix and messaging, scaling the winning variant.',
      'Write SQL queries to build performance views and check test results independently of MIS.',
      'Led migration from Excel-based tracking to One Accord, a CRM-based operating model.',
      'Migration cut the number of collection agencies needed and lowered cost of collections.',
      'Prepare monthly performance packs for senior management on strategy tracking.',
    ],
  },
  {
    period: 'June 2023 – May 2026',
    title: 'Manager, Repayments',
    company: 'FPL Technologies (OneCard), Pune',
    points: [
      'Managed DPD 30–150 buckets, improving Collection Efficiency from 50% to 65%.',
      'Reduced forward roll rates by 15% through data-led risk segmentation.',
      'Directed agency productivity (field/tele-calling) via MoM analysis.',
      'Optimized collection cycles, cutting DSO by 12 days.',
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

export const labItems = [
  {
    key: 'CCTEST',
    category: 'Strategy Design',
    label: 'Champion-Challenger Testing',
    badge: 'Strategy Design',
    title: 'Champion-Challenger Testing',
    desc: 'Running parallel tests on channel mix, contact timing, and messaging against a control group, then rolling the winning variant into standing treatment logic.',
    math: 'Challenger > Champion → Scale',
  },
  {
    key: 'CEI',
    category: 'AR Metric',
    label: 'CEI (Efficiency Index)',
    badge: 'Efficiency Logic',
    title: 'CEI Analysis',
    desc: 'Measures the quality of collection performance relative to the collectible base over a specific period, factoring out aging beyond team control.',
    math: 'Efficiency ÷ Collectible Base',
  },
  {
    key: 'SLIP',
    category: 'Risk Metric',
    label: 'Slippage & Roll Analysis',
    badge: 'Risk Mitigation',
    title: 'Slippage Control',
    desc: "Tracking the migration of assets from 'Standard' to 'Delinquent' buckets. We target 'Net Slippage' to account for recovery offsets.",
    math: 'Gross Slip - Recoveries / Portfolio',
  },
  {
    key: 'DSO',
    category: 'Cash Flow Metric',
    label: 'DSO Reduction',
    badge: 'Cash Flow Metric',
    title: 'DSO Reduction',
    desc: 'Tracking Days Sales Outstanding through structured follow-up mechanisms and improved recovery cycles, cutting DSO by 12 days through cycle optimization.',
    math: 'AR ÷ Credit Sales × Days',
  },
  {
    key: 'PYSQL',
    category: 'Automation',
    label: 'SQL & Python',
    badge: 'Financial Automation',
    title: 'SQL & Python',
    desc: 'Writing SQL queries to pull and analyze portfolio data directly, and using Python for supplementary analysis, reducing dependence on standard MIS for test results.',
    math: 'SELECT bucket, SUM(balance) FROM ar GROUP BY bucket',
  },
];

// EmailJS public identifiers (safe to ship client-side).
export const emailjsConfig = {
  publicKey: 'RukU2P1HSI2LZ3cKh',
  serviceId: 'service_eo2x6tn',
  templateId: 'template_jt1abda',
};
