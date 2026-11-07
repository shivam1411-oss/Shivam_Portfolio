import { B, Callout, F, H, P, Term } from '../ui';
import PyRunner from '../python/PyRunner';
import { py } from '../python/lessons-beginner';

// "SQL with Python": SQL is the skill analyst job postings ask for most often. Lessons use SQLite
// (built into Python) with the same collections data as the pandas course, loaded into an
// in-memory database at the top of each example.

// The first lines of most examples: a fresh database holding the sample tables.
const SETUP = `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")          # a brand-new database in memory
for table in ["accounts", "payments", "dpd_history"]:
    pd.read_csv(f"data/{table}.csv").to_sql(table, con, index=False)
`;

// Tests rebuild their own database so a learner's changes cannot affect the check.
const TEST_DB = `import sqlite3 as _sq, pandas as _pd
_ref = _sq.connect(":memory:")
for _t in ["accounts", "payments", "dpd_history"]:
    _pd.read_csv(f"data/{_t}.csv").to_sql(_t, _ref, index=False)
def _rows(sql, params=()):
    return [tuple(r) for r in _ref.execute(sql, params).fetchall()]
`;

const modules = [
  { id: 'sql-basics', title: 'Querying', level: 'Beginner', blurb: 'What a database is, then SELECT, filters, sorting, aggregates and GROUP BY.' },
  { id: 'sql-more', title: 'Joining and changing data', level: 'Intermediate', blurb: 'JOINs, safe parameters, inserts, updates and transactions.' },
  { id: 'sql-pro', title: 'Advanced SQL with pandas', level: 'Advanced', blurb: 'CTEs, window functions and moving results into pandas.' },
];

