import { B, Callout, F, H, P, Term } from '../ui';
import PyRunner from '../python/PyRunner';
import { useState } from 'react';
import { py } from '../python/py';

// "Data Analysis with pandas": NumPy foundations, then the pandas skills analyst roles ask for most
// (reading, selecting, cleaning, transforming, groupby, reshaping, merging, time series) on one
// collections dataset in data/ (see python/datasets.js).

const modules = [
  { id: 'pd-start', title: 'Start here', level: 'Beginner', blurb: 'Everything you already do in Excel, translated into pandas.' },
  { id: 'numpy', title: 'NumPy foundations', level: 'Intermediate', blurb: 'Fast maths on whole arrays at once: the engine underneath pandas.' },
  { id: 'frames', title: 'DataFrames', level: 'Intermediate', blurb: 'Series and DataFrames, reading a CSV, and getting to know a dataset.' },
  { id: 'select', title: 'Selecting and sorting', level: 'Intermediate', blurb: 'Columns, rows, filters, loc and iloc, sorting and ranking.' },
  { id: 'clean', title: 'Cleaning data', level: 'Intermediate', blurb: 'Missing values, wrong types, messy text and duplicates.' },
  { id: 'transform', title: 'Transform, group and reshape', level: 'Advanced', blurb: 'New columns, buckets, groupby, pivot tables and crosstabs.' },
  { id: 'combine', title: 'Combining data and time', level: 'Advanced', blurb: 'Joining tables like SQL, and working with dates and monthly trends.' },
  { id: 'pd-project', title: 'Project', level: 'Advanced', blurb: 'A full portfolio report from raw files, the way it is done at work.' },
];

const DATA_NOTE = (
  <Callout title="The sample data">
    Every lesson can read five made-up files: <F>data/accounts.csv</F> (20 accounts), <F>data/payments.csv</F> (69 payments, Jan–Jun 2026),{' '}
    <F>data/monthly.csv</F> (receivables in ₹ crore), <F>data/dpd_history.csv</F> (each account's bucket in May and June) and a messy{' '}
    <F>data/accounts_raw.csv</F>. They are restored before every run, so you cannot break them.
  </Callout>
);

// Everyday Excel actions and their pandas equivalents, each runnable on the sample data.
const EXCEL_TASKS = [
  { id: 'open', label: 'Open a file', excel: 'File → Open accounts.csv, then scroll to look at it.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")   # open the file
print(acc.head())                         # look at the first 5 rows
print(acc.shape, "rows and columns")
` },
  { id: 'filter', label: 'Filter', excel: 'Data → Filter, then tick only rows where DPD is greater than 60.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
late = acc[acc["dpd"] > 60]          # keep rows where the condition is True
print(late[["account_id", "city", "dpd"]])
` },
  { id: 'sort', label: 'Sort', excel: 'Data → Sort by Balance, largest to smallest.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.sort_values("balance", ascending=False)[["account_id", "balance"]].head())
` },
  { id: 'formula', label: 'Formula column', excel: 'Type =G2/F2 in a new column and drag it down to every row.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
acc["utilisation"] = acc["balance"] / acc["credit_limit"]   # one line fills every row
print(acc[["account_id", "balance", "credit_limit", "utilisation"]].round(2).head())
` },
  { id: 'sumif', label: 'SUMIF / COUNTIF', excel: '=SUMIF(D:D, "Card", G:G) for each product, and COUNTIF for the count.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.groupby("product")["balance"].sum())     # SUMIF for every product at once
print(acc["product"].value_counts())               # COUNTIF
` },
  { id: 'vlookup', label: 'VLOOKUP', excel: '=VLOOKUP(B2, Accounts!A:I, 9, FALSE) to bring each payment\'s agent across.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")
pay = pay.merge(acc[["account_id", "agent"]], on="account_id", how="left")   # look up agent
print(pay[["payment_id", "account_id", "amount", "agent"]].head())
` },
  { id: 'pivot', label: 'Pivot table', excel: 'Insert → PivotTable: City in Rows, Product in Columns, Sum of Balance in Values.', code: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.pivot_table(index="city", columns="product", values="balance", aggfunc="sum", fill_value=0))
` },
  { id: 'dupes', label: 'Remove duplicates', excel: 'Data → Remove Duplicates on the Account ID column.', code: py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")
print(len(raw), "rows before")
clean = raw.drop_duplicates(subset="account_id")
print(len(clean), "rows after")
` },
];

