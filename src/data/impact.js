// "Impact by the numbers" section. Every figure here comes from the experience section;
// nothing is extrapolated.

export const impactMetrics = [
  {
    key: 'cei',
    label: 'Collection Efficiency (CEI)',
    value: 65,
    suffix: '%',
    before: '50%',
    change: '+15 pts',
    meaning: 'More of every rupee due is now collected each cycle.',
    // Real before/after on a 0–100% scale.
    bar: { from: 50, to: 65, max: 100, caption: 'Share of collectible dues recovered' },
  },
  {
    key: 'roll',
    label: 'Forward Roll Rate',
    value: 15,
    prefix: '−',
    suffix: '%',
    before: 'Baseline',
    change: '15% lower',
    meaning: 'Fewer accounts slide into the next, costlier delinquency bucket.',
    // Indexed to 100 before; 85 after a 15% reduction.
    bar: { from: 100, to: 85, max: 100, caption: 'Accounts rolling forward (index, before = 100)', lowerIsBetter: true },
  },
  {
    key: 'dso',
    label: 'Days Sales Outstanding',
    value: 12,
    prefix: '−',
    unit: 'days', // shown smaller beside the number so it fits on one line
    before: 'Baseline',
    change: '12 days faster',
    meaning: 'Cash reaches the business almost two weeks sooner.',
  },
  {
    key: 'slip',
    label: 'Slippage',
    value: 1.5,
    decimals: 1,
    prefix: '−',
    suffix: '%',
    before: 'Baseline',
    change: '1.5% lower',
    meaning: 'Fewer performing accounts tip into default.',
  },
];

export const careerScope = [
  { value: '7+', label: 'Years in unsecured credit' },
  { value: '4', label: 'Roles, 3 employers' },
  { value: '3', label: 'Sectors: banking, NBFC & fintech' },
  { value: '7–8', label: 'Field, tele-calling & tracing agencies directed' },
  { value: '30–150', label: 'DPD buckets owned at OneCard' },
];

// How the results were produced, in order. Each links to the method that measures it.
export const impactLevers = [
  { step: 'Segment', detail: 'Accounts grouped by risk, behaviour and recovery likelihood.' },
  { step: 'Treat', detail: 'Each segment gets its own channel mix, timing and messaging.' },
  { step: 'Test', detail: 'Champion-challenger runs prove which treatment wins.' },
  { step: 'Automate', detail: 'Excel tracking replaced by a CRM-driven operating model.' },
  { step: 'Measure', detail: 'SQL views track CEI, roll rates and slippage independently of MIS.' },
];