const lessons = [
  {
    id: 'sql-tables',
    module: 'sql-basics',
    title: 'Databases, tables and rows',
    minutes: 12,
    goals: ['Understand what a database, a table, a row and a column are', 'Create a table and add rows with plain SQL', 'See how a primary key and NULL keep data honest'],
    body: () => (
      <>
        <P>
          A <B>database</B> is an organised store of data, and it keeps that data in <Term id="table">tables</Term>. A table looks like a spreadsheet, with one big
          difference: every column has a fixed meaning and type, and the database enforces rules so bad data cannot sneak in. <Term id="sql">SQL</Term> is the language you
          use to build tables and ask them questions.
        </P>
        <H>Build a table by hand</H>
        <PyRunner
          code={py`
import sqlite3

con = sqlite3.connect(":memory:")       # a brand-new, empty database (in memory)

con.execute("""
    CREATE TABLE accounts (
        account_id TEXT PRIMARY KEY,    -- unique for every row
        city       TEXT,
        balance    INTEGER,
        dpd        INTEGER
    )
""")

con.execute("INSERT INTO accounts VALUES ('A1001', 'Pune', 37700, 0)")
con.executemany("INSERT INTO accounts VALUES (?, ?, ?, ?)", [
    ("A1002", "Indore", 106400, 0),
    ("A1010", "Nashik", 127200, 47),
])

for row in con.execute("SELECT * FROM accounts"):
    print(row)
`}
        />
        <P>
          <F>CREATE TABLE</F> describes the columns and their types (<F>TEXT</F>, <F>INTEGER</F>, <F>REAL</F> for decimals). <F>INSERT INTO</F> adds rows. Each row comes back
          to Python as a tuple. Press <B>Step through</B> to watch it happen line by line.
        </P>
        <H>Rules that protect the data</H>
        <PyRunner
          code={py`
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE accounts (account_id TEXT PRIMARY KEY, city TEXT, balance INTEGER)")
con.execute("INSERT INTO accounts VALUES ('A1001', 'Pune', 37700)")

try:
    con.execute("INSERT INTO accounts VALUES ('A1001', 'Delhi', 5000)")   # same id again
except sqlite3.IntegrityError as e:
    print("Refused:", e)

con.execute("INSERT INTO accounts (account_id, city) VALUES ('A1002', 'Indore')")  # no balance given
print(con.execute("SELECT * FROM accounts").fetchall())          # None = NULL, no value
print(con.execute("SELECT COUNT(*) FROM accounts WHERE balance IS NULL").fetchone())
`}
        />
        <Callout title="NULL is not zero">
          <F>NULL</F> means "no value": not 0 and not empty text. Test for it with <F>IS NULL</F>, because <F>balance = NULL</F> is never true.
        </Callout>
        <Callout title="Shortcut used in later lessons">
          From the next lesson on, each example fills a database from the sample CSV files with one pandas line, <F>to_sql</F>, so you can focus on the queries.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'sql-create',
        title: 'Your first table',
        prompt:
          'Create a table agents with columns name (TEXT, PRIMARY KEY), team (TEXT) and target (INTEGER). Insert the three agents from the list with executemany and ? placeholders, then set count to the number of rows (from SELECT COUNT(*)).',
        starter: py`
import sqlite3

con = sqlite3.connect(":memory:")
agents = [("Kiran", "Field", 500000), ("Neha", "Tele", 350000), ("Amit", "Field", 450000)]

# create the table and insert the rows here

count = None
print(count)
`,
        tests: [
          { name: 'agents has columns name, team, target', code: py`
cols = [(r[1], r[2].upper(), r[5]) for r in con.execute("PRAGMA table_info(agents)")]
assert [c[0] for c in cols] == ["name", "team", "target"], f"columns {cols}"
assert [c[1] for c in cols] == ["TEXT", "TEXT", "INTEGER"], f"types {[c[1] for c in cols]}"
assert cols[0][2] == 1, "name should be the PRIMARY KEY"
` },
          { name: 'the three agents are in the table', code: py`
rows = sorted(con.execute("SELECT name, team, target FROM agents").fetchall())
assert rows == sorted(agents), f"rows {rows}"
` },
          { name: 'count == 3', code: py`assert count == 3, f"got {count!r}"` },
          { name: 'the primary key refuses a duplicate name', code: py`
import sqlite3
try:
    con.execute("INSERT INTO agents VALUES ('Kiran', 'Tele', 1)")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("a duplicate name was accepted; is name the PRIMARY KEY?")
` },
        ],
        hint: 'con.execute("CREATE TABLE agents (name TEXT PRIMARY KEY, team TEXT, target INTEGER)"); con.executemany("INSERT INTO agents VALUES (?, ?, ?)", agents); count = con.execute("SELECT COUNT(*) FROM agents").fetchone()[0]',
        solution: py`
import sqlite3

con = sqlite3.connect(":memory:")
agents = [("Kiran", "Field", 500000), ("Neha", "Tele", 350000), ("Amit", "Field", 450000)]

con.execute("CREATE TABLE agents (name TEXT PRIMARY KEY, team TEXT, target INTEGER)")
con.executemany("INSERT INTO agents VALUES (?, ?, ?)", agents)

count = con.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
print(count)
`,
      },
    ],
    quiz: [
      { q: 'In a table of accounts, what is one row?', options: ['One column of balances', 'One account', 'The whole database', 'One query'], answer: 1, why: 'Each row is one item (one account); each column is one property of it.' },
      { q: 'What does a PRIMARY KEY guarantee?', options: ['The column is sorted', 'Every row has a different value in it', 'It is a number', 'It cannot be read'], answer: 1, why: 'It identifies each row uniquely, so duplicates are refused.' },
      { q: 'How do you find rows where balance has no value?', options: ['balance = NULL', 'balance = 0', 'balance IS NULL', "balance = ''"], answer: 2, why: 'NULL is never equal to anything, so SQL uses IS NULL.' },
    ],
  },
  {
    id: 'sql-select',
    module: 'sql-basics',
    title: 'Your first queries',
    minutes: 12,
    goals: ['Connect to a database from Python with sqlite3', 'SELECT columns, filter with WHERE, sort with ORDER BY, LIMIT the rows', 'Read results back into Python'],
    body: () => (
      <>
        <P>
          <Term id="sql">SQL</Term> is how you ask a database questions. Most company data sits in databases, which is why SQL appears in more analyst job postings than any
          other skill. Python's built-in <F>sqlite3</F> module runs a real SQL database, so you can practise exactly what you would write at work.
        </P>
        <PyRunner
          code={py`
${SETUP}
rows = con.execute("""
    SELECT account_id, city, balance
    FROM accounts
    WHERE dpd > 90
    ORDER BY balance DESC
""").fetchall()

for row in rows:
    print(row)
`}
        />
        <H>The shape of a query</H>
        <P>
          Clauses always come in this order: <F>SELECT</F> columns <F>FROM</F> table <F>WHERE</F> rows <F>ORDER BY</F> sorting <F>LIMIT</F> how many. SQL keywords are
          not case-sensitive, but writing them in capitals keeps queries readable.
        </P>
        <PyRunner
          code={py`
${SETUP}
q = """
SELECT account_id, product, balance AS outstanding      -- AS renames a column
FROM accounts
WHERE city IN ('Pune', 'Mumbai') AND product <> 'Card'
ORDER BY outstanding DESC
LIMIT 3
"""
for row in con.execute(q):
    print(row)
print(con.execute("SELECT DISTINCT agent FROM accounts ORDER BY agent").fetchall())
`}
        />
        <Callout title="fetchall, fetchone">
          <F>con.execute(sql)</F> returns a cursor. <F>.fetchall()</F> gives a list of tuples, <F>.fetchone()</F> just the first row; you can also loop over the cursor
          directly.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'sql-first',
        title: 'Overdue cards',
        prompt: 'Write query (a SQL string) returning account_id and balance of Card accounts with dpd over 30, largest balance first. Run it and store the list of tuples in rows.',
        starter: py`
${SETUP}
query = """
SELECT *
FROM accounts
"""
rows = con.execute(query).fetchall()
print(rows)
`,
        tests: [
          {
            name: 'rows are (account_id, balance) for overdue cards, largest first',
            code: py`
${TEST_DB}
expected = _rows("SELECT account_id, balance FROM accounts WHERE product = 'Card' AND dpd > 30 ORDER BY balance DESC")
assert [tuple(r) for r in rows] == expected, f"got {rows}, expected {expected}"
`,
          },
          { name: 'query works on a fresh database', code: py`
${TEST_DB}
assert _rows(query) == _rows("SELECT account_id, balance FROM accounts WHERE product = 'Card' AND dpd > 30 ORDER BY balance DESC"), "query gives different rows"
` },
        ],
        hint: "SELECT account_id, balance FROM accounts WHERE product = 'Card' AND dpd > 30 ORDER BY balance DESC",
        solution: py`
${SETUP}
query = """
SELECT account_id, balance
FROM accounts
WHERE product = 'Card' AND dpd > 30
ORDER BY balance DESC
"""
rows = con.execute(query).fetchall()
print(rows)
`,
      },
    ],
    quiz: [
      { q: 'Which order is correct?', options: ['SELECT … WHERE … FROM …', 'SELECT … FROM … WHERE … ORDER BY …', 'FROM … SELECT … ORDER BY … WHERE …', 'Any order works'], answer: 1, why: 'SQL clauses have a fixed order.' },
      { q: 'In SQL, text values go in…', options: ['Double quotes "Card"', "Single quotes 'Card'", 'Backticks', 'No quotes'], answer: 1, why: 'Single quotes mark strings; double quotes are for column names in standard SQL.' },
    ],
  },
  {
    id: 'sql-group',
    module: 'sql-basics',
    title: 'Aggregates, GROUP BY and CASE',
    minutes: 12,
    goals: ['Summarise with COUNT, SUM, AVG, MIN and MAX', 'Group with GROUP BY and filter groups with HAVING', 'Create buckets with CASE WHEN'],
    body: () => (
      <>
        <PyRunner
          code={py`
${SETUP}
q = """
SELECT agent,
       COUNT(*)              AS accounts,
       SUM(balance)          AS total_balance,
       ROUND(AVG(dpd), 1)    AS avg_dpd
FROM accounts
GROUP BY agent
HAVING SUM(balance) > 300000      -- HAVING filters groups; WHERE filters rows
ORDER BY total_balance DESC
"""
for row in con.execute(q):
    print(row)
`}
        />
        <H>CASE WHEN: buckets in SQL</H>
        <PyRunner
          code={py`
${SETUP}
q = """
SELECT CASE
         WHEN dpd = 0   THEN 'Current'
         WHEN dpd <= 30 THEN '1-30'
         WHEN dpd <= 60 THEN '31-60'
         WHEN dpd <= 90 THEN '61-90'
         ELSE '90+'
       END              AS bucket,
       COUNT(*)         AS accounts,
       SUM(balance)     AS exposure
FROM accounts
GROUP BY bucket
ORDER BY MIN(dpd)
"""
for row in con.execute(q):
    print(row)
`}
        />
        <Callout tone="warn" title="WHERE vs HAVING">
          <F>WHERE</F> runs before grouping, on individual rows. <F>HAVING</F> runs after, on group results like <F>SUM(balance)</F>. You cannot use an aggregate in WHERE.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'sql-product',
        title: 'Exposure by product',
        prompt:
          'Write query returning product, number of accounts (as accounts), total balance (as exposure) and the number of accounts with dpd over 60 (as late, using SUM(CASE WHEN … THEN 1 ELSE 0 END)), one row per product, largest exposure first. Store the result in rows.',
        starter: py`
${SETUP}
query = """
SELECT product
FROM accounts
"""
rows = con.execute(query).fetchall()
print(rows)
`,
        tests: [
          {
            name: 'product, accounts, exposure, late, largest exposure first',
            code: py`
${TEST_DB}
expected = _rows("""SELECT product, COUNT(*), SUM(balance), SUM(CASE WHEN dpd > 60 THEN 1 ELSE 0 END)
                    FROM accounts GROUP BY product ORDER BY SUM(balance) DESC""")
assert [tuple(r) for r in rows] == expected, f"got {rows}, expected {expected}"
`,
          },
          { name: 'columns are named accounts, exposure, late', code: py`
cur = con.execute(query)
names = [d[0] for d in cur.description]
assert names == ["product", "accounts", "exposure", "late"], f"columns are {names}"
` },
        ],
        hint: 'SELECT product, COUNT(*) AS accounts, SUM(balance) AS exposure, SUM(CASE WHEN dpd > 60 THEN 1 ELSE 0 END) AS late FROM accounts GROUP BY product ORDER BY exposure DESC',
        solution: py`
${SETUP}
query = """
SELECT product,
       COUNT(*) AS accounts,
       SUM(balance) AS exposure,
       SUM(CASE WHEN dpd > 60 THEN 1 ELSE 0 END) AS late
FROM accounts
GROUP BY product
ORDER BY exposure DESC
"""
rows = con.execute(query).fetchall()
print(rows)
`,
      },
    ],
    quiz: [
      { q: 'Keep only agents whose total balance is over 3 lakh. Which clause?', options: ['WHERE SUM(balance) > 300000', 'HAVING SUM(balance) > 300000', 'ORDER BY', 'LIMIT'], answer: 1, why: 'Conditions on aggregates go in HAVING.' },
      { q: 'What does COUNT(*) count?', options: ['Columns', 'Rows (in each group)', 'Distinct values', 'Non-zero values'], answer: 1, why: 'COUNT(*) counts rows; COUNT(column) skips NULLs.' },
    ],
  },
  {
    id: 'sql-joins',
    module: 'sql-more',
    title: 'JOINs',
    minutes: 14,
    goals: ['Combine tables with INNER JOIN and LEFT JOIN', 'Find rows with no match (anti-join)', 'Handle missing values with COALESCE'],
    body: () => (
      <>
        <P>
          A <F>JOIN</F> lines up rows from two tables that share a key. <F>INNER JOIN</F> keeps only matches; <F>LEFT JOIN</F> keeps every row of the first table and fills
          NULL where there is no match. This is the SQL twin of pandas' merge.
        </P>
        <PyRunner
          code={py`
${SETUP}
q = """
SELECT a.agent, COUNT(p.payment_id) AS payments, SUM(p.amount) AS collected
FROM payments AS p
JOIN accounts AS a ON a.account_id = p.account_id      -- JOIN means INNER JOIN
GROUP BY a.agent
ORDER BY collected DESC
"""
for row in con.execute(q):
    print(row)
`}
        />
        <H>LEFT JOIN, COALESCE and the anti-join</H>
        <PyRunner
          code={py`
${SETUP}
q = """
SELECT a.account_id, a.dpd, COALESCE(SUM(p.amount), 0) AS collected
FROM accounts AS a
LEFT JOIN payments AS p ON p.account_id = a.account_id
GROUP BY a.account_id
ORDER BY collected
LIMIT 5
"""
for row in con.execute(q):
    print(row)

never = con.execute("""
    SELECT a.account_id FROM accounts a
    LEFT JOIN payments p ON p.account_id = a.account_id
    WHERE p.account_id IS NULL                -- no match at all
""").fetchall()
print("never paid:", never)
`}
        />
        <Callout title="Table aliases">
          <F>FROM payments AS p</F> lets you write <F>p.amount</F> instead of <F>payments.amount</F>. Always prefix columns once two tables are involved, so it is clear where
          each comes from.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'sql-city',
        title: 'Collections by city',
        prompt:
          'Write query returning city and total collected (as collected) for every city, including 0 for cities with no payments, using accounts LEFT JOIN payments. Order by collected, largest first. Store the result in rows.',
        starter: py`
${SETUP}
query = """
SELECT city
FROM accounts
"""
rows = con.execute(query).fetchall()
print(rows)
`,
        tests: [
          {
            name: 'every city with its total collected, largest first',
            code: py`
${TEST_DB}
expected = _rows("""SELECT a.city, COALESCE(SUM(p.amount), 0) AS collected FROM accounts a
                    LEFT JOIN payments p ON p.account_id = a.account_id GROUP BY a.city ORDER BY collected DESC""")
assert [tuple(r) for r in rows] == expected, f"got {rows}, expected {expected}"
`,
          },
        ],
        hint: 'SELECT a.city, COALESCE(SUM(p.amount), 0) AS collected FROM accounts a LEFT JOIN payments p ON p.account_id = a.account_id GROUP BY a.city ORDER BY collected DESC',
        solution: py`
${SETUP}
query = """
SELECT a.city, COALESCE(SUM(p.amount), 0) AS collected
FROM accounts AS a
LEFT JOIN payments AS p ON p.account_id = a.account_id
GROUP BY a.city
ORDER BY collected DESC
"""
rows = con.execute(query).fetchall()
print(rows)
`,
      },
    ],
    quiz: [
      { q: 'Accounts LEFT JOIN payments: what happens to an account with no payments?', options: ['It is dropped', 'It appears once, with NULL in the payment columns', 'It causes an error', 'It appears twice'], answer: 1, why: 'A LEFT JOIN keeps every left row.' },
      { q: 'How do you find accounts with no payments?', options: ['INNER JOIN', 'LEFT JOIN … WHERE p.account_id IS NULL', 'WHERE amount = 0', 'GROUP BY'], answer: 1, why: 'Unmatched rows have NULL on the right side: that is an anti-join.' },
    ],
  },
  {
    id: 'sql-safe',
    module: 'sql-more',
    title: 'Parameters, changes and transactions',
    minutes: 12,
    goals: ['Pass values safely with ? placeholders', 'Understand SQL injection', 'INSERT, UPDATE and DELETE inside a transaction'],
    body: () => (
      <>
        <P>
          Never build SQL by pasting user input into a string. Use <F>?</F> placeholders and pass the values separately: the database then treats them as data, never as
          SQL.
        </P>
        <PyRunner
          code={py`
${SETUP}
account = "A1010' OR '1'='1"      # a malicious "account id"

unsafe = f"SELECT account_id FROM accounts WHERE account_id = '{account}'"
print("unsafe returns", len(con.execute(unsafe).fetchall()), "rows!")   # every row leaks

safe = con.execute("SELECT account_id FROM accounts WHERE account_id = ?", (account,)).fetchall()
print("safe returns", len(safe), "rows")
`}
        />
        <H>Changing data in a transaction</H>
        <P>
          <F>with con:</F> opens a <B>transaction</B>: if everything inside succeeds it is committed; if anything fails, all of it is rolled back. A payment and its balance
          update either both happen or neither does.
        </P>
        <PyRunner
          code={py`
${SETUP}
def record_payment(con, account_id, amount, date):
    with con:   # commit on success, roll back on error
        con.execute("INSERT INTO payments (payment_id, account_id, date, amount, channel) VALUES (?, ?, ?, ?, 'UPI')",
                    (f"N-{account_id}-{date}", account_id, date, amount))
        con.execute("UPDATE accounts SET balance = balance - ? WHERE account_id = ?", (amount, account_id))

record_payment(con, "A1010", 5000, "2026-07-01")
print(con.execute("SELECT balance FROM accounts WHERE account_id = 'A1010'").fetchone())
print(con.execute("SELECT COUNT(*) FROM payments").fetchone())
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'sql-add-payment',
        title: 'A safe payment function',
        prompt:
          'Complete add_payment(con, account_id, amount, date): raise ValueError if amount <= 0 or the account does not exist (check with a parameterised SELECT). Otherwise, in one transaction, insert the payment (payment_id "N1", "N2"… numbered by how many N payments exist, channel "UPI") and reduce the account balance. Always use ? placeholders.',
        starter: py`
${SETUP}
def add_payment(con, account_id, amount, date):
    pass

add_payment(con, "A1001", 1500, "2026-07-01")
print(con.execute("SELECT * FROM payments WHERE payment_id LIKE 'N%'").fetchall())
`,
        tests: [
          { name: 'a payment is inserted and the balance reduced', code: py`
import sqlite3, pandas as pd
c = sqlite3.connect(":memory:")
for t in ["accounts", "payments"]:
    pd.read_csv(f"data/{t}.csv").to_sql(t, c, index=False)
add_payment(c, "A1002", 2000, "2026-07-02")
assert c.execute("SELECT balance FROM accounts WHERE account_id = 'A1002'").fetchone()[0] == 104400, "balance not reduced"
row = c.execute("SELECT payment_id, account_id, amount, channel FROM payments WHERE payment_id LIKE 'N%'").fetchall()
assert row == [("N1", "A1002", 2000, "UPI")], f"inserted {row}"
add_payment(c, "A1002", 100, "2026-07-03")
ids = [r[0] for r in c.execute("SELECT payment_id FROM payments WHERE payment_id LIKE 'N%' ORDER BY payment_id")]
assert ids == ["N1", "N2"], f"ids {ids}"
` },
          { name: 'unknown account raises ValueError and changes nothing', code: py`
import sqlite3, pandas as pd
c = sqlite3.connect(":memory:")
for t in ["accounts", "payments"]:
    pd.read_csv(f"data/{t}.csv").to_sql(t, c, index=False)
try:
    add_payment(c, "NOPE", 100, "2026-07-01")
except ValueError:
    pass
else:
    raise AssertionError("no ValueError for an unknown account")
assert c.execute("SELECT COUNT(*) FROM payments").fetchone()[0] == 69, "a payment was inserted"
` },
          { name: 'zero or negative amount raises ValueError', code: py`
import sqlite3, pandas as pd
c = sqlite3.connect(":memory:")
for t in ["accounts", "payments"]:
    pd.read_csv(f"data/{t}.csv").to_sql(t, c, index=False)
for bad in (0, -5):
    try:
        add_payment(c, "A1001", bad, "2026-07-01")
    except ValueError:
        continue
    raise AssertionError(f"no ValueError for {bad}")
` },
          { name: 'uses ? placeholders, not f-strings in SQL', code: py`
import re
body = SOURCE.split("def add_payment", 1)[1]
assert "?" in body, "no ? placeholders found"
assert not re.search(r"execute\(\s*f[\"']", body), "found an f-string inside execute()"
` },
        ],
        hint:
          'exists = con.execute("SELECT 1 FROM accounts WHERE account_id = ?", (account_id,)).fetchone(). n = con.execute("SELECT COUNT(*) FROM payments WHERE payment_id LIKE \'N%\'").fetchone()[0] + 1. Then inside "with con:" run the INSERT and the UPDATE with ? placeholders.',
        solution: py`
${SETUP}
def add_payment(con, account_id, amount, date):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if con.execute("SELECT 1 FROM accounts WHERE account_id = ?", (account_id,)).fetchone() is None:
        raise ValueError(f"Unknown account {account_id}")
    n = con.execute("SELECT COUNT(*) FROM payments WHERE payment_id LIKE 'N%'").fetchone()[0] + 1
    with con:
        con.execute("INSERT INTO payments (payment_id, account_id, date, amount, channel) VALUES (?, ?, ?, ?, 'UPI')",
                    (f"N{n}", account_id, date, amount))
        con.execute("UPDATE accounts SET balance = balance - ? WHERE account_id = ?", (amount, account_id))

add_payment(con, "A1001", 1500, "2026-07-01")
print(con.execute("SELECT * FROM payments WHERE payment_id LIKE 'N%'").fetchall())
`,
      },
    ],
    quiz: [
      { q: 'Why use ? placeholders instead of f-strings?', options: ['They are shorter', 'Values are passed as data, so they can never be run as SQL (no injection)', 'f-strings do not work', 'They are faster to type'], answer: 1, why: 'Placeholders stop SQL injection and handle quoting for you.' },
      { q: 'Inside "with con:", the second statement fails. What about the first?', options: ['It stays', 'It is rolled back too', 'It runs twice', 'The database is deleted'], answer: 1, why: 'A transaction is all-or-nothing.' },
    ],
  },
  {
    id: 'sql-window',
    module: 'sql-pro',
    title: 'CTEs and window functions',
    minutes: 14,
    goals: ['Break a query into steps with WITH (common table expressions)', 'Rank rows within groups with ROW_NUMBER', 'Running totals and previous values with SUM() OVER and LAG'],
    body: () => (
      <>
        <P>
          A <B>window function</B> calculates across related rows without collapsing them like GROUP BY does. They are a favourite in analyst interviews: top-N per group,
          running totals, month-on-month change.
        </P>
        <PyRunner
          code={py`
${SETUP}
q = """
WITH ranked AS (                                   -- a named step
    SELECT agent, account_id, balance,
           ROW_NUMBER() OVER (PARTITION BY agent ORDER BY balance DESC) AS rn
    FROM accounts
)
SELECT agent, account_id, balance
FROM ranked
WHERE rn = 1                                       -- biggest account per agent
ORDER BY balance DESC
"""
for row in con.execute(q):
    print(row)
`}
        />
        <H>Running totals and LAG</H>
        <PyRunner
          code={py`
${SETUP}
q = """
WITH monthly AS (
    SELECT substr(date, 1, 7) AS month, SUM(amount) AS collected
    FROM payments
    GROUP BY month
)
SELECT month,
       collected,
       SUM(collected) OVER (ORDER BY month)  AS running_total,
       collected - LAG(collected) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month
"""
for row in con.execute(q):
    print(row)
`}
        />
        <Callout title="PARTITION BY vs GROUP BY">
          GROUP BY returns one row per group. PARTITION BY keeps every row and lets the window function look at the other rows of its group.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'sql-top-per-product',
        title: 'Top two per product',
        prompt:
          'Write query returning product, account_id and balance for the 2 largest balances in each product (use a CTE with ROW_NUMBER() OVER (PARTITION BY product ORDER BY balance DESC)). Order by product, then balance descending. Store the result in rows.',
        starter: py`
${SETUP}
query = """
SELECT product, account_id, balance
FROM accounts
"""
rows = con.execute(query).fetchall()
print(rows)
`,
        tests: [
          {
            name: 'two largest balances per product',
            code: py`
${TEST_DB}
expected = _rows("""WITH r AS (SELECT product, account_id, balance,
                          ROW_NUMBER() OVER (PARTITION BY product ORDER BY balance DESC) rn FROM accounts)
                    SELECT product, account_id, balance FROM r WHERE rn <= 2 ORDER BY product, balance DESC""")
assert [tuple(r) for r in rows] == expected, f"got {rows}, expected {expected}"
`,
          },
          { name: 'uses a window function', code: py`assert "OVER" in query.upper(), "use ROW_NUMBER() OVER (...)"` },
        ],
        hint: 'WITH ranked AS (SELECT product, account_id, balance, ROW_NUMBER() OVER (PARTITION BY product ORDER BY balance DESC) AS rn FROM accounts) SELECT product, account_id, balance FROM ranked WHERE rn <= 2 ORDER BY product, balance DESC',
        solution: py`
${SETUP}
query = """
WITH ranked AS (
    SELECT product, account_id, balance,
           ROW_NUMBER() OVER (PARTITION BY product ORDER BY balance DESC) AS rn
    FROM accounts
)
SELECT product, account_id, balance
FROM ranked
WHERE rn <= 2
ORDER BY product, balance DESC
"""
rows = con.execute(query).fetchall()
print(rows)
`,
      },
    ],
    quiz: [
      { q: 'Best way to get the top account per agent?', options: ['GROUP BY agent with MAX(balance) only', 'ROW_NUMBER() OVER (PARTITION BY agent ORDER BY balance DESC) and keep rn = 1', 'ORDER BY balance LIMIT 1', 'A LEFT JOIN'], answer: 1, why: 'MAX gives the value but not the rest of that row; ROW_NUMBER keeps the whole row.' },
      { q: 'LAG(collected) OVER (ORDER BY month) returns…', options: ["The next month's value", "The previous month's value", 'The total', 'NULL always'], answer: 1, why: 'LAG looks back one row; LEAD looks forward.' },
    ],
  },
  {
    id: 'sql-pandas',
    module: 'sql-pro',
    title: 'SQL and pandas together',
    minutes: 12,
    goals: ['Load query results into pandas with read_sql_query', 'Pass parameters to read_sql_query', 'Split work sensibly: filter and aggregate in SQL, reshape and chart in pandas'],
    body: () => (
      <>
        <P>
          At work you rarely stop at a list of tuples. <F>pd.read_sql_query</F> returns a DataFrame with column names, ready for pivoting, charts or Excel. A good rule:
          let the database filter and aggregate (it is close to the data), then use pandas for reshaping and presentation.
        </P>
        <PyRunner
          code={py`
${SETUP}
df = pd.read_sql_query("""
    SELECT substr(p.date, 1, 7) AS month, a.product, SUM(p.amount) AS collected
    FROM payments p JOIN accounts a ON a.account_id = p.account_id
    GROUP BY month, a.product
""", con)
print(df.head())
print(df.pivot_table(index="month", columns="product", values="collected", fill_value=0))
`}
        />
        <H>Parameters work here too</H>
        <PyRunner
          code={py`
${SETUP}
city = "Pune"
df = pd.read_sql_query("SELECT account_id, balance, dpd FROM accounts WHERE city = ? ORDER BY dpd DESC", con, params=(city,))
print(df)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'sql-monthly-agent',
        title: 'Monthly collections by agent',
        prompt:
          'Write monthly_by_agent(con) that runs one SQL query (payments JOIN accounts, grouped by month = substr(date, 1, 7) and agent) and returns a pandas pivot table: one row per month (index), one column per agent, total collected in each cell (0 where none).',
        starter: py`
${SETUP}
def monthly_by_agent(con):
    return pd.DataFrame()

print(monthly_by_agent(con))
`,
        tests: [
          {
            name: 'pivot of month × agent totals',
            code: py`
import sqlite3, pandas as pd
c = sqlite3.connect(":memory:")
for t in ["accounts", "payments"]:
    pd.read_csv(f"data/{t}.csv").to_sql(t, c, index=False)
a = pd.read_csv("data/accounts.csv"); p = pd.read_csv("data/payments.csv")
j = p.merge(a, on="account_id"); j["month"] = j["date"].str[:7]
ref = j.pivot_table(index="month", columns="agent", values="amount", aggfunc="sum", fill_value=0)
got = monthly_by_agent(c)
assert list(got.index) == list(ref.index), f"index {list(got.index)}"
assert list(got.columns) == list(ref.columns), f"columns {list(got.columns)}"
assert (got.values == ref.values).all(), f"values differ:\n{got}"
`,
          },
          { name: 'uses SQL (read_sql_query)', code: py`assert "read_sql" in SOURCE, "use pd.read_sql_query"` },
        ],
        hint:
          'df = pd.read_sql_query("SELECT substr(p.date, 1, 7) AS month, a.agent, SUM(p.amount) AS collected FROM payments p JOIN accounts a ON a.account_id = p.account_id GROUP BY month, a.agent", con), then df.pivot_table(index="month", columns="agent", values="collected", fill_value=0).',
        solution: py`
${SETUP}
def monthly_by_agent(con):
    df = pd.read_sql_query("""
        SELECT substr(p.date, 1, 7) AS month, a.agent, SUM(p.amount) AS collected
        FROM payments p JOIN accounts a ON a.account_id = p.account_id
        GROUP BY month, a.agent
    """, con)
    return df.pivot_table(index="month", columns="agent", values="collected", aggfunc="sum", fill_value=0)

print(monthly_by_agent(con))
`,
      },
    ],
    quiz: [
      { q: 'What does pd.read_sql_query return?', options: ['A list of tuples', 'A DataFrame with the query\'s column names', 'A CSV file', 'A cursor'], answer: 1, why: 'It runs the query and builds a DataFrame from the result.' },
      { q: 'A good split between SQL and pandas?', options: ['Load whole tables into pandas, then filter', 'Filter and aggregate in SQL; reshape and present in pandas', 'Only ever use one', 'Use pandas to write to the database only'], answer: 1, why: 'Moving less data and letting each tool do what it is good at is faster and clearer.' },
    ],
  },
];

export const sqlCourse = {
  id: 'sql',
  title: 'SQL with Python',
  tagline: 'The skill analyst job postings ask for most, on a real database',
  blurb:
    'Write real SQL against a SQLite database of collections data: SELECT and GROUP BY, JOINs, safe parameters and transactions, CTEs and window functions, then hand results to pandas. Best after Python modules 1–4.',
  levels: 'Beginner → Advanced',
  icon: 'sql',
  usesPython: true,
  modules,
  lessons,
};