function ExcelTranslator() {
  const [task, setTask] = useState(EXCEL_TASKS[1]);
  return (
    <div className="my-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Excel tasks">
        {EXCEL_TASKS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === task.id}
            onClick={() => setTask(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              t.id === task.id ? 'bg-accent text-bg border-accent' : 'bg-surface border-line text-muted hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 p-4 rounded-2xl bg-[#107c41]/10 border border-[#107c41]/30 text-sm">
        <span className="font-extrabold text-[#107c41] dark:text-[#4ade80]">In Excel: </span>
        <span className="text-fg">{task.excel}</span>
      </div>
      <PyRunner key={task.id} code={task.code} title={`In pandas: ${task.label}`} />
    </div>
  );
}

const lessons = [
  // ---------------------------------------------------------------- Start here
  {
    id: 'pd-excel',
    module: 'pd-start',
    title: 'From Excel to pandas',
    minutes: 12,
    goals: ['See how everyday Excel actions map to pandas', 'Run your first pandas commands on real-looking data', 'Know what pandas adds: repeatable, bigger, faster'],
    body: () => (
      <>
        <P>
          If you use Excel, you already know most of what pandas does. A <Term id="dataframe">DataFrame</Term> is a sheet, a column is a <Term id="series">Series</Term>, and
          each click you make in Excel (filter, sort, SUMIF, VLOOKUP, pivot table) becomes one line of code. The difference: the code remembers every step, so next month's
          report is one click instead of an afternoon.
        </P>
        {DATA_NOTE}
        <H>Pick something you do in Excel</H>
        <ExcelTranslator />
        <H>Why bother, if Excel works?</H>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>Repeatable:</B> the same steps run identically every month, with no copy-paste slips.
          </li>
          <li>
            <B>Bigger:</B> pandas handles millions of rows that would freeze a spreadsheet.
          </li>
          <li>
            <B>Traceable:</B> anyone can read exactly how a number was calculated.
          </li>
        </ul>
        <Callout title="How to use this course">
          Run every example, change a number or a column name, and run it again. Use <B>Step through</B> to watch what each line does. You cannot break anything.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-first-report',
        title: 'Your first pandas report',
        prompt:
          'Do three Excel jobs in pandas: (1) Filter: set overdue to the accounts with dpd over 30. (2) Sort: sort overdue by balance, largest first. (3) SUMIF: set by_product to the total balance of overdue accounts per product.',
        starter: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

overdue = None      # 1. filter dpd > 30, then 2. sort by balance (largest first)
by_product = None   # 3. total balance per product (of the overdue accounts)

print(overdue)
print(by_product)
`,
        tests: [
          { name: 'overdue has only accounts over 30 DPD', code: py`
import pandas as pd
assert isinstance(overdue, pd.DataFrame), f"overdue is {type(overdue).__name__}"
n = int((pd.read_csv("data/accounts.csv")["dpd"] > 30).sum())
assert (overdue["dpd"] > 30).all() and len(overdue) == n, f"{len(overdue)} rows; expected {n} with dpd > 30"
` },
          { name: 'overdue is sorted by balance, largest first', code: py`assert overdue["balance"].is_monotonic_decreasing, "sort with sort_values('balance', ascending=False)"` },
          { name: 'by_product totals the overdue balances', code: py`
import pandas as pd
a = pd.read_csv("data/accounts.csv")
ref = a[a["dpd"] > 30].groupby("product")["balance"].sum()
assert by_product.sort_index().tolist() == ref.tolist(), f"got {by_product.to_dict()}"
` },
        ],
        hint: 'overdue = acc[acc["dpd"] > 30].sort_values("balance", ascending=False); by_product = overdue.groupby("product")["balance"].sum()',
        solution: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

overdue = acc[acc["dpd"] > 30].sort_values("balance", ascending=False)
by_product = overdue.groupby("product")["balance"].sum()

print(overdue)
print(by_product)
`,
      },
    ],
    quiz: [
      { q: 'Which pandas tool does the job of SUMIF?', options: ['sort_values', 'groupby(...).sum()', 'merge', 'read_csv'], answer: 1, why: 'groupby splits rows by a column and sums each group, like SUMIF for every category at once.' },
      { q: 'Which pandas tool replaces VLOOKUP?', options: ['merge', 'pivot_table', 'fillna', 'head'], answer: 0, why: 'merge brings in columns from another table by matching a key, like VLOOKUP but for whole rows.' },
    ],
  },

  // ---------------------------------------------------------------- NumPy
  {
    id: 'np-arrays',
    module: 'numpy',
    title: 'Arrays and vectorised maths',
    minutes: 12,
    goals: ['Create NumPy arrays and read their shape and type', 'Do maths on a whole array without a loop', 'Summarise with sum, mean, std, min and max'],
    body: () => (
      <>
        <P>
          <Term id="numpy">NumPy</Term> stores numbers in a compact <B>array</B> and does maths on all of them at once. That is called <B>vectorised</B> code, and it is
          typically 10–100× faster than a Python loop. pandas is built on top of it, so this is the foundation for everything that follows.
        </P>
        <PyRunner
          code={py`
import numpy as np

balances = np.array([37700, 106400, 17700, 54100, 131600])
print(balances, balances.dtype, balances.shape)

interest = balances * 0.36 / 12        # every element at once, no loop
print(interest.round(2))
print("total", balances.sum(), "mean", balances.mean(), "max", balances.max())
`}
        />
        <H>Loop versus vectorised</H>
        <PyRunner
          code={py`
import numpy as np, time

values = np.random.default_rng(1).integers(1_000, 500_000, size=1_000_000)

start = time.perf_counter()
total = 0
for v in values:            # a Python loop: one number at a time
    total += v * 0.02
loop_ms = (time.perf_counter() - start) * 1000

start = time.perf_counter()
total2 = (values * 0.02).sum()   # vectorised
vec_ms = (time.perf_counter() - start) * 1000

print(f"loop {loop_ms:.0f} ms, vectorised {vec_ms:.1f} ms, same answer: {abs(total - total2) < 1}")
`}
        />
        <H>Two arrays together, and 2-D arrays</H>
        <PyRunner
          code={py`
import numpy as np

limits = np.array([50000, 300000, 45000, 150000])
balances = np.array([37700, 106400, 17700, 54100])
print("utilisation", (balances / limits).round(3))

# rows = months, columns = products
grid = np.array([[42, 18, 7],
                 [40, 21, 9]])
print(grid.shape)
print("per product (down each column):", grid.sum(axis=0))
print("per month (along each row):   ", grid.sum(axis=1))
`}
        />
        <Callout title="axis in one sentence">
          <F>axis=0</F> collapses the rows (one result per column); <F>axis=1</F> collapses the columns (one result per row). pandas uses the same idea.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'np-interest',
        title: 'Interest on a whole book',
        prompt: 'Without a loop: set monthly to each balance × annual_rate ÷ 12 rounded to 2 decimals, total_interest to its sum, and over_1000 to how many monthly amounts exceed 1000.',
        starter: py`
import numpy as np

balances = np.array([37700, 106400, 17700, 54100, 131600, 40900, 67100])
annual_rate = 0.36

monthly = None
total_interest = None
over_1000 = None
print(monthly, total_interest, over_1000)
`,
        tests: [
          { name: 'monthly is a NumPy array of the right values', code: py`
import numpy as np
assert isinstance(monthly, np.ndarray), f"monthly is {type(monthly).__name__}"
assert np.allclose(monthly, (balances * annual_rate / 12).round(2)), f"got {monthly}"
` },
          { name: 'total_interest is the sum of monthly (13,665)', code: py`assert abs(total_interest - (balances * annual_rate / 12).round(2).sum()) < 0.01, f"got {total_interest}"` },
          { name: 'over_1000 == 6', code: py`assert over_1000 == 6, f"got {over_1000}"` },
        ],
        hint: 'monthly = (balances * annual_rate / 12).round(2); total_interest = monthly.sum(); over_1000 = (monthly > 1000).sum()',
        solution: py`
import numpy as np

balances = np.array([37700, 106400, 17700, 54100, 131600, 40900, 67100])
annual_rate = 0.36

monthly = (balances * annual_rate / 12).round(2)
total_interest = monthly.sum()
over_1000 = (monthly > 1000).sum()
print(monthly, total_interest, over_1000)
`,
      },
    ],
    quiz: [
      { q: 'What does np.array([1, 2, 3]) * 2 give?', options: ['[1, 2, 3, 1, 2, 3]', 'array([2, 4, 6])', 'An error', '12'], answer: 1, why: 'Arithmetic on an array applies to every element. (A plain list would repeat instead.)' },
      { q: 'For a 2-D array, what does .sum(axis=0) return?', options: ['One total per row', 'One total per column', 'The grand total', 'The first row'], answer: 1, why: 'axis=0 collapses the rows, leaving one value per column.' },
    ],
  },
  {
    id: 'np-masks',
    module: 'numpy',
    title: 'Boolean masks, np.where and np.select',
    minutes: 10,
    goals: ['Filter arrays with conditions (masks)', 'Choose between two values with np.where', 'Label many cases at once with np.select'],
    body: () => (
      <>
        <P>A comparison on an array gives an array of True/False, called a <B>mask</B>. Use it to filter, to count, or to choose values.</P>
        <PyRunner
          code={py`
import numpy as np

dpd = np.array([0, 12, 47, 64, 95, 5, 130])
late = dpd > 60
print(late)                         # the mask
print(dpd[late])                    # keep only the True positions
print("how many:", late.sum(), "share:", late.mean().round(2))   # True counts as 1
print(dpd[(dpd > 0) & (dpd <= 30)]) # combine with & (and), | (or); brackets matter
`}
        />
        <H>np.where: one of two values</H>
        <PyRunner
          code={py`
import numpy as np

dpd = np.array([0, 12, 47, 64, 95])
print(np.where(dpd > 30, "call", "sms"))
`}
        />
        <H>np.select: many cases (DPD buckets)</H>
        <PyRunner
          code={py`
import numpy as np

dpd = np.array([0, 12, 47, 64, 95, 30, 60])
conditions = [dpd == 0, dpd <= 30, dpd <= 60, dpd <= 90]
labels     = ["Current", "1-30", "31-60", "61-90"]
print(np.select(conditions, labels, default="90+"))   # first True condition wins
`}
        />
        <Callout tone="warn" title="Use &, | and ~ with brackets">
          On arrays (and pandas columns) write <F>(a &gt; 0) &amp; (a &lt; 30)</F>, not <F>a &gt; 0 and a &lt; 30</F>. The words and/or only work on single values.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'np-buckets',
        title: 'Bucket a book',
        prompt: 'Set buckets to the DPD bucket label of every account (Current, 1-30, 31-60, 61-90, 90+) using np.select, and late_share to the share of accounts over 60 DPD (a number between 0 and 1).',
        starter: py`
import numpy as np

dpd = np.array([0, 0, 5, 12, 27, 33, 41, 58, 64, 71, 85, 95, 112, 130, 9, 0])

buckets = None
late_share = None
print(buckets, late_share)
`,
        tests: [
          { name: 'buckets are correct', code: py`
expected = ["Current","Current","1-30","1-30","1-30","31-60","31-60","31-60","61-90","61-90","61-90","90+","90+","90+","1-30","Current"]
assert list(buckets) == expected, f"got {list(buckets)}"
` },
          { name: 'late_share == 0.375', code: py`assert abs(float(late_share) - 0.375) < 1e-9, f"got {late_share}"` },
        ],
        hint: 'conditions = [dpd == 0, dpd <= 30, dpd <= 60, dpd <= 90] with labels ["Current", "1-30", "31-60", "61-90"] and default="90+". late_share = (dpd > 60).mean()',
        solution: py`
import numpy as np

dpd = np.array([0, 0, 5, 12, 27, 33, 41, 58, 64, 71, 85, 95, 112, 130, 9, 0])

buckets = np.select([dpd == 0, dpd <= 30, dpd <= 60, dpd <= 90], ["Current", "1-30", "31-60", "61-90"], default="90+")
late_share = (dpd > 60).mean()
print(buckets, late_share)
`,
      },
    ],
    quiz: [
      { q: 'What does (np.array([5, 50, 500]) > 40).sum() return?', options: ['555', '2', '[False, True, True]', '550'], answer: 1, why: 'The mask is [False, True, True]; True counts as 1.' },
      { q: 'In np.select, which label is used when several conditions are True?', options: ['The last', 'The first one in the list', 'All of them', 'The default'], answer: 1, why: 'Conditions are checked in order and the first match wins, just like if/elif.' },
    ],
  },

  // ---------------------------------------------------------------- DataFrames
  {
    id: 'pd-basics',
    module: 'frames',
    title: 'Series and DataFrames',
    minutes: 10,
    goals: ['Know what a Series and a DataFrame are', 'Build a DataFrame from a dictionary', 'Read columns, add a column and do maths on columns'],
    body: () => (
      <>
        <P>
          <Term id="pandas">pandas</Term> gives you a <B>DataFrame</B>: a table with named columns, like a spreadsheet you control with code. Each column is a{' '}
          <B>Series</B>: a NumPy array with labels (the <B>index</B>).
        </P>
        <PyRunner
          code={py`
import pandas as pd

df = pd.DataFrame({
    "account": ["A1001", "A1002", "A1003"],
    "balance": [37700, 106400, 17700],
    "dpd": [0, 0, 47],
})
print(df)
print()
print(df["balance"])            # one column = a Series
print(type(df["balance"]).__name__, df.shape, list(df.columns))
`}
        />
        <H>Column maths and new columns</H>
        <PyRunner
          code={py`
import pandas as pd

df = pd.DataFrame({"account": ["A1001", "A1002", "A1003"], "limit": [50000, 300000, 45000], "balance": [37700, 106400, 17700]})
df["utilisation"] = (df["balance"] / df["limit"]).round(3)   # vectorised, like NumPy
df["over_75"] = df["utilisation"] > 0.75
print(df)
print("total balance:", df["balance"].sum())
`}
        />
        <Callout title="The index">
          The numbers on the left (0, 1, 2) are the <B>index</B>, the row labels. They can be meaningful too: <F>df.set_index("account")</F> lets you look rows up by
          account id.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-first-frame',
        title: 'Your first DataFrame',
        prompt: 'Build df with columns agent, called and paid for the three agents below. Add a column rate = paid ÷ called rounded to 2 decimals, and set best_agent to the agent with the highest rate.',
        starter: py`
import pandas as pd

agents = ["Kiran", "Neha", "Amit"]
called = [120, 95, 140]
paid = [42, 41, 38]

df = None
best_agent = None
print(df, best_agent)
`,
        tests: [
          { name: 'df is a DataFrame with agent, called, paid and rate', code: py`
import pandas as pd
assert isinstance(df, pd.DataFrame), f"df is {type(df).__name__}"
assert list(df.columns) == ["agent", "called", "paid", "rate"], f"columns are {list(df.columns)}"
` },
          { name: 'rate is correct', code: py`assert df["rate"].tolist() == [0.35, 0.43, 0.27], f"got {df['rate'].tolist()}"` },
          { name: 'best_agent == "Neha"', code: py`assert best_agent == "Neha", f"got {best_agent!r}"` },
        ],
        hint: 'df = pd.DataFrame({"agent": agents, "called": called, "paid": paid}); df["rate"] = (df["paid"] / df["called"]).round(2). For the best: df.loc[df["rate"].idxmax(), "agent"]',
        solution: py`
import pandas as pd

agents = ["Kiran", "Neha", "Amit"]
called = [120, 95, 140]
paid = [42, 41, 38]

df = pd.DataFrame({"agent": agents, "called": called, "paid": paid})
df["rate"] = (df["paid"] / df["called"]).round(2)
best_agent = df.loc[df["rate"].idxmax(), "agent"]
print(df, best_agent)
`,
      },
    ],
    quiz: [
      { q: 'What is one column of a DataFrame?', options: ['A list', 'A Series', 'A dict', 'A tuple'], answer: 1, why: 'A DataFrame is a collection of Series that share an index.' },
      { q: 'What does df.shape return for 20 rows and 9 columns?', options: ['(9, 20)', '(20, 9)', '180', '[20, 9]'], answer: 1, why: 'Rows first, then columns.' },
    ],
  },
  {
    id: 'pd-reading',
    module: 'frames',
    title: 'Reading and exploring data',
    minutes: 12,
    goals: ['Load a CSV with read_csv, including dates', 'Get to know a dataset with head, info, describe and value_counts', 'Answer first questions about the data'],
    body: () => (
      <>
        {DATA_NOTE}
        <PyRunner
          code={py`
import pandas as pd

accounts = pd.read_csv("data/accounts.csv", parse_dates=["opened"])
print(accounts.head())           # first 5 rows
print(accounts.shape)
`}
        />
        <H>The first five commands on any new dataset</H>
        <PyRunner
          code={py`
import pandas as pd

accounts = pd.read_csv("data/accounts.csv", parse_dates=["opened"])
accounts.info()                                  # columns, types, missing values
print(accounts["balance"].describe().round(0))   # count, mean, std, min, quartiles, max
print(accounts["product"].value_counts())        # how many of each
print(accounts["city"].nunique(), "cities")
`}
        />
        <Callout title="Read the types">
          In <F>info()</F>, <F>int64</F> and <F>float64</F> are numbers, <F>object</F> is text and <F>datetime64</F> is dates. A number column shown as{' '}
          <F>object</F> usually means something messy is hiding in it: the Cleaning module deals with that.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-explore',
        title: 'Profile the accounts',
        prompt: 'Read data/accounts.csv into accounts. Set n_accounts (number of rows), top_city (the city with the most accounts; any one if tied, so use value_counts().idxmax()), avg_balance (mean balance rounded to 0 decimals) and product_counts (a Series from value_counts on product).',
        starter: py`
import pandas as pd

accounts = None
n_accounts = None
top_city = None
avg_balance = None
product_counts = None
print(n_accounts, top_city, avg_balance)
print(product_counts)
`,
        tests: [
          { name: 'accounts has 20 rows and 9 columns', code: py`assert accounts.shape == (20, 9), f"shape is {getattr(accounts, 'shape', None)}"` },
          { name: 'n_accounts == 20', code: py`assert n_accounts == 20, f"got {n_accounts}"` },
          { name: 'top_city is the most common city', code: py`
import pandas as pd
ref = pd.read_csv("data/accounts.csv")["city"].value_counts()
assert top_city in ref[ref == ref.max()].index, f"got {top_city!r}"
` },
          { name: 'avg_balance == 86295', code: py`
import pandas as pd
ref = round(pd.read_csv("data/accounts.csv")["balance"].mean())
assert avg_balance == ref, f"got {avg_balance}, expected {ref}"
` },
          { name: 'product_counts has 7 / 7 / 6', code: py`assert sorted(product_counts.tolist()) == [6, 7, 7], f"got {product_counts.tolist()}"` },
        ],
        hint: 'accounts = pd.read_csv("data/accounts.csv"); n_accounts = len(accounts); top_city = accounts["city"].value_counts().idxmax(); avg_balance = round(accounts["balance"].mean())',
        solution: py`
import pandas as pd

accounts = pd.read_csv("data/accounts.csv")
n_accounts = len(accounts)
top_city = accounts["city"].value_counts().idxmax()
avg_balance = round(accounts["balance"].mean())
product_counts = accounts["product"].value_counts()
print(n_accounts, top_city, avg_balance)
print(product_counts)
`,
      },
    ],
    quiz: [
      { q: 'Which command shows each column\'s type and missing values?', options: ['df.head()', 'df.info()', 'df.describe()', 'df.shape'], answer: 1, why: 'info() lists columns, non-null counts and dtypes.' },
      { q: 'What does parse_dates=["opened"] do?', options: ['Deletes the column', 'Reads that column as real dates instead of text', 'Sorts by date', 'Nothing'], answer: 1, why: 'Real dates can be compared, subtracted and grouped by month.' },
    ],
  },

  // ---------------------------------------------------------------- Selecting
  {
    id: 'pd-select',
    module: 'select',
    title: 'Selecting rows and columns',
    minutes: 14,
    goals: ['Pick columns with [ ] and rows with filters', 'Use loc (labels) and iloc (positions)', 'Combine conditions, and use isin, between and query'],
    body: () => (
      <>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc[["account_id", "balance", "dpd"]].head(3))      # several columns: a list inside [ ]

late = acc[acc["dpd"] > 90]                                # filter rows with a mask
print(late[["account_id", "dpd"]])

risky = acc[(acc["dpd"] > 60) & (acc["balance"] > 50000)] # & and |, with brackets
print(len(risky), "risky accounts")
`}
        />
        <H>loc and iloc</H>
        <P>
          <F>loc</F> selects by <B>label</B> (index values and column names); <F>iloc</F> selects by <B>position</B> (0, 1, 2…). Both take <F>[rows, columns]</F>. This is
          one of the most common interview questions.
        </P>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv").set_index("account_id")
print(acc.loc["A1010", "balance"])                    # one value by label
print(acc.loc[acc["dpd"] > 90, ["customer", "dpd"]])  # mask for rows, list for columns
print(acc.iloc[0:3, 0:2])                             # first 3 rows, first 2 columns
`}
        />
        <H>isin, between and query</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc[acc["city"].isin(["Pune", "Nashik"])].shape)
