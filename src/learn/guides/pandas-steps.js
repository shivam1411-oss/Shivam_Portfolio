// Step-by-step material for the pandas lessons: same shape as python-steps.js (terms, process, steps).
// `practice` is the code the practice box starts with, so the steps can go straight to the idea being taught.
// Attached to the lessons in content/ (see withGuide); checked by scripts/check-steps.mjs.

const ADD = 'Add this line under what you have, then press Run.';
const ADD_LINES = 'Add these lines under what you have, then press Run.';

const PD = `import pandas as pd

accounts = pd.read_csv("data/accounts.csv")
`;
const PD_NOTE = 'The practice box already has two lines that load the sample accounts into a table called accounts. Leave them there. ';
const NP = `import numpy as np
`;
const NP_NOTE = 'The practice box already has the line that brings in NumPy under the short name np. Leave it there. ';

export const pandasSteps = {
  'pd-excel': {
    terms: ['pandas', 'dataframe', 'row', 'column', 'filter', 'groupby', 'merge', 'pivot'],
    process: {
      title: 'How a spreadsheet task becomes pandas',
      stages: [
        ['Load the file once', 'pd.read_csv("data/accounts.csv") reads the whole sheet into a table in memory, called a DataFrame.'],
        ['Say what you want, not how to click', 'Each Excel action (filter, sort, SUMIF, pivot) is one line of pandas describing the result.'],
        ['pandas does it to every row at once', 'There is no dragging a formula down: the instruction applies to the whole column.'],
        ['You get a new table back', 'The original stays as it was. Store the result under a name to keep it.'],
        ['Run it again next month', 'The steps are saved as code, so new data needs no re-clicking.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, look at the first rows, like opening the file in Excel.', code: 'print(accounts.head(3))', see: 'The first 3 accounts as a table, with column names across the top and row numbers 0, 1, 2 down the side.' },
      { do: 'Count the rows and columns. ' + ADD, code: 'print(accounts.shape)', see: '(20, 9): 20 rows and 9 columns.' },
      { do: 'Filter, like ticking a filter box in Excel. ' + ADD_LINES, code: 'late = accounts[accounts["dpd"] > 60]\nprint(len(late))', see: '6: the number of accounts more than 60 days past due.' },
      { do: 'Sort, largest balance first. ' + ADD, code: 'print(accounts.sort_values("balance", ascending=False)[["customer", "balance"]].head(3))', see: 'Three rows: Nisha 330000, Rohit 268900, Yash 145200.' },
      { do: 'SUMIF for every product at once. ' + ADD, code: 'print(accounts.groupby("product")["balance"].sum())', see: 'One total per product: Card 382700, Consumer durable 154500, Personal loan 1188700.' },
    ],
  },
  'np-arrays': {
    terms: ['numpy', 'array', 'vectorised', 'dtype', 'list', 'loop'],
    process: {
      title: 'How NumPy does maths on a whole array',
      stages: [
        ['Values are packed together', 'An array stores many numbers of the same type side by side.'],
        ['You write the maths once', 'balances * 0.18 looks like maths on one number.'],
        ['NumPy applies it to every item', 'The multiplication happens for each position, inside fast compiled code. No Python loop runs.'],
        ['A new array comes back', 'It has the same length, with one result per item.'],
      ],
    },
    practice: NP,
    steps: [
      { do: NP_NOTE + 'Under it, make an array from a list.', code: 'balances = np.array([25000, 4000, 61000, 12500])\nprint(balances)', see: '[25000  4000 61000 12500]: like a list, but printed without commas.' },
      { do: 'Ask for its size and type. ' + ADD, code: 'print(balances.shape, balances.dtype)', see: '(4,) followed by a whole-number type such as int32 or int64: four items, all whole numbers.' },
      { do: 'Do maths on every item at once. ' + ADD, code: 'print(balances * 0.18)', see: '[ 4500.   720. 10980.  2250.]: each balance multiplied by 0.18.' },
      { do: 'Compare with a plain list to see the difference. ' + ADD, code: 'print([25000, 4000] * 2)', see: '[25000, 4000, 25000, 4000]. A list is repeated, not multiplied. That is why arrays exist.' },
      { do: 'Summarise. ' + ADD, code: 'print(balances.sum(), balances.mean(), balances.max())', see: '102500 25625.0 61000' },
    ],
  },
  'np-masks': {
    terms: ['array', 'boolean', 'mask', 'filter', 'condition', 'vectorised'],
    process: {
      title: 'How a mask filters an array',
      stages: [
        ['Write a condition on the array', 'dpd > 30 is checked for every item.'],
        ['You get an array of True and False', 'One answer per item. This is the mask.'],
        ['Put the mask in square brackets', 'dpd[mask] keeps the items where the mask is True and drops the rest.'],
        ['Or use it to choose values', 'np.where(mask, "late", "ok") gives one label per item.'],
      ],
    },
    practice: NP,
    steps: [
      { do: NP_NOTE + 'Under it, make an array and a condition.', code: 'dpd = np.array([0, 12, 45, 95, 130])\nmask = dpd > 30\nprint(mask)', see: '[False False  True  True  True]: one answer per item.' },
      { do: 'Use the mask to filter. ' + ADD, code: 'print(dpd[mask])', see: '[ 45  95 130]: only the items where the mask was True.' },
      { do: 'Count how many passed. True counts as 1. ' + ADD, code: 'print(mask.sum())', see: '3' },
      { do: 'Choose between two labels. ' + ADD, code: 'print(np.where(dpd > 30, "late", "ok"))', see: "['ok' 'ok' 'late' 'late' 'late']" },
      { do: 'Label several cases at once. ' + ADD_LINES, code: 'labels = np.select([dpd == 0, dpd <= 30, dpd <= 90], ["current", "1-30", "31-90"], default="90+")\nprint(labels)', see: "['current' '1-30' '31-90' '90+' '90+']" },
    ],
  },
  'pd-basics': {
    terms: ['dataframe', 'series', 'column', 'row', 'index', 'dict'],
    process: {
      title: 'What a DataFrame is made of',
      stages: [
        ['Each column is a Series', 'A Series is one column of values with a label for every row.'],
        ['The row labels are the index', 'By default they are 0, 1, 2… They line the columns up with each other.'],
        ['A DataFrame is columns side by side', 'All its Series share the same index, so each row holds one value from every column.'],
        ['df["name"] takes one column out', 'You get a Series back. Maths on it applies to every row.'],
        ['df["new"] = … adds a column', 'The values are matched to rows by the index.'],
      ],
    },
    practice: 'import pandas as pd\n',
    steps: [
      { do: 'The practice box already has the line that brings in pandas under the short name pd. Under it, build a table from a dictionary: each key becomes a column.', code: 'df = pd.DataFrame({"customer": ["Asha", "Ravi", "Meena"], "balance": [25000, 4000, 61000]})\nprint(df)', see: 'A table with 3 rows, the columns customer and balance, and row labels 0, 1, 2 on the left.' },
      { do: 'Take one column out. ' + ADD, code: 'print(df["balance"])', see: 'The three balances with their row labels, and Name: balance, dtype: int64 underneath. This is a Series.' },
      { do: 'Do maths on the whole column. ' + ADD, code: 'print(df["balance"].sum(), df["balance"].mean())', see: '90000 30000.0' },
      { do: 'Add a new column worked out from another. ' + ADD_LINES, code: 'df["interest"] = df["balance"] * 0.18\nprint(df)', see: 'The same table with a third column, interest: 4500.0, 720.0 and 10980.0.' },
      { do: 'Ask for a column that does not exist. ' + ADD, code: 'print(df["city"])', see: "A red KeyError: 'city'. Column names must match exactly.", error: true },
    ],
  },
  'pd-reading': {
    terms: ['csv', 'dataframe', 'column', 'row', 'dtype', 'nan'],
    process: {
      title: 'How to get to know a new dataset',
      stages: [
        ['Load it', 'pd.read_csv(path) turns the file into a DataFrame.'],
        ['Look at a few rows', '.head() shows the first 5 rows so you can see what a record looks like.'],
        ['Check its size', '.shape gives (rows, columns).'],
        ['Check the types and gaps', '.info() lists every column, its type, and how many values are not missing.'],
        ['Summarise', '.describe() for numbers, .value_counts() for categories.'],
      ],
    },
    practice: 'import pandas as pd\n',
    steps: [
      { do: 'The practice box already has the pandas import. Under it, load the sample file.', code: 'accounts = pd.read_csv("data/accounts.csv")\nprint(accounts.shape)', see: '(20, 9): 20 rows, 9 columns.' },
      { do: 'List the column names. ' + ADD, code: 'print(list(accounts.columns))', see: "['account_id', 'customer', 'city', 'product', 'opened', 'credit_limit', 'balance', 'dpd', 'agent']" },
      { do: 'Look at the first two rows. ' + ADD, code: 'print(accounts.head(2))', see: 'Two rows: Asha in Pune and Ravi in Indore.' },
      { do: 'Check the type of every column. ' + ADD, code: 'print(accounts.dtypes)', see: 'Text columns show as object and number columns as int64. The opened column is object: dates were read as text.' },
      { do: 'Read the dates properly: change the read_csv line as below, then press Run.', see: 'opened now shows as datetime64[ns], a real date.', edit: ['pd.read_csv("data/accounts.csv")', 'pd.read_csv("data/accounts.csv", parse_dates=["opened"])'] },
      { do: 'Count accounts per product. ' + ADD, code: 'print(accounts["product"].value_counts())', see: 'Card 7, Personal loan 7, Consumer durable 6.' },
    ],
  },
  'pd-select': {
    terms: ['column', 'row', 'filter', 'mask', 'boolean', 'index'],
    process: {
      title: 'How a filter picks rows',
      stages: [
        ['Write a condition on a column', 'accounts["dpd"] > 60 is checked for every row.'],
        ['You get a True/False column', 'One answer per row: the mask.'],
        ['Put it inside accounts[ … ]', 'Rows where the mask is True are kept.'],
        ['Combine masks with & and |', '& means and, | means or. Each condition needs its own brackets.'],
        ['The result is a new table', 'accounts itself is unchanged.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, pick two columns.', code: 'print(accounts[["customer", "balance"]].head(3))', see: 'Three rows with only the customer and balance columns. Note the double square brackets for a list of columns.' },
      { do: 'Look at the mask a condition makes. ' + ADD, code: 'print((accounts["dpd"] > 60).head(3))', see: 'False, False, False for the first three rows: none of them is over 60 days.' },
      { do: 'Use the condition to keep rows. ' + ADD_LINES, code: 'late = accounts[accounts["dpd"] > 60]\nprint(len(late))', see: '6' },
      { do: 'Combine two conditions. Each one sits in its own brackets. ' + ADD_LINES, code: 'big_late = accounts[(accounts["dpd"] > 60) & (accounts["balance"] > 100000)]\nprint(big_late[["customer", "dpd", "balance"]])', see: 'Three rows: Rohit, Kavya and Yash.' },
      { do: 'Pick rows by label and columns by name with loc. ' + ADD, code: 'print(accounts.loc[0, "customer"], accounts.loc[0, "city"])', see: 'Asha Pune: row label 0, two different columns.' },
      { do: 'Match a list of values with isin. ' + ADD, code: 'print(len(accounts[accounts["city"].isin(["Pune", "Mumbai"])]))', see: '8 accounts are in Pune or Mumbai.' },
    ],
  },
  'pd-sort': {
    terms: ['column', 'row', 'index', 'dataframe'],
    process: {
      title: 'What happens when you sort',
      stages: [
        ['pandas compares the values in the column you name', 'sort_values("balance") orders rows by balance, smallest first.'],
        ['Whole rows move together', 'Every column stays attached to its row.'],
        ['The old row labels travel with the rows', 'After sorting, the index is out of order: 10, 13, 19…'],
        ['A new table comes back', 'The original order is untouched unless you store the result.'],
        ['reset_index(drop=True) renumbers', 'Use it when you want 0, 1, 2… again.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, sort by balance.', code: 'by_balance = accounts.sort_values("balance")\nprint(by_balance[["customer", "balance"]].head(3))', see: 'The three smallest balances: Anjali 10400, Imran 12200, Meena 17700. The row labels on the left are no longer 0, 1, 2.' },
      { do: 'Sort largest first. ' + ADD, code: 'print(accounts.sort_values("balance", ascending=False)[["customer", "balance"]].head(2))', see: 'Nisha 330000, then Rohit 268900.' },
      { do: 'Get the top rows in one step. ' + ADD, code: 'print(accounts.nlargest(2, "dpd")[["customer", "dpd"]])', see: 'Yash 130, then Kavya 112.' },
      { do: 'Sort by two columns: city A to Z, then balance largest first inside each city. ' + ADD, code: 'print(accounts.sort_values(["city", "balance"], ascending=[True, False])[["city", "customer", "balance"]].head(3))', see: 'Three Delhi rows: Rohit 268900, Karan 54100, Tara 38600.' },
      { do: 'Renumber the rows after sorting. ' + ADD, code: 'print(by_balance.reset_index(drop=True)[["customer", "balance"]].head(2))', see: 'Anjali and Imran again, now labelled 0 and 1.' },
    ],
  },
  'pd-missing': {
    terms: ['nan', 'null', 'column', 'row', 'filter'],
    process: {
      title: 'How to deal with missing values',
      stages: [
        ['Find them', '.isna().sum() counts the gaps in every column.'],
        ['Ask why they are missing', 'A missing agent may mean "unassigned"; a missing balance may be an export error. The reason decides the fix.'],
        ['Drop', 'dropna() removes rows with gaps. Safe only when few rows are affected and they do not matter.'],
        ['Or fill', 'fillna(value) puts a sensible value in the gaps: a label, 0, or the column\'s median.'],
        ['Check again', 'Re-run .isna().sum() to confirm no gaps are left.'],
      ],
    },
    practice: 'import pandas as pd\n\nraw = pd.read_csv("data/accounts_raw.csv")\n',
    steps: [
      { do: 'The practice box already loads a messy version of the accounts into a table called raw. Under those lines, count the gaps in each column.', code: 'print(raw.isna().sum())', see: 'A count per column. balance, dpd and agent each show 1 gap; the others show 0.' },
      { do: 'Look at the rows where the agent is missing. ' + ADD, code: 'print(raw[raw["agent"].isna()][["account_id", "agent"]])', see: 'One row, account A1007, whose agent shows as NaN. NaN means "no value".' },
      { do: 'Fill those gaps with a label. ' + ADD_LINES, code: 'raw["agent"] = raw["agent"].fillna("Unassigned")\nprint(raw["agent"].isna().sum())', see: '0: no missing agents are left.' },
      { do: 'See what dropping would cost. ' + ADD, code: 'print(len(raw), len(raw.dropna()))', see: '12 10: you have 12 rows, and only 10 would be left if every row with any gap were removed.' },
    ],
  },
  'pd-tidy': {
    terms: ['dtype', 'string', 'method', 'column', 'nan'],
    process: {
      title: 'How to clean a messy column',
      stages: [
        ['Look at what is really in it', '.unique() shows every different value, including odd spellings.'],
        ['Fix the text', 'The .str methods (strip, title, replace) clean every row of a text column at once.'],
        ['Fix the type', 'pd.to_numeric(column, errors="coerce") turns text into numbers; anything that is not a number becomes NaN.'],
        ['Remove repeats', 'drop_duplicates() keeps the first of each repeated row.'],
        ['Check the result', 'Look at .unique() and .dtypes again.'],
      ],
    },
    practice: 'import pandas as pd\n\nraw = pd.read_csv("data/accounts_raw.csv")\n',
    steps: [
      { do: 'The practice box already loads a messy version of the accounts into a table called raw. Under those lines, list every different city spelling.', code: 'print(raw["city"].unique())', see: 'Seven spellings for five cities: "  indore" with spaces in front, "MUMBAI " in capitals, and so on.' },
      { do: 'Clean the text of the whole column at once. ' + ADD_LINES, code: 'raw["city"] = raw["city"].str.strip().str.title()\nprint(raw["city"].unique())', see: "['Pune' 'Indore' 'Mumbai' 'Delhi' 'Nashik']: each city now appears once." },
      { do: 'Check the type of the balance column. ' + ADD, code: 'print(raw["balance"].dtype)', see: 'object, which means text. Some balances contain commas or words, so pandas could not read them as numbers.' },
      { do: 'Turn it into numbers. ' + ADD_LINES, code: 'raw["balance"] = pd.to_numeric(raw["balance"].astype(str).str.replace(",", ""), errors="coerce")\nprint(raw["balance"].dtype)', see: 'float64: a number column. Values that could not be converted are now NaN.' },
      { do: 'Count repeated account ids, then remove them. ' + ADD_LINES, code: 'print(raw["account_id"].duplicated().sum())\nraw = raw.drop_duplicates(subset="account_id")\nprint(len(raw))', see: '2, then 10: two repeated account ids, and 10 rows left after removing them.' },
    ],
  },
  'pd-columns': {
    terms: ['column', 'vectorised', 'series', 'condition', 'pyfunction'],
    process: {
      title: 'How a new column is worked out',
      stages: [
        ['Write the maths using whole columns', 'accounts["balance"] / accounts["credit_limit"]'],
        ['pandas lines the rows up', 'Row 0 of one column meets row 0 of the other, and so on.'],
        ['The maths runs for every row at once', 'This is vectorised: no loop is written.'],
        ['The results form a new Series', 'One value per row.'],
        ['Assign it to a new name', 'accounts["used"] = … attaches it as a column.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, add a column from maths on two others.', code: 'accounts["used"] = accounts["balance"] / accounts["credit_limit"]\nprint(accounts[["customer", "used"]].head(2))', see: 'Asha 0.754 and Ravi about 0.355: the share of the credit limit in use.' },
      { do: 'Add a label column with a condition. ' + ADD_LINES, code: 'import numpy as np\naccounts["status"] = np.where(accounts["dpd"] > 30, "late", "ok")\nprint(accounts["status"].value_counts())', see: 'late 11, ok 9.' },
      { do: 'Sort numbers into buckets. ' + ADD_LINES, code: 'accounts["bucket"] = pd.cut(accounts["dpd"], bins=[-1, 0, 30, 90, 999], labels=["Current", "1-30", "31-90", "90+"])\nprint(accounts["bucket"].value_counts().sort_index())', see: 'Current 4, 1-30 5, 31-90 8, 90+ 3.' },
      { do: 'Swap values using a dictionary. ' + ADD_LINES, code: 'short = {"Card": "CC", "Personal loan": "PL", "Consumer durable": "CD"}\nprint(accounts["product"].map(short).head(3).tolist())', see: "['CC', 'PL', 'CD']" },
    ],
  },
  'pd-groupby': {
    terms: ['groupby', 'aggregate', 'column', 'row', 'dataframe'],
    process: {
      title: 'How groupby works: split, apply, combine',
      stages: [
        ['Split', 'Rows are sorted into piles, one pile per value of the grouping column (one per product, say).'],
        ['Apply', 'The same calculation, such as sum or mean, is run on each pile separately.'],
        ['Combine', 'The answers are put back together: one row per group.'],
        ['The group names become the row labels', 'reset_index() turns them back into an ordinary column.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, total the balance for each product.', code: 'print(accounts.groupby("product")["balance"].sum())', see: 'Card 382700, Consumer durable 154500, Personal loan 1188700.' },
      { do: 'Count the accounts in each group. ' + ADD, code: 'print(accounts.groupby("city").size())', see: 'Four accounts in each of the five cities.' },
      { do: 'Work out several things at once and name the results. ' + ADD_LINES, code: 'summary = accounts.groupby("product").agg(accounts=("account_id", "count"), total=("balance", "sum"), avg_dpd=("dpd", "mean"))\nprint(summary)', see: 'One row per product with three named columns: accounts, total and avg_dpd.' },
      { do: 'Turn the group names back into a normal column. ' + ADD, code: 'print(summary.reset_index().columns.tolist())', see: "['product', 'accounts', 'total', 'avg_dpd']" },
      { do: 'Put each group\'s total back on every row. ' + ADD_LINES, code: 'accounts["product_total"] = accounts.groupby("product")["balance"].transform("sum")\nprint(accounts[["customer", "product", "product_total"]].head(2))', see: 'Asha (Card) shows 382700 and Ravi (Personal loan) shows 1188700: each row carries its own group\'s total.' },
    ],
  },
  'pd-reshape': {
    terms: ['pivot', 'row', 'column', 'aggregate', 'groupby'],
    process: {
      title: 'How a pivot table is built',
      stages: [
        ['Choose what goes down the side', 'index="city": one row per city.'],
        ['Choose what goes across the top', 'columns="product": one column per product.'],
        ['Choose the number to fill in', 'values="balance".'],
        ['Choose how to combine', 'aggfunc="sum" adds up every balance that falls in the same cell.'],
        ['Empty cells', 'A city with no accounts of a product shows NaN, or whatever you give as fill_value.'],
      ],
    },
    practice: PD,
    steps: [
      { do: PD_NOTE + 'Under them, build a pivot table: cities down the side, products across the top.', code: 'table = accounts.pivot_table(index="city", columns="product", values="balance", aggfunc="sum", fill_value=0)\nprint(table)', see: 'A grid with five city rows and three product columns, each cell holding a total balance.' },
      { do: 'Read one cell. ' + ADD, code: 'print(table.loc["Pune", "Card"])', see: '49900: the total Card balance in Pune.' },
      { do: 'Count combinations with crosstab. ' + ADD, code: 'print(pd.crosstab(accounts["city"], accounts["product"]))', see: 'The same grid shape, holding how many accounts are in each cell.' },
      { do: 'Turn the wide table back into a long one. ' + ADD_LINES, code: 'long = table.reset_index().melt(id_vars="city", var_name="product", value_name="balance")\nprint(long.shape)', see: '(15, 3): 5 cities times 3 products, one row each.' },
    ],
  },
  'pd-merge': {
    terms: ['merge', 'join', 'primarykey', 'column', 'row', 'nan'],
    process: {
      title: 'How a merge matches rows',
      stages: [
        ['Pick the shared column', 'on="account_id": the column both tables have.'],
        ['Take a row from the left table', 'pandas reads its account_id.'],
        ['Find rows with the same value on the right', 'Each match makes one output row, with columns from both tables.'],
        ['Decide what to do with no match', 'how="inner" drops the row. how="left" keeps it and fills the right-hand columns with NaN.'],
        ['One-to-many multiplies rows', 'An account with three payments appears three times in the result.'],
      ],
    },
    practice: PD + 'payments = pd.read_csv("data/payments.csv")\n',
    steps: [
      { do: 'The practice box already loads two tables: accounts and payments. Under those lines, check their sizes.', code: 'print(len(accounts), len(payments))', see: '20 69: 20 accounts and 69 payments.' },
      { do: 'Bring each payment\'s customer name across, like a VLOOKUP. ' + ADD_LINES, code: 'joined = payments.merge(accounts[["account_id", "customer", "agent"]], on="account_id", how="left")\nprint(joined.shape)', see: '(69, 7): still 69 rows, now with two extra columns.' },
      { do: 'Look at a few merged rows. ' + ADD, code: 'print(joined[["payment_id", "customer", "amount"]].head(2))', see: 'Two payments, each showing the name of the customer who made it.' },
      { do: 'Find accounts with no payment at all. ' + ADD_LINES, code: 'check = accounts.merge(payments, on="account_id", how="left", indicator=True)\nprint((check["_merge"] == "left_only").sum())', see: '1: one account never appears in the payments table.' },
      { do: 'Total payments per agent, using both tables. ' + ADD, code: 'print(joined.groupby("agent")["amount"].sum())', see: 'One total per agent: Amit, Kiran, Neha and Zoya.' },
    ],
  },
  'pd-time': {
    terms: ['datetime', 'dtype', 'column', 'groupby', 'aggregate'],
    process: {
      title: 'How dates become monthly totals',
      stages: [
        ['Dates arrive as text', 'A CSV stores "2026-01-15" as characters, so pandas cannot do date maths on it yet.'],
        ['Convert them', 'pd.to_datetime(column) turns the text into real dates.'],
        ['Use .dt to read parts', '.dt.month, .dt.day_name() and others pull pieces out of every date.'],
        ['Group by a period', '.dt.to_period("M") labels each row with its month, ready for groupby.'],
        ['Compare periods', '.pct_change() gives the change from the previous month.'],
      ],
    },
    practice: 'import pandas as pd\n\npayments = pd.read_csv("data/payments.csv")\n',
    steps: [
      { do: 'The practice box already loads the payments table. Under those lines, check the type of the date column.', code: 'print(payments["date"].dtype)', see: 'object: the dates are still text.' },
      { do: 'Convert them to real dates. ' + ADD_LINES, code: 'payments["date"] = pd.to_datetime(payments["date"])\nprint(payments["date"].dtype)', see: 'datetime64[ns]' },
      { do: 'Find the first and last payment date. ' + ADD, code: 'print(payments["date"].min().date(), payments["date"].max().date())', see: '2026-01-01 2026-06-27: the earliest and the latest payment in the file.' },
      { do: 'Pull the weekday name out of every date. ' + ADD, code: 'print(payments["date"].dt.day_name().value_counts().head(2))', see: 'Thursday 15 and Wednesday 12: the two weekdays with the most payments.' },
      { do: 'Total the payments for each month. ' + ADD_LINES, code: 'monthly = payments.groupby(payments["date"].dt.to_period("M"))["amount"].sum()\nprint(monthly)', see: 'Six totals, one per month from 2026-01 (57600) to 2026-06 (86760).' },
      { do: 'Show the change from the month before. ' + ADD, code: 'print(monthly.pct_change().round(2))', see: 'NaN for the first month (nothing to compare with), then the change as a fraction for each later month.' },
    ],
  },
  'pd-project': {
    terms: ['dataframe', 'groupby', 'merge', 'pyfunction', 'column'],
    process: {
      title: 'How to build a report from raw files',
      stages: [
        ['Load', 'Read each file into its own DataFrame.'],
        ['Clean', 'Fix types and dates once, at the start.'],
        ['Add the columns you need', 'Buckets, flags and ratios.'],
        ['Combine', 'Merge the tables on their shared key.'],
        ['Summarise', 'groupby and pivot_table produce the numbers for the report.'],
        ['Package it', 'Put the steps in a function so next month is one call.'],
      ],
    },
    practice: PD + 'payments = pd.read_csv("data/payments.csv")\n',
    steps: [
      { do: 'The practice box already loads accounts and payments. Under those lines, add a bucket column.', code: 'accounts["bucket"] = pd.cut(accounts["dpd"], bins=[-1, 0, 30, 90, 999], labels=["Current", "1-30", "31-90", "90+"])\nprint(accounts["bucket"].value_counts().sort_index())', see: 'Current 4, 1-30 5, 31-90 8, 90+ 3.' },
      { do: 'Total what each account paid. ' + ADD_LINES, code: 'paid = payments.groupby("account_id")["amount"].sum().rename("paid").reset_index()\nprint(paid.head(2))', see: 'Two rows with an account id and the total it paid.' },
      { do: 'Bring the two together. ' + ADD_LINES, code: 'book = accounts.merge(paid, on="account_id", how="left").fillna({"paid": 0})\nprint(book.shape)', see: '(20, 11): every account, now with bucket and paid columns.' },
      { do: 'Summarise by bucket. ' + ADD_LINES, code: 'report = book.groupby("bucket", observed=True).agg(accounts=("account_id", "count"), balance=("balance", "sum"), paid=("paid", "sum"))\nprint(report)', see: 'Four rows, one per bucket, with the number of accounts, total balance and total paid.' },
      { do: 'Wrap it in a function so it can be reused. ' + ADD_LINES, code: 'def bucket_report(book):\n    return book.groupby("bucket", observed=True)["balance"].sum()\n\nprint(bucket_report(book))', see: 'The balance per bucket again, this time produced by one function call.' },
    ],
  },
};
