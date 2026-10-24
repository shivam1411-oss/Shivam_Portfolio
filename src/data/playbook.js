// The Collections Playbook (Analytical Lab): each method with its correct formula, a live
// calculator, a plain-English reading of the result, where it was applied, and the SQL behind it.

const pct = (v) => `${v.toFixed(1)}%`;

/** Two-proportion z-test: is the challenger's cure rate genuinely better than the champion's? */
function championChallenger({ n1, c1, n2, c2 }) {
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = se ? (p2 - p1) / se : 0;
  const lift = p1 ? ((p2 - p1) / p1) * 100 : 0;
  return { p1, p2, z, lift };
}

export const playbook = [
  {
    key: 'cei',
    category: 'Recovery quality',
    label: 'Collection Efficiency Index',
    question: 'Of everything that could have been collected this cycle, how much actually was?',
    formula: ['CEI', '=', '(Opening AR + Billed − Closing AR)', '÷', '(Opening AR + Billed − Closing current AR)', '× 100'],
    explain:
      'Unlike a simple collection rate, CEI only counts dues that were actually collectible in the period, so it rewards the team for what it could control.',
    inputs: [
      { id: 'open', label: 'Opening receivables', unit: '₹ Cr', min: 50, max: 200, step: 1, value: 100 },
      { id: 'billed', label: 'Billed this cycle', unit: '₹ Cr', min: 10, max: 100, step: 1, value: 40 },
      { id: 'close', label: 'Closing receivables', unit: '₹ Cr', min: 20, max: 200, step: 1, value: 77 },
      { id: 'current', label: 'Closing current (not yet due)', unit: '₹ Cr', min: 0, max: 120, step: 1, value: 43 },
    ],
    compute: ({ open, billed, close, current }) => {
      const denom = open + billed - current;
      const v = denom > 0 ? ((open + billed - close) / denom) * 100 : 0;
      return {
        value: Math.max(0, v),
        format: pct,
        label: 'Collection efficiency',
        verdict: v >= 80 ? 'Excellent recovery' : v >= 60 ? 'Healthy recovery' : 'Needs attention',
        tone: v >= 60 ? 'good' : 'warn',
      };
    },
    applied: 'Lifted CEI from 50% to 65% on the DPD 30–150 buckets of the OneCard credit card book.',
    sql: `SELECT month,
  100.0 * (opening_ar + billed - closing_ar)
        / NULLIF(opening_ar + billed - closing_current, 0) AS cei
FROM ar_monthly
WHERE dpd_bucket BETWEEN 30 AND 150
ORDER BY month;`,
  },
  {
    key: 'roll',
    category: 'Early warning',
    label: 'Roll Rate Analysis',
    question: 'How many accounts in a bucket slip into a worse bucket next month?',
    formula: ['Roll rate', '=', 'Balance that rolled to the next bucket', '÷', "Bucket's balance last month", '× 100'],
    explain:
      'Roll rates are the earliest signal that a segment is deteriorating. Watching them by bucket shows where treatment has to change before losses build.',
    inputs: [
      { id: 'bucket', label: 'Balance in DPD 30–60 last month', unit: '₹ Cr', min: 10, max: 200, step: 1, value: 100 },
      { id: 'rolled', label: 'Of which rolled to DPD 60–90', unit: '₹ Cr', min: 0, max: 100, step: 1, value: 22 },
    ],
    compute: ({ bucket, rolled }) => {
      const v = bucket > 0 ? (Math.min(rolled, bucket) / bucket) * 100 : 0;
      return {
        value: v,
        format: pct,
        label: 'Forward roll rate',
        verdict: v <= 15 ? 'Contained' : v <= 25 ? 'Watch closely' : 'High: change treatment',
        tone: v <= 25 ? 'good' : 'warn',
      };
    },
    applied: 'Reduced forward roll rates by 15% through data-led risk segmentation.',
    sql: `SELECT prev.bucket AS from_bucket,
  100.0 * SUM(CASE WHEN cur.bucket > prev.bucket THEN prev.balance ELSE 0 END)
        / NULLIF(SUM(prev.balance), 0) AS roll_rate
FROM dpd_snapshot prev
JOIN dpd_snapshot cur
  ON cur.acct_id = prev.acct_id
 AND cur.month = prev.month + INTERVAL '1 month'
GROUP BY prev.bucket
ORDER BY prev.bucket;`,
  },
  {
    key: 'dso',
    category: 'Cash flow',
    label: 'Days Sales Outstanding',
    question: 'On average, how many days does it take to turn dues into cash?',
    formula: ['DSO', '=', 'Receivables', '÷', 'Credit sales in the period', '× Days in the period'],
    explain:
      'Every day shaved off DSO is cash the business can use sooner. It reflects how tight follow-up cycles and recovery timelines are.',
    inputs: [
      { id: 'ar', label: 'Receivables outstanding', unit: '₹ Cr', min: 5, max: 100, step: 1, value: 30 },
      { id: 'sales', label: 'Credit sales in the period', unit: '₹ Cr', min: 10, max: 200, step: 1, value: 60 },
      { id: 'days', label: 'Days in the period', unit: 'days', min: 30, max: 365, step: 1, value: 90 },
    ],
    compute: ({ ar, sales, days }) => {
      const v = sales > 0 ? (ar / sales) * days : 0;
      return {
        value: v,
        format: (x) => `${Math.round(x)} days`,
        label: 'Days sales outstanding',
        verdict: v <= 30 ? 'Fast cash conversion' : v <= 60 ? 'Average' : 'Slow: cash is tied up',
        tone: v <= 60 ? 'good' : 'warn',
      };
    },
    applied: 'Cut DSO by 12 days by optimising collection cycles and structured follow-up.',
    sql: `SELECT
  (SELECT SUM(balance) FROM ar_ledger WHERE as_of = CURRENT_DATE)
  / NULLIF(SUM(amount), 0) * 90 AS dso_days
FROM credit_sales
WHERE sale_date >= CURRENT_DATE - INTERVAL '90 days';`,
  },
  {
    key: 'slip',
    category: 'Credit risk',
    label: 'Net Slippage',
    question: 'What share of the healthy book turned bad, after recoveries?',
    formula: ['Net slippage', '=', '(Fresh slippage − Upgrades & recoveries)', '÷', 'Opening standard book', '× 100'],
    explain:
      'Gross slippage shows accounts going bad; net slippage credits the ones brought back. It is the truest view of how the book is moving.',
    inputs: [
      { id: 'book', label: 'Opening standard book', unit: '₹ Cr', min: 100, max: 2000, step: 10, value: 1000 },
      { id: 'fresh', label: 'Fresh slippage', unit: '₹ Cr', min: 0, max: 100, step: 1, value: 40 },
      { id: 'back', label: 'Upgrades & recoveries', unit: '₹ Cr', min: 0, max: 100, step: 1, value: 25 },
    ],
    compute: ({ book, fresh, back }) => {
      const v = book > 0 ? ((fresh - back) / book) * 100 : 0;
      return {
        value: v,
        format: pct,
        label: 'Net slippage',
        verdict: v <= 0 ? 'Book is improving' : v <= 2 ? 'Low' : v <= 4 ? 'Moderate' : 'High',
        tone: v <= 2 ? 'good' : 'warn',
      };
    },
    applied: 'Cut slippage by 1.5% on the credit card book through early-bucket treatment.',
    sql: `SELECT month,
  100.0 * (SUM(fresh_slippage) - SUM(upgrades + recoveries))
        / NULLIF(SUM(opening_standard), 0) AS net_slippage
FROM portfolio_monthly
GROUP BY month
ORDER BY month;`,
  },
  {
    key: 'cc',
    category: 'Strategy design',
    label: 'Champion-Challenger Testing',
    question: 'Is a new treatment really better, or did it just get lucky?',
    formula: ['Lift', '=', '(Challenger cure rate − Champion cure rate)', '÷', 'Champion cure rate', '· z-test for significance'],
    explain:
      'A challenger only replaces the champion when its gain is statistically significant, so strategy changes are backed by evidence, not hunches.',
    inputs: [
      { id: 'n1', label: 'Champion accounts', unit: '', min: 500, max: 20000, step: 100, value: 5000 },
      { id: 'c1', label: 'Champion accounts cured', unit: '', min: 0, max: 20000, step: 10, value: 1500 },
      { id: 'n2', label: 'Challenger accounts', unit: '', min: 500, max: 20000, step: 100, value: 5000 },
      { id: 'c2', label: 'Challenger accounts cured', unit: '', min: 0, max: 20000, step: 10, value: 1650 },
    ],
    compute: (v) => {
      const n1 = v.n1;
      const n2 = v.n2;
      const r = championChallenger({ n1, c1: Math.min(v.c1, n1), n2, c2: Math.min(v.c2, n2) });
      const significant = Math.abs(r.z) >= 1.96;
      return {
        value: r.lift,
        format: (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)}%`,
        label: `Lift in cure rate (${pct(r.p1 * 100)} → ${pct(r.p2 * 100)})`,
        verdict: significant
          ? r.lift > 0
            ? 'Significant at 95%: scale the challenger'
            : 'Significant at 95%: keep the champion'
          : 'Not significant yet: keep testing',
        tone: significant && r.lift > 0 ? 'good' : 'warn',
      };
    },
    applied: 'Ran champion-challenger tests on channel mix and messaging, scaling the winning variant into standing treatment logic.',
    sql: `SELECT arm,                         -- 'champion' or 'challenger'
  COUNT(*)                                AS accounts,
  SUM(CASE WHEN cured THEN 1 ELSE 0 END)  AS cured,
  AVG(CASE WHEN cured THEN 1.0 ELSE 0 END) AS cure_rate
FROM strategy_test
WHERE test_id = 'channel_mix_test'
GROUP BY arm;`,
  },
];