print(acc[acc["dpd"].between(31, 60)]["account_id"].tolist())
print(acc.query("product == 'Card' and dpd > 30")[["account_id", "dpd"]])
`}
        />
        <Callout tone="warn" title="Changing a filtered table">
          To change values in place, use <F>loc</F> on the original: <F>acc.loc[acc["dpd"] &gt; 90, "flag"] = "legal"</F>. Assigning to a filtered copy can trigger
          pandas' SettingWithCopyWarning and change nothing.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-filters',
        title: 'Build the call lists',
        prompt:
          'From accounts: field_list = account_ids (as a list, in file order) with dpd over 60 and balance over 40000; pune_nashik_cards = number of Card accounts in Pune or Nashik; and use loc to add a column action that is "field" for dpd over 90 and "call" for everything else.',
        starter: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

field_list = []
pune_nashik_cards = 0
# add the action column here

print(field_list, pune_nashik_cards)
print(acc[["account_id", "dpd", "action"]] if "action" in acc else "no action column yet")
`,
        tests: [
          { name: 'field_list is right', code: py`assert field_list == ["A1013", "A1014", "A1017", "A1020"], f"got {field_list}"` },
          { name: 'pune_nashik_cards == 3', code: py`assert pune_nashik_cards == 3, f"got {pune_nashik_cards}"` },
          { name: 'action column is "field" exactly for dpd > 90', code: py`
assert "action" in acc.columns, "no action column"
ok = ((acc["dpd"] > 90) == (acc["action"] == "field")).all() and set(acc["action"]) == {"field", "call"}
assert ok, f"got {acc['action'].value_counts().to_dict()}"
` },
        ],
        hint: 'field_list = acc.loc[(acc["dpd"] > 60) & (acc["balance"] > 40000), "account_id"].tolist(). For the cards use isin and len(). action: acc["action"] = "call", then acc.loc[acc["dpd"] > 90, "action"] = "field".',
        solution: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

