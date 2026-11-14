// Step-by-step material for the SQL lessons: same shape as python-steps.js (terms, process, steps).
// `practice` is the code the practice box starts with, so the steps can go straight to the idea being taught.
// Attached to the lessons in content/ (see withGuide); checked by scripts/check-steps.mjs.

const ADD = 'Add this line under what you have, then press Run.';
const ADD_LINES = 'Add these lines under what you have, then press Run.';

const SQL = `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
for table in ["accounts", "payments", "dpd_history"]:
    pd.read_csv(f"data/{table}.csv").to_sql(table, con, index=False)
`;
const SQL_NOTE = 'The practice box already has the lines that create a database and load three tables into it. Leave them there. ';

export const sqlSteps = {
  'sql-tables': {
    terms: ['database', 'table', 'row', 'column', 'sql', 'primarykey', 'null'],
    process: {
      title: 'How data gets into a table',
      stages: [
        ['CREATE TABLE describes the shape', 'It names the table and each column, with the type of data each holds.'],
        ['The table starts empty', 'It has columns but no rows.'],
        ['INSERT adds one row', 'The values are listed in the same order as the columns.'],
        ['Rules are checked on every insert', 'A PRIMARY KEY must be unique; a NOT NULL column cannot be left empty. A row that breaks a rule is refused.'],
        ['SELECT reads rows back', 'The table itself is not changed by reading.'],
      ],
    },
    practice: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\n',
    steps: [
      { do: 'The practice box already has two lines that create an empty database called con. Under them, create a table.', code: 'con.execute("CREATE TABLE customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, balance INTEGER)")\nprint("table created")', see: 'table created' },
      { do: 'Add a row. ' + ADD_LINES, code: 'con.execute("INSERT INTO customers VALUES (\'C1\', \'Asha\', 25000)")\nprint(con.execute("SELECT * FROM customers").fetchall())', see: "[('C1', 'Asha', 25000)]: one row, as a tuple of three values." },
      { do: 'Add a second row with no balance. NULL means "no value". ' + ADD_LINES, code: 'con.execute("INSERT INTO customers VALUES (\'C2\', \'Ravi\', NULL)")\nprint(con.execute("SELECT * FROM customers").fetchall())', see: "Two rows. Ravi's balance shows as None, which is how Python displays NULL." },
      { do: 'Try to reuse an id. ' + ADD, code: 'con.execute("INSERT INTO customers VALUES (\'C1\', \'Meena\', 100)")', see: 'A red IntegrityError: UNIQUE constraint failed. The primary key stopped a duplicate.', error: true },
      { do: 'Delete that last line. Then count the rows.', code: 'print(con.execute("SELECT COUNT(*) FROM customers").fetchone()[0])', see: '2', replaceLast: true },
    ],
  },
  'sql-select': {
    terms: ['sql', 'query', 'table', 'row', 'column', 'filter'],
    process: {
      title: 'The order a query is carried out in',
      stages: [
        ['FROM: pick the table', 'The database starts with every row of the table you name.'],
        ['WHERE: keep some rows', 'Rows that fail the condition are dropped.'],
        ['SELECT: keep some columns', 'Only the columns you list are returned.'],
        ['ORDER BY: sort', 'The remaining rows are put in order.'],
        ['LIMIT: cut off', 'Only the first so-many rows are handed back.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, ask for two columns from the accounts table.', code: 'rows = con.execute("SELECT customer, balance FROM accounts").fetchall()\nprint(len(rows), rows[0])', see: "20 ('Asha', 37700): 20 rows, and the first one." },
      { do: 'Keep only some rows with WHERE. ' + ADD_LINES, code: 'rows = con.execute("SELECT customer, dpd FROM accounts WHERE dpd > 90").fetchall()\nprint(rows)', see: "[('Imran', 95), ('Kavya', 112), ('Yash', 130)]: the three accounts over 90 days." },
      { do: 'Sort the result. ' + ADD_LINES, code: 'rows = con.execute("SELECT customer, balance FROM accounts ORDER BY balance DESC LIMIT 3").fetchall()\nprint(rows)', see: "[('Nisha', 330000), ('Rohit', 268900), ('Yash', 145200)]" },
      { do: 'Combine conditions with AND. ' + ADD_LINES, code: 'rows = con.execute("SELECT customer FROM accounts WHERE city = \'Pune\' AND product = \'Card\'").fetchall()\nprint(rows)', see: "[('Asha',), ('Imran',)]" },
      { do: 'Make a typing mistake in a column name. ' + ADD, code: 'con.execute("SELECT custmer FROM accounts")', see: 'A red OperationalError: no such column: custmer. The database names the problem.', error: true },
    ],
  },
  'sql-group': {
    terms: ['aggregate', 'groupby', 'query', 'row', 'column', 'filter'],
    process: {
      title: 'How GROUP BY turns many rows into few',
      stages: [
        ['WHERE filters single rows first', 'Rows you do not want are removed before any grouping.'],
        ['GROUP BY makes piles', 'Rows with the same value (the same product, say) go into one pile.'],
        ['Aggregates run on each pile', 'COUNT, SUM, AVG, MIN and MAX each give one number per pile.'],
        ['HAVING filters the piles', 'It keeps only groups whose totals pass a test.'],
        ['One row per group comes back', 'With the group name and its numbers.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, count every row.', code: 'print(con.execute("SELECT COUNT(*), SUM(balance) FROM accounts").fetchone())', see: '(20, 1725900): the number of accounts and their total balance.' },
      { do: 'Get one row per product. ' + ADD_LINES, code: 'for row in con.execute("SELECT product, COUNT(*), SUM(balance) FROM accounts GROUP BY product"):\n    print(row)', see: "Three rows: ('Card', 7, 382700), ('Consumer durable', 6, 154500), ('Personal loan', 7, 1188700)." },
      { do: 'Keep only the large groups with HAVING. ' + ADD_LINES, code: 'q = "SELECT product, SUM(balance) FROM accounts GROUP BY product HAVING SUM(balance) > 300000"\nprint(con.execute(q).fetchall())', see: "[('Card', 382700), ('Personal loan', 1188700)]" },
      { do: 'Make buckets with CASE WHEN, then count them. ' + ADD_LINES, code: 'q = """\nSELECT CASE WHEN dpd = 0 THEN \'Current\' WHEN dpd <= 30 THEN \'1-30\' ELSE \'30+\' END AS bucket, COUNT(*)\nFROM accounts GROUP BY bucket\n"""\nprint(con.execute(q).fetchall())', see: "[('1-30', 5), ('30+', 11), ('Current', 4)]: three buckets with their counts." },
    ],
  },
  'sql-joins': {
    terms: ['join', 'merge', 'primarykey', 'null', 'table', 'row'],
    process: {
      title: 'How a JOIN matches rows',
      stages: [
        ['Start with the first table', 'Every row of the table after FROM.'],
        ['ON says how rows pair up', 'accounts.account_id = payments.account_id'],
        ['Each match makes one output row', 'It carries columns from both tables.'],
        ['INNER JOIN drops rows with no match', 'An account with no payments disappears.'],
        ['LEFT JOIN keeps them', 'The account stays, with NULL in the payment columns.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, join each payment to its account.', code: 'q = """\nSELECT a.customer, p.amount\nFROM payments p\nJOIN accounts a ON a.account_id = p.account_id\nLIMIT 2\n"""\nprint(con.execute(q).fetchall())', see: 'Two rows, each a customer name with a payment amount.' },
      { do: 'Total the payments per customer. ' + ADD_LINES, code: 'q = """\nSELECT a.customer, SUM(p.amount) AS paid\nFROM accounts a\nJOIN payments p ON p.account_id = a.account_id\nGROUP BY a.customer ORDER BY paid DESC LIMIT 2\n"""\nprint(con.execute(q).fetchall())', see: "[('Nisha', 75470), ('Rohit', 54330)]: the two customers who paid the most." },
      { do: 'Count accounts with an INNER JOIN and with a LEFT JOIN. ' + ADD_LINES, code: 'inner = con.execute("SELECT COUNT(DISTINCT a.account_id) FROM accounts a JOIN payments p ON p.account_id = a.account_id").fetchone()[0]\nleft = con.execute("SELECT COUNT(DISTINCT a.account_id) FROM accounts a LEFT JOIN payments p ON p.account_id = a.account_id").fetchone()[0]\nprint(inner, left)', see: '19 20. The LEFT JOIN keeps all 20 accounts; the INNER JOIN has 19, because one account with no payment was dropped.' },
      { do: 'List the accounts with no payment: keep the rows where the payment side is NULL. ' + ADD_LINES, code: 'q = """\nSELECT a.customer FROM accounts a\nLEFT JOIN payments p ON p.account_id = a.account_id\nWHERE p.payment_id IS NULL\n"""\nprint(con.execute(q).fetchall())', see: "[('Priya',)]: the one customer who has never paid." },
    ],
  },
  'sql-safe': {
    terms: ['query', 'injection', 'transaction', 'string', 'row'],
    process: {
      title: 'How a ? placeholder keeps a query safe',
      stages: [
        ['You write the query with ? where a value goes', 'SELECT … WHERE city = ?'],
        ['You pass the values separately', 'con.execute(sql, ("Pune",))'],
        ['The database fixes the query\'s shape first', 'It already knows which parts are commands.'],
        ['Then it drops the value in as plain data', 'Whatever the value contains, it can never become a command.'],
        ['Gluing text together skips this', 'A value like "x\' OR \'1\'=\'1" would then be read as part of the query: SQL injection.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, pass a value with a ? placeholder.', code: 'city = "Pune"\nrows = con.execute("SELECT customer FROM accounts WHERE city = ?", (city,)).fetchall()\nprint(len(rows))', see: '4 accounts in Pune.' },
      { do: 'See the danger of gluing text into a query. ' + ADD_LINES, code: 'bad = "nowhere\' OR \'1\'=\'1"\nrows = con.execute("SELECT customer FROM accounts WHERE city = \'" + bad + "\'").fetchall()\nprint(len(rows))', see: '20. A made-up "city" returned every account, because its text was read as part of the query.' },
      { do: 'Pass the same text safely. ' + ADD_LINES, code: 'rows = con.execute("SELECT customer FROM accounts WHERE city = ?", (bad,)).fetchall()\nprint(len(rows))', see: '0. As plain data it matches no city.' },
      { do: 'Change data, then undo it. ' + ADD_LINES, code: 'con.execute("UPDATE accounts SET balance = 0 WHERE city = ?", ("Pune",))\nprint(con.execute("SELECT SUM(balance) FROM accounts WHERE city = \'Pune\'").fetchone()[0])\ncon.rollback()\nprint(con.execute("SELECT SUM(balance) FROM accounts WHERE city = \'Pune\'").fetchone()[0])', see: '0, then the original total again. rollback() cancelled the change because it had not been committed.' },
    ],
  },
  'sql-window': {
    terms: ['window', 'aggregate', 'cte', 'query', 'row', 'groupby'],
    process: {
      title: 'How a window function differs from GROUP BY',
      stages: [
        ['GROUP BY squashes rows', 'Each group becomes a single row, so the detail is lost.'],
        ['A window function keeps every row', 'It adds a new value beside each one.'],
        ['PARTITION BY sets the group', 'The calculation restarts for each city, product or account.'],
        ['ORDER BY sets the order inside it', 'Needed for ranks, running totals and "previous row".'],
        ['The function runs over that window', 'ROW_NUMBER numbers the rows; SUM adds them up as it goes; LAG looks one row back.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, rank accounts by balance inside each city.', code: 'q = """\nSELECT city, customer, balance,\n       ROW_NUMBER() OVER (PARTITION BY city ORDER BY balance DESC) AS rank\nFROM accounts\nLIMIT 4\n"""\nfor row in con.execute(q):\n    print(row)', see: 'Four Delhi rows numbered 1 to 4, largest balance first.' },
      { do: 'Name a step with WITH, then keep only each city\'s top account. ' + ADD_LINES, code: 'q = """\nWITH ranked AS (\n    SELECT city, customer, ROW_NUMBER() OVER (PARTITION BY city ORDER BY balance DESC) AS rank\n    FROM accounts\n)\nSELECT city, customer FROM ranked WHERE rank = 1\n"""\nprint(con.execute(q).fetchall())', see: 'Five rows: the account with the largest balance in each city.' },
      { do: 'Keep a running total of one account\'s payments. ' + ADD_LINES, code: 'q = """\nSELECT date, amount, SUM(amount) OVER (ORDER BY date) AS running\nFROM payments WHERE account_id = \'A1019\'\n"""\nfor row in con.execute(q):\n    print(row)', see: 'One row per payment. The last column grows: each value is the amount plus everything before it.' },
    ],
  },
  'sql-pandas': {
    terms: ['sql', 'pandas', 'dataframe', 'query', 'aggregate'],
    process: {
      title: 'How SQL and pandas share the work',
      stages: [
        ['SQL does the heavy lifting in the database', 'Filter and summarise there, so only the rows you need travel to Python.'],
        ['read_sql_query runs the query', 'pd.read_sql_query(sql, con) sends it to the database.'],
        ['The result arrives as a DataFrame', 'Column names come from the query.'],
        ['pandas does the reshaping', 'Pivot, format, calculate ratios, or draw a chart.'],
      ],
    },
    practice: SQL,
    steps: [
      { do: SQL_NOTE + 'Under them, run a query straight into a table.', code: 'df = pd.read_sql_query("SELECT city, product, balance FROM accounts", con)\nprint(df.shape)', see: '(20, 3): a DataFrame with the three columns you asked for.' },
      { do: 'Let SQL do the summarising. ' + ADD_LINES, code: 'by_city = pd.read_sql_query("SELECT city, SUM(balance) AS total FROM accounts GROUP BY city", con)\nprint(by_city)', see: 'Five rows: one total per city.' },
      { do: 'Pass a value safely as a parameter. ' + ADD_LINES, code: 'late = pd.read_sql_query("SELECT customer, dpd FROM accounts WHERE dpd > ?", con, params=(90,))\nprint(len(late))', see: '3' },
      { do: 'Carry on in pandas: add a share column. ' + ADD_LINES, code: 'by_city["share"] = (by_city["total"] / by_city["total"].sum()).round(2)\nprint(by_city.sort_values("share", ascending=False).head(2))', see: 'Nashik and Pune, each holding 0.24 (about a quarter) of the total balance.' },
    ],
  },
};