field_list = acc.loc[(acc["dpd"] > 60) & (acc["balance"] > 40000), "account_id"].tolist()
pune_nashik_cards = len(acc[(acc["product"] == "Card") & acc["city"].isin(["Pune", "Nashik"])])
acc["action"] = "call"
acc.loc[acc["dpd"] > 90, "action"] = "field"

print(field_list, pune_nashik_cards)
print(acc[["account_id", "dpd", "action"]] if "action" in acc else "no action column yet")
`,
      },
    ],
    quiz: [
      { q: 'df.iloc[0] versus df.loc[0]: what is the difference?', options: ['None', 'iloc is the first row by position; loc is the row whose index label is 0', 'loc is faster', 'iloc only works on columns'], answer: 1, why: 'They match only while the index is 0, 1, 2…; after sorting or set_index they differ.' },
      { q: 'How do you combine two conditions on DataFrame columns?', options: ['cond1 and cond2', '(cond1) & (cond2)', 'cond1 + cond2', 'cond1, cond2'], answer: 1, why: 'Use & / | / ~ element-wise, each condition in brackets.' },
    ],
  },
  {
    id: 'pd-sort',
    module: 'select',
    title: 'Sorting, ranking and top N',
    minutes: 8,
    goals: ['Sort by one or more columns', 'Get the top or bottom rows quickly with nlargest and nsmallest', 'Rank values and reset the index'],
    body: () => (
      <>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.sort_values("balance", ascending=False).head(3)[["account_id", "balance"]])
# product A→Z, then largest balance first within each product
print(acc.sort_values(["product", "balance"], ascending=[True, False])[["product", "account_id", "balance"]].head(6))
`}
        />
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.nlargest(3, "dpd")[["account_id", "dpd"]])
acc["balance_rank"] = acc["balance"].rank(ascending=False).astype(int)   # 1 = largest
top = acc.sort_values("balance_rank").head(3).reset_index(drop=True)     # fresh 0, 1, 2 index
print(top[["account_id", "balance", "balance_rank"]])
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'pd-topn',
        title: 'Top balances per agent',
        prompt: 'Set top5 to the 5 accounts with the largest balance (columns account_id, agent, balance; index reset to 0–4), and smallest_late to the account_id of the smallest balance among accounts over 30 DPD.',
        starter: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

top5 = None
smallest_late = None
print(top5, smallest_late)
`,
        tests: [
          { name: 'top5 has the right accounts in order', code: py`assert top5["account_id"].tolist() == ["A1011", "A1014", "A1020", "A1005", "A1010"], f"got {top5['account_id'].tolist()}"` },
          { name: 'top5 has exactly account_id, agent, balance and index 0–4', code: py`
assert list(top5.columns) == ["account_id", "agent", "balance"], f"columns {list(top5.columns)}"
assert top5.index.tolist() == [0, 1, 2, 3, 4], f"index {top5.index.tolist()}"
` },
          { name: 'smallest_late == "A1015"', code: py`assert smallest_late == "A1015", f"got {smallest_late!r}"` },
        ],
        hint: 'top5 = acc.nlargest(5, "balance")[["account_id", "agent", "balance"]].reset_index(drop=True). For smallest_late filter dpd > 30, then nsmallest(1, "balance") and take ["account_id"].iloc[0].',
        solution: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

top5 = acc.nlargest(5, "balance")[["account_id", "agent", "balance"]].reset_index(drop=True)
smallest_late = acc[acc["dpd"] > 30].nsmallest(1, "balance")["account_id"].iloc[0]
print(top5, smallest_late)
`,
      },
    ],
    quiz: [
      { q: 'What does reset_index(drop=True) do?', options: ['Deletes all rows', 'Gives the rows a fresh 0, 1, 2… index and discards the old one', 'Sorts the table', 'Removes the index column from the CSV'], answer: 1, why: 'Without drop=True the old index would be kept as a new column.' },
      { q: 'Quickest way to get the 3 most overdue accounts?', options: ['df.head(3)', 'df.nlargest(3, "dpd")', 'df.sort_index()', 'df.max()'], answer: 1, why: 'nlargest sorts and takes the top n in one step.' },
    ],
  },

  // ---------------------------------------------------------------- Cleaning
  {
    id: 'pd-missing',
    module: 'clean',
    title: 'Missing values',
    minutes: 10,
    goals: ['Find missing values with isna', 'Decide between dropping and filling', 'Fill sensibly with fillna, including per-group values'],
    body: () => (
      <>
        <P>
          Real exports have gaps. pandas shows a missing value as <F>NaN</F> (not a number). The first step is always to <B>count</B> them, then decide per column.
        </P>
        <PyRunner
          code={py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")
print(raw.isna().sum())          # missing values per column
print(raw[raw.isna().any(axis=1)][["account_id", "balance", "dpd", "agent"]])
`}
        />
        <H>Drop or fill?</H>
        <PyRunner
          code={py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")
print(len(raw), "->", len(raw.dropna()), "rows if we drop every incomplete row")

clean = raw.copy()
clean["agent"] = clean["agent"].fillna("unassigned")   # text: a clear placeholder
clean["dpd"] = clean["dpd"].fillna(0)                   # a business rule: unknown = current
print(clean[["account_id", "dpd", "agent"]].tail(6))
`}
        />
        <Callout title="Think before you fill">
          Dropping loses information; filling invents it. Fill only with something you can defend (a business rule, a median of similar accounts), and keep a note of how
          many values you filled.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-fill',
        title: 'Fill the gaps',
        prompt: 'From raw: set missing_per_column to raw.isna().sum(). Then make clean, a copy where missing agent becomes "unassigned" and missing dpd becomes 0. Set incomplete to the account_ids (list) of rows that had any missing value in raw.',
        starter: py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")

missing_per_column = None
clean = None
incomplete = []
print(missing_per_column, incomplete)
`,
        tests: [
          { name: 'missing_per_column is right', code: py`assert missing_per_column.to_dict() == raw.isna().sum().to_dict(), f"got {missing_per_column}"` },
          { name: 'clean has no missing agent or dpd', code: py`
assert clean["agent"].isna().sum() == 0 and clean["dpd"].isna().sum() == 0, "still missing values"
assert (clean.loc[raw["agent"].isna(), "agent"] == "unassigned").all(), "agent not 'unassigned'"
assert (clean.loc[raw["dpd"].isna(), "dpd"] == 0).all(), "dpd not 0"
` },
          { name: 'raw is unchanged (you used a copy)', code: py`assert raw["agent"].isna().sum() == 1, "raw was modified; use raw.copy()"` },
          { name: 'incomplete == ["A1004", "A1006", "A1007"]', code: py`assert incomplete == ["A1004", "A1006", "A1007"], f"got {incomplete}"` },
        ],
        hint: 'clean = raw.copy(); clean["agent"] = clean["agent"].fillna("unassigned"). incomplete = raw.loc[raw.isna().any(axis=1), "account_id"].tolist()',
        solution: py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")

missing_per_column = raw.isna().sum()
clean = raw.copy()
clean["agent"] = clean["agent"].fillna("unassigned")
clean["dpd"] = clean["dpd"].fillna(0)
incomplete = raw.loc[raw.isna().any(axis=1), "account_id"].tolist()
print(missing_per_column, incomplete)
`,
      },
    ],
    quiz: [
      { q: 'What does df.isna().sum() return?', options: ['The number of rows', 'The number of missing values in each column', 'The sum of all numbers', 'A cleaned DataFrame'], answer: 1, why: 'isna() is True for missing cells; summing counts the Trues per column.' },
      { q: 'Why fill missing agent names with "unassigned" rather than dropping the row?', options: ['It is faster', 'The account and its balance still matter; only the agent is unknown', 'pandas cannot drop rows', 'For sorting'], answer: 1, why: 'Dropping would lose real balances from the totals.' },
    ],
  },
  {
    id: 'pd-tidy',
    module: 'clean',
    title: 'Types, text and duplicates',
    minutes: 12,
    goals: ['Turn messy text into numbers with to_numeric', 'Clean text with the .str methods', 'Find and remove duplicate rows'],
    body: () => (
      <>
        <P>The messy file has balances like <F>"1,31,600"</F> (text, with commas), cities in mixed case with spaces, and two duplicated rows.</P>
        <PyRunner
          code={py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")
print(raw.dtypes[["balance", "dpd"]])       # balance came in as text (object)
print(raw["city"].unique())

clean = raw.copy()
clean["balance"] = pd.to_numeric(clean["balance"].str.replace(",", ""), errors="coerce")
clean["city"] = clean["city"].str.strip().str.title()
print(clean["balance"].dtype, clean["city"].unique())
`}
        />
        <H>Duplicates</H>
        <PyRunner
          code={py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")
print(raw.duplicated().sum(), "exact duplicate rows")
print(raw["account_id"].duplicated().sum(), "repeated account ids")
deduped = raw.drop_duplicates(subset="account_id", keep="first")
print(len(raw), "->", len(deduped))
`}
        />
        <H>More useful .str methods</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.loc[acc["product"].str.contains("loan", case=False), "account_id"].tolist())
print(acc["account_id"].str[1:].astype(int).max())      # slice text, then convert
print(acc["customer"].str.upper().head(3).tolist())
`}
        />
        <Callout title="errors='coerce'">
          <F>pd.to_numeric(..., errors="coerce")</F> turns anything that cannot become a number into NaN instead of crashing, so you can count and inspect the bad values
          afterwards.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-clean-all',
        title: 'Clean the raw export',
        prompt:
          'Write clean_accounts(df) that returns a cleaned copy: balance as numbers (commas removed), city stripped and in Title Case, duplicate account_ids removed (keep the first), and the index reset. Test it on raw.',
        starter: py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")

def clean_accounts(df):
    out = df.copy()
    return out

clean = clean_accounts(raw)
print(clean[["account_id", "city", "balance"]])
`,
        tests: [
          { name: '10 unique accounts with index 0–9', code: py`
c = clean_accounts(raw)
assert len(c) == 10 and c["account_id"].is_unique, f"{len(c)} rows"
assert c.index.tolist() == list(range(10)), f"index {c.index.tolist()}"
` },
          { name: 'balance is numeric with commas handled', code: py`
c = clean_accounts(raw)
import pandas as pd
assert pd.api.types.is_numeric_dtype(c["balance"]), f"balance is {c['balance'].dtype}"
assert c.loc[c["account_id"] == "A1005", "balance"].iloc[0] == 131600, "A1005 should be 131600"
assert c["balance"].isna().sum() == 1, "only A1004 should stay missing"
` },
          { name: 'cities are tidy', code: py`
c = clean_accounts(raw)
assert sorted(c["city"].unique()) == ["Delhi", "Indore", "Mumbai", "Nashik", "Pune"], f"got {sorted(c['city'].unique())}"
` },
          { name: 'raw is unchanged', code: py`assert len(raw) == 12 and raw["balance"].dtype == object, "raw was modified"` },
        ],
        hint: 'out["balance"] = pd.to_numeric(out["balance"].str.replace(",", ""), errors="coerce"); out["city"] = out["city"].str.strip().str.title(); out = out.drop_duplicates(subset="account_id").reset_index(drop=True)',
        solution: py`
import pandas as pd

raw = pd.read_csv("data/accounts_raw.csv")

def clean_accounts(df):
    out = df.copy()
    out["balance"] = pd.to_numeric(out["balance"].str.replace(",", ""), errors="coerce")
    out["city"] = out["city"].str.strip().str.title()
    out = out.drop_duplicates(subset="account_id", keep="first").reset_index(drop=True)
    return out

clean = clean_accounts(raw)
print(clean[["account_id", "city", "balance"]])
`,
      },
    ],
    quiz: [
      { q: 'Why did balance load as object (text)?', options: ['pandas cannot read numbers', 'Some values contain commas, so the column is not purely numeric', 'It is too large', 'Because of missing values only'], answer: 1, why: 'One non-numeric value makes the whole column text until you clean it.' },
      { q: 'drop_duplicates(subset="account_id") removes…', options: ['Rows where every column repeats', 'Rows whose account_id already appeared', 'The account_id column', 'Missing values'], answer: 1, why: 'subset limits the duplicate check to the listed columns.' },
    ],
  },

  // ---------------------------------------------------------------- Transform, group, reshape
  {
    id: 'pd-columns',
    module: 'transform',
    title: 'New columns, buckets and apply',
    minutes: 12,
    goals: ['Create columns with vectorised maths and np.where', 'Bucket numbers with pd.cut', 'Map values and know when (not) to use apply'],
    body: () => (
      <>
        <PyRunner
          code={py`
import numpy as np
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
acc["utilisation"] = (acc["balance"] / acc["credit_limit"]).round(2)
acc["priority"] = np.where(acc["dpd"] > 60, "high", "normal")

# pd.cut: bins are (0, 30], (30, 60] ... right edge included
acc["bucket"] = pd.cut(acc["dpd"], bins=[-1, 0, 30, 60, 90, 10_000],
                       labels=["Current", "1-30", "31-60", "61-90", "90+"])
print(acc[["account_id", "dpd", "bucket", "utilisation", "priority"]].head(8))
print(acc["bucket"].value_counts().sort_index())
`}
        />
        <H>map for lookups</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
region = {"Pune": "West", "Mumbai": "West", "Nashik": "West", "Indore": "Central", "Delhi": "North"}
acc["region"] = acc["city"].map(region)
print(acc[["city", "region"]].drop_duplicates())
`}
        />
        <H>apply: last resort</H>
        <P>
          <F>apply</F> runs a Python function on every row. It is flexible but slow, like a loop. Interviewers like to hear that you reach for vectorised operations first and
          use apply only when there is no column-wise way.
        </P>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

def channel(row):                      # a rule mixing several columns
    if row["dpd"] > 90: return "field"
    if row["product"] == "Card" and row["dpd"] > 30: return "call"
    return "sms"

acc["channel"] = acc.apply(channel, axis=1)   # axis=1: one row at a time
print(acc["channel"].value_counts())
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'pd-bucket-cut',
        title: 'Bucket and score the book',
        prompt:
          'Add three columns to acc: bucket with pd.cut (Current, 1-30, 31-60, 61-90, 90+), utilisation = balance ÷ credit_limit rounded to 2, and risk = "high" when dpd > 60 or utilisation > 0.8, else "low" (use np.where with |). Then set high_risk_balance to the total balance of high-risk accounts.',
        starter: py`
import numpy as np
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

high_risk_balance = None
print(acc.head())
print(high_risk_balance)
`,
        tests: [
          { name: 'bucket counts are right', code: py`
counts = acc["bucket"].astype(str).value_counts().to_dict()
assert counts == {"Current": 4, "1-30": 5, "31-60": 5, "61-90": 3, "90+": 3}, f"got {counts}"
` },
          { name: 'utilisation is balance / limit, 2 decimals', code: py`assert (acc["utilisation"] == (acc["balance"] / acc["credit_limit"]).round(2)).all(), "utilisation is wrong"` },
          { name: 'risk is high for dpd > 60 or utilisation > 0.8', code: py`
expected = ((acc["dpd"] > 60) | (acc["utilisation"] > 0.8)).map({True: "high", False: "low"})
assert (acc["risk"] == expected).all(), f"got {acc['risk'].value_counts().to_dict()}"
` },
          { name: 'high_risk_balance == 772000', code: py`
import pandas as pd
a = pd.read_csv("data/accounts.csv")
ref = a.loc[(a["dpd"] > 60) | ((a["balance"] / a["credit_limit"]).round(2) > 0.8), "balance"].sum()
assert high_risk_balance == ref, f"got {high_risk_balance}, expected {ref}"
` },
        ],
        hint: 'acc["risk"] = np.where((acc["dpd"] > 60) | (acc["utilisation"] > 0.8), "high", "low"); high_risk_balance = acc.loc[acc["risk"] == "high", "balance"].sum()',
        solution: py`
import numpy as np
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
acc["bucket"] = pd.cut(acc["dpd"], bins=[-1, 0, 30, 60, 90, 10_000], labels=["Current", "1-30", "31-60", "61-90", "90+"])
acc["utilisation"] = (acc["balance"] / acc["credit_limit"]).round(2)
acc["risk"] = np.where((acc["dpd"] > 60) | (acc["utilisation"] > 0.8), "high", "low")

high_risk_balance = acc.loc[acc["risk"] == "high", "balance"].sum()
print(acc.head())
print(high_risk_balance)
`,
      },
    ],
    quiz: [
      { q: 'With pd.cut(bins=[0, 30, 60]), which bin does 30 fall in?', options: ['(30, 60]', '(0, 30]', 'Neither', 'Both'], answer: 1, why: 'By default the right edge is included, so 30 belongs to (0, 30].' },
      { q: 'When is apply(axis=1) the right tool?', options: ['Always', 'When a rule cannot be written with column operations like np.where or np.select', 'For adding two columns', 'For filtering'], answer: 1, why: 'Vectorised operations are much faster; apply is the fallback.' },
    ],
  },
  {
    id: 'pd-groupby',
    module: 'transform',
    title: 'groupby: split, apply, combine',
    minutes: 14,
    goals: ['Summarise per group with groupby and agg', 'Name your output columns with named aggregation', 'Add group results back to every row with transform'],
    body: () => (
      <>
        <P>
          <F>groupby</F> <B>splits</B> the table into groups, <B>applies</B> a calculation to each and <B>combines</B> the results: pandas' version of SQL's GROUP BY and
          of a pivot table.
        </P>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
print(acc.groupby("product")["balance"].sum())
print(acc.groupby(["agent", "product"]).size())        # rows per combination
`}
        />
        <H>Named aggregation</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
summary = acc.groupby("agent").agg(
    accounts=("account_id", "count"),
    balance=("balance", "sum"),
    avg_dpd=("dpd", "mean"),
    worst_dpd=("dpd", "max"),
).round(1).sort_values("balance", ascending=False)
print(summary)
`}
        />
        <H>transform: a group value on every row</H>
        <P>
          <F>agg</F> returns one row per group. <F>transform</F> returns a value for <B>every original row</B>, which is how you compute "share of my product's balance"
          or "difference from the agent's average".
        </P>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
acc["product_total"] = acc.groupby("product")["balance"].transform("sum")
acc["share_of_product"] = (acc["balance"] / acc["product_total"]).round(3)
print(acc[["account_id", "product", "balance", "share_of_product"]].head(6))
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'pd-agent-summary',
        title: 'Agent scorecard',
        prompt:
          'Read the payments file. Set by_channel to total amount per channel (a Series, largest first). Set scorecard to a DataFrame indexed by account_id with named columns payments (count) and collected (sum of amount). Then add pct_of_total to payments: each payment as a share of its own channel\'s total, using transform.',
        starter: py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")

by_channel = None
scorecard = None
# add pct_of_total to pay

print(by_channel)
print(scorecard.head() if scorecard is not None else None)
`,
        tests: [
          { name: 'by_channel totals, largest first', code: py`
import pandas as pd
ref = pd.read_csv("data/payments.csv").groupby("channel")["amount"].sum().sort_values(ascending=False)
assert by_channel.tolist() == ref.tolist() and list(by_channel.index) == list(ref.index), f"got {by_channel.to_dict()}"
` },
          { name: 'scorecard has payments and collected per account', code: py`
import pandas as pd
ref = pd.read_csv("data/payments.csv").groupby("account_id").agg(payments=("payment_id", "count"), collected=("amount", "sum"))
assert list(scorecard.columns) == ["payments", "collected"], f"columns {list(scorecard.columns)}"
assert scorecard.sort_index().equals(ref), "values differ"
` },
          { name: 'pct_of_total adds up to 1 within each channel', code: py`
sums = pay.groupby("channel")["pct_of_total"].sum().round(6)
assert (sums == 1).all(), f"sums per channel: {sums.to_dict()}"
assert len(pay) == 69, "pay should keep all 69 rows"
` },
        ],
        hint:
          'by_channel = pay.groupby("channel")["amount"].sum().sort_values(ascending=False). scorecard = pay.groupby("account_id").agg(payments=("payment_id", "count"), collected=("amount", "sum")). pay["pct_of_total"] = pay["amount"] / pay.groupby("channel")["amount"].transform("sum")',
        solution: py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")

by_channel = pay.groupby("channel")["amount"].sum().sort_values(ascending=False)
scorecard = pay.groupby("account_id").agg(payments=("payment_id", "count"), collected=("amount", "sum"))
pay["pct_of_total"] = pay["amount"] / pay.groupby("channel")["amount"].transform("sum")

print(by_channel)
print(scorecard.head() if scorecard is not None else None)
`,
      },
    ],
    quiz: [
      { q: 'groupby(...).agg(...) versus groupby(...).transform(...)?', options: ['Same thing', 'agg gives one row per group; transform gives one value per original row', 'transform is for text only', 'agg cannot sum'], answer: 1, why: 'transform keeps the original shape, so the result can be a new column.' },
      { q: 'What does df.groupby(["agent", "product"]).size() count?', options: ['Columns', 'Rows for each agent–product combination', 'Unique agents', 'Total balance'], answer: 1, why: 'size() counts rows per group; grouping by two keys gives a MultiIndex.' },
    ],
  },
  {
    id: 'pd-reshape',
    module: 'transform',
    title: 'Pivot tables, crosstabs and melt',
    minutes: 14,
    goals: ['Build Excel-style pivot tables with pivot_table', 'Count combinations with crosstab, including a roll-rate matrix', 'Turn wide tables long with melt'],
    body: () => (
      <>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pt = acc.pivot_table(index="city", columns="product", values="balance",
                     aggfunc="sum", fill_value=0, margins=True, margins_name="Total")
print(pt)
`}
        />
        <H>crosstab and the roll-rate matrix</H>
        <P>
          <F>crosstab</F> counts how often each pair of values occurs. With each account's bucket last month and this month, that is exactly a <B>roll-rate matrix</B>: the
          share of each bucket that stayed, cured or rolled forward.
        </P>
        <PyRunner
          code={py`
import pandas as pd

hist = pd.read_csv("data/dpd_history.csv")
wide = hist.pivot(index="account_id", columns="month", values="bucket")   # one row per account
order = ["Current", "1-30", "31-60", "61-90", "90+"]
roll = pd.crosstab(pd.Categorical(wide["2026-05"], order), pd.Categorical(wide["2026-06"], order),
                   rownames=["May"], colnames=["June"], normalize="index").round(2)
print(roll)
`}
        />
        <H>melt: wide to long</H>
        <PyRunner
          code={py`
import pandas as pd

wide = pd.DataFrame({"agent": ["Kiran", "Neha"], "Jan": [40, 38], "Feb": [44, 41]})
long = wide.melt(id_vars="agent", var_name="month", value_name="collected")
print(long)
`}
        />
        <Callout title="pivot vs pivot_table">
          <F>pivot</F> only reshapes and fails if a row/column pair appears twice. <F>pivot_table</F> aggregates duplicates with <F>aggfunc</F>. A classic interview
          question.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-pivot-roll',
        title: 'Pivot and roll rates',
        prompt:
          'Set agent_product to a pivot_table of account counts (index agent, columns product, values account_id, aggfunc "count", fill_value 0). Then from dpd_history, set rolled_forward to the number of accounts whose bucket in 2026-06 is worse than in 2026-05.',
        starter: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
hist = pd.read_csv("data/dpd_history.csv")
order = ["Current", "1-30", "31-60", "61-90", "90+"]

agent_product = None
rolled_forward = None
print(agent_product)
print(rolled_forward)
`,
        tests: [
          { name: 'agent_product counts', code: py`
import pandas as pd
ref = pd.read_csv("data/accounts.csv").pivot_table(index="agent", columns="product", values="account_id", aggfunc="count", fill_value=0)
assert agent_product.equals(ref), f"got\n{agent_product}"
` },
          { name: 'rolled_forward is correct', code: py`
import pandas as pd
h = pd.read_csv("data/dpd_history.csv").pivot(index="account_id", columns="month", values="bucket")
rank = {b: i for i, b in enumerate(["Current", "1-30", "31-60", "61-90", "90+"])}
ref = int((h["2026-06"].map(rank) > h["2026-05"].map(rank)).sum())
assert rolled_forward == ref, f"got {rolled_forward}, expected {ref}"
` },
        ],
        hint: 'wide = hist.pivot(index="account_id", columns="month", values="bucket"); rank = {b: i for i, b in enumerate(order)}; rolled_forward = (wide["2026-06"].map(rank) > wide["2026-05"].map(rank)).sum()',
        solution: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
hist = pd.read_csv("data/dpd_history.csv")
order = ["Current", "1-30", "31-60", "61-90", "90+"]

agent_product = acc.pivot_table(index="agent", columns="product", values="account_id", aggfunc="count", fill_value=0)
wide = hist.pivot(index="account_id", columns="month", values="bucket")
rank = {b: i for i, b in enumerate(order)}
rolled_forward = int((wide["2026-06"].map(rank) > wide["2026-05"].map(rank)).sum())
print(agent_product)
print(rolled_forward)
`,
      },
    ],
    quiz: [
      { q: 'What does normalize="index" do in crosstab?', options: ['Sorts the index', 'Turns each row into shares that add up to 1', 'Removes the index', 'Counts missing values'], answer: 1, why: 'Each row (last month\'s bucket) becomes percentages: exactly a roll-rate matrix.' },
      { q: 'You have one column per month and want one row per agent-month. Use…', options: ['pivot', 'melt', 'merge', 'groupby'], answer: 1, why: 'melt turns wide columns into long rows.' },
    ],
  },

  // ---------------------------------------------------------------- Combining and time
  {
    id: 'pd-merge',
    module: 'combine',
    title: 'Merging tables (SQL joins in pandas)',
    minutes: 14,
    goals: ['Join two tables with merge: inner, left, and anti-joins', 'Check joins with validate and indicator', 'Stack tables with concat'],
    body: () => (
      <>
        <P>
          Payments and accounts live in different files, joined by <F>account_id</F>. <F>merge</F> works like SQL JOIN: <F>how="inner"</F> keeps matches only,{' '}
          <F>how="left"</F> keeps every row of the left table.
        </P>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")

joined = pay.merge(acc[["account_id", "agent", "product"]], on="account_id", how="left",
                   validate="many_to_one")       # many payments per account; error if not
print(joined.head())
print(joined.groupby("agent")["amount"].sum().sort_values(ascending=False))
`}
        />
        <H>Who never paid? An anti-join</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")

check = acc.merge(pay[["account_id"]].drop_duplicates(), on="account_id", how="left", indicator=True)
print(check["_merge"].value_counts())
never_paid = check.loc[check["_merge"] == "left_only", "account_id"].tolist()
print("never paid:", never_paid)
`}
        />
        <H>concat: stacking</H>
        <PyRunner
          code={py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")
q1 = pay[pay["date"] < "2026-04"]
q2 = pay[pay["date"] >= "2026-04"]
both = pd.concat([q1.assign(quarter="Q1"), q2.assign(quarter="Q2")], ignore_index=True)
print(both.groupby("quarter")["amount"].sum())
`}
        />
        <Callout tone="warn" title="Rows multiplying after a merge?">
          If the key repeats on both sides, every match is paired with every other, and totals inflate. <F>validate="many_to_one"</F> (or one_to_one) stops that with an
          error instead of a wrong number.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-join',
        title: 'Collections by agent and product',
        prompt:
          'Merge payments with accounts (left join on account_id, validate many_to_one) into joined. Set by_agent to total amount per agent (Series, sorted by agent name), and never_paid to a sorted list of account_ids with no payments.',
        starter: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")

joined = None
by_agent = None
never_paid = []
print(by_agent, never_paid)
`,
        tests: [
          { name: 'joined has 69 rows and an agent column', code: py`assert len(joined) == 69 and "agent" in joined.columns, f"{len(joined)} rows, columns {list(joined.columns)}"` },
          { name: 'by_agent totals', code: py`
import pandas as pd
a = pd.read_csv("data/accounts.csv"); p = pd.read_csv("data/payments.csv")
ref = p.merge(a, on="account_id").groupby("agent")["amount"].sum().sort_index()
assert by_agent.tolist() == ref.tolist() and list(by_agent.index) == list(ref.index), f"got {by_agent.to_dict()}"
` },
          { name: 'never_paid is correct', code: py`
import pandas as pd
a = pd.read_csv("data/accounts.csv"); p = pd.read_csv("data/payments.csv")
ref = sorted(set(a["account_id"]) - set(p["account_id"]))
assert never_paid == ref, f"got {never_paid}, expected {ref}"
` },
        ],
        hint: 'joined = pay.merge(acc, on="account_id", how="left", validate="many_to_one"); by_agent = joined.groupby("agent")["amount"].sum(). For never_paid: sorted(set(acc["account_id"]) - set(pay["account_id"])) works, or an indicator merge.',
        solution: py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")

joined = pay.merge(acc, on="account_id", how="left", validate="many_to_one")
by_agent = joined.groupby("agent")["amount"].sum().sort_index()
check = acc.merge(pay[["account_id"]].drop_duplicates(), on="account_id", how="left", indicator=True)
never_paid = sorted(check.loc[check["_merge"] == "left_only", "account_id"])
print(by_agent, never_paid)
`,
      },
    ],
    quiz: [
      { q: 'Which merge keeps every account, even those with no payments?', options: ['how="inner" with accounts on the left', 'how="left" with accounts on the left', 'how="right" with payments on the left', 'concat'], answer: 1, why: 'A left join keeps all rows of the left table; unmatched ones get NaN.' },
      { q: 'What does indicator=True add?', options: ['An index', 'A _merge column saying both, left_only or right_only', 'Row numbers', 'Nothing'], answer: 1, why: 'Filtering on left_only gives an anti-join.' },
    ],
  },
  {
    id: 'pd-time',
    module: 'combine',
    title: 'Dates and time series',
    minutes: 14,
    goals: ['Convert text to dates and use the .dt accessor', 'Resample to monthly totals', 'Compute month-on-month change and rolling averages'],
    body: () => (
      <>
        <PyRunner
          code={py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")
pay["date"] = pd.to_datetime(pay["date"])
pay["month"] = pay["date"].dt.to_period("M")
pay["weekday"] = pay["date"].dt.day_name()
print(pay[["date", "month", "weekday"]].head(3))
print(pay.groupby("weekday")["amount"].sum().sort_values(ascending=False).head(3))
`}
        />
        <H>resample: totals per month</H>
        <PyRunner
          code={py`
import pandas as pd

pay = pd.read_csv("data/payments.csv", parse_dates=["date"])
monthly = pay.set_index("date")["amount"].resample("MS").sum()   # MS = month start
print(monthly)
print((monthly.pct_change() * 100).round(1))                      # month-on-month %
print(monthly.rolling(3).mean().round(0))                         # 3-month average
`}
        />
        <H>Days between dates</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv", parse_dates=["opened"])
acc["age_days"] = (pd.Timestamp("2026-06-30") - acc["opened"]).dt.days
acc["vintage"] = acc["opened"].dt.year
print(acc.groupby("vintage")["dpd"].mean().round(1))
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'pd-monthly',
        title: 'Monthly collections trend',
        prompt:
          'Set monthly to total payment amount per month using resample("MS") on the date (a Series of 6 values). Set best_month to the month (as text "YYYY-MM") with the highest total, and mom to the month-on-month % change rounded to 1 (first value is NaN).',
        starter: py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")

monthly = None
best_month = None
mom = None
print(monthly, best_month, mom, sep="\n")
`,
        tests: [
          { name: 'monthly has 6 totals', code: py`
import pandas as pd
ref = pd.read_csv("data/payments.csv", parse_dates=["date"]).set_index("date")["amount"].resample("MS").sum()
assert len(monthly) == 6 and monthly.tolist() == ref.tolist(), f"got {list(monthly)}"
` },
          { name: 'best_month is the top month as "YYYY-MM"', code: py`
import pandas as pd
ref = pd.read_csv("data/payments.csv", parse_dates=["date"]).set_index("date")["amount"].resample("MS").sum()
assert best_month == ref.idxmax().strftime("%Y-%m"), f"got {best_month!r}"
` },
          { name: 'mom is the % change', code: py`
import pandas as pd
assert pd.isna(mom.iloc[0]), "first value should be NaN"
assert mom.iloc[1:].tolist() == (monthly.pct_change() * 100).round(1).iloc[1:].tolist(), f"got {mom.tolist()}"
` },
        ],
        hint: 'pay["date"] = pd.to_datetime(pay["date"]); monthly = pay.set_index("date")["amount"].resample("MS").sum(); best_month = monthly.idxmax().strftime("%Y-%m"); mom = (monthly.pct_change() * 100).round(1)',
        solution: py`
import pandas as pd

pay = pd.read_csv("data/payments.csv")
pay["date"] = pd.to_datetime(pay["date"])

monthly = pay.set_index("date")["amount"].resample("MS").sum()
best_month = monthly.idxmax().strftime("%Y-%m")
mom = (monthly.pct_change() * 100).round(1)
print(monthly, best_month, mom, sep="\n")
`,
      },
    ],
    quiz: [
      { q: 'What does .resample("MS").sum() need?', options: ['A text column', 'A DatetimeIndex (dates as the index)', 'Sorted values', 'Nothing'], answer: 1, why: 'Resampling groups by time, so the dates must be the index (or use on="date").' },
      { q: 'monthly.rolling(3).mean() gives…', options: ['The mean of the first 3 months only', 'For each month, the average of it and the 2 before', 'Every third value', 'A random sample'], answer: 1, why: 'A rolling window smooths noisy monthly figures.' },
    ],
  },

  // ---------------------------------------------------------------- Project
  {
    id: 'pd-project',
    module: 'pd-project',
    title: 'Project: the monthly portfolio report',
    minutes: 20,
    goals: ['Combine reading, cleaning, grouping, merging and dates', 'Compute CEI, roll rates and channel mix like a real MIS pack', 'Package the work as a function that returns a report'],
    body: () => (
      <>
        <P>
          This is the kind of analysis that usually takes hours in a spreadsheet every month. Here it becomes a function you run in a second. First, the{' '}
          <B>Collection Efficiency Index</B> straight from the monthly file:
        </P>
        <PyRunner
          code={py`
import pandas as pd

m = pd.read_csv("data/monthly.csv")
m["cei"] = ((m["opening_ar"] + m["billed"] - m["closing_ar"]) /
            (m["opening_ar"] + m["billed"] - m["closing_current"]) * 100).round(1)
print(m[["month", "cei"]])
print("average CEI:", m["cei"].mean().round(1))
`}
        />
        <H>Putting it together</H>
        <PyRunner
          code={py`
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv", parse_dates=["date"])
joined = pay.merge(acc[["account_id", "product"]], on="account_id", validate="many_to_one")

mix = joined.pivot_table(index=joined["date"].dt.to_period("M"), columns="channel",
                         values="amount", aggfunc="sum", fill_value=0)
print((mix.div(mix.sum(axis=1), axis=0) * 100).round(0))   # % of each month by channel
`}
        />
        <Callout title="Where to take this next">
          On your own computer the same code reads the real export (<F>pd.read_csv</F> or <F>pd.read_excel</F>), and <F>df.to_excel("report.xlsx")</F> writes the pack.
          Schedule it and the monthly report builds itself.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'pd-report',
        title: 'Build the report',
        prompt:
          'Write portfolio_report() that reads the files and returns a dict with: "cei" (Series of CEI per month, index = month text, rounded to 1), "collected_by_product" (Series, total payment amount per product, largest first), "roll_forward_rate" (share of accounts whose bucket worsened from May to June, rounded to 2), and "top_risk" (list of the 3 account_ids with the largest balance among dpd > 60).',
        starter: py`
import pandas as pd

ORDER = ["Current", "1-30", "31-60", "61-90", "90+"]

def portfolio_report():
    acc = pd.read_csv("data/accounts.csv")
    pay = pd.read_csv("data/payments.csv")
    monthly = pd.read_csv("data/monthly.csv")
    hist = pd.read_csv("data/dpd_history.csv")
    return {}

report = portfolio_report()
for key, value in report.items():
    print(key, value, sep="\n", end="\n\n")
`,
        tests: [
          { name: 'cei per month', code: py`
import pandas as pd
m = pd.read_csv("data/monthly.csv")
ref = ((m["opening_ar"] + m["billed"] - m["closing_ar"]) / (m["opening_ar"] + m["billed"] - m["closing_current"]) * 100).round(1)
ref.index = m["month"]
got = portfolio_report()["cei"]
assert list(got.index) == list(ref.index) and got.tolist() == ref.tolist(), f"got {got.to_dict()}"
` },
          { name: 'collected_by_product, largest first', code: py`
import pandas as pd
a = pd.read_csv("data/accounts.csv"); p = pd.read_csv("data/payments.csv")
ref = p.merge(a, on="account_id").groupby("product")["amount"].sum().sort_values(ascending=False)
got = portfolio_report()["collected_by_product"]
assert got.tolist() == ref.tolist() and list(got.index) == list(ref.index), f"got {got.to_dict()}"
` },
          { name: 'roll_forward_rate', code: py`
import pandas as pd
h = pd.read_csv("data/dpd_history.csv").pivot(index="account_id", columns="month", values="bucket")
rank = {b: i for i, b in enumerate(ORDER)}
ref = round((h["2026-06"].map(rank) > h["2026-05"].map(rank)).mean(), 2)
assert portfolio_report()["roll_forward_rate"] == ref, f"got {portfolio_report()['roll_forward_rate']}, expected {ref}"
` },
          { name: 'top_risk == ["A1014", "A1020", "A1017"]', code: py`assert portfolio_report()["top_risk"] == ["A1014", "A1020", "A1017"], f"got {portfolio_report()['top_risk']}"` },
        ],
        hint:
          'cei: compute the column, then .round(1) and set the index with pd.Series(values.values, index=monthly["month"]) or monthly.set_index("month"). For roll_forward_rate pivot hist (index account_id, columns month) and compare mapped ranks with .mean(). top_risk: acc[acc["dpd"] > 60].nlargest(3, "balance")["account_id"].tolist()',
        solution: py`
import pandas as pd

ORDER = ["Current", "1-30", "31-60", "61-90", "90+"]

def portfolio_report():
    acc = pd.read_csv("data/accounts.csv")
    pay = pd.read_csv("data/payments.csv")
    monthly = pd.read_csv("data/monthly.csv").set_index("month")
    hist = pd.read_csv("data/dpd_history.csv")

    cei = ((monthly["opening_ar"] + monthly["billed"] - monthly["closing_ar"])
           / (monthly["opening_ar"] + monthly["billed"] - monthly["closing_current"]) * 100).round(1)

    joined = pay.merge(acc, on="account_id", how="left", validate="many_to_one")
    by_product = joined.groupby("product")["amount"].sum().sort_values(ascending=False)

    wide = hist.pivot(index="account_id", columns="month", values="bucket")
    rank = {b: i for i, b in enumerate(ORDER)}
    roll = round((wide["2026-06"].map(rank) > wide["2026-05"].map(rank)).mean(), 2)

    top = acc[acc["dpd"] > 60].nlargest(3, "balance")["account_id"].tolist()
    return {"cei": cei, "collected_by_product": by_product, "roll_forward_rate": roll, "top_risk": top}

report = portfolio_report()
for key, value in report.items():
    print(key, value, sep="\n", end="\n\n")
`,
      },
    ],
    quiz: [
      { q: 'Why wrap the analysis in a function?', options: ['pandas requires it', 'So it can be re-run on next month\'s files and tested', 'It runs faster', 'To hide the code'], answer: 1, why: 'A function turns a one-off analysis into a repeatable, testable report.' },
      { q: 'mix.div(mix.sum(axis=1), axis=0) does what?', options: ['Divides each column by its total', 'Divides each row by its own total, giving row percentages', 'Sums the table', 'Sorts it'], answer: 1, why: 'axis=0 lines the row totals up with the rows.' },
    ],
  },
];

export const pandasCourse = {
  id: 'pandas',
  title: 'Data Analysis with pandas',
  tagline: 'The library most Python data work runs on, practised on collections data',
  blurb:
    'NumPy foundations, then the pandas skills analyst roles ask for most: reading and exploring, selecting, cleaning, groupby, pivot tables, merges and time series, ending in a monthly portfolio report. Best after Python modules 1–4. Loads pandas (about 8 MB) the first time.',
  levels: 'Intermediate → Advanced',
  icon: 'pandas',
  usesPython: true,
  modules,
  lessons,
};
