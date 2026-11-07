import { code } from './util';

// Every runnable example builds a small SQLite database in memory and prints results with show().
const SHOW = `def show(sql, params=()):
    cur = db.execute(sql, params)
    print(" | ".join(d[0] for d in cur.description))
    for row in cur.fetchall():
        print(" | ".join(str(v) for v in row))
    print()`;

const ex = (setup, body) => `import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
${setup}
""")
${SHOW}

${body}`;

const LIBRARY = code`
  CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, genre TEXT, year INTEGER, price REAL);
  INSERT INTO books VALUES
    (1, 'The Hobbit', 'Tolkien', 'Fantasy', 1937, 399),
    (2, 'Sapiens', 'Harari', 'History', 2011, 599),
    (3, 'Dune', 'Herbert', 'Sci-Fi', 1965, 450),
    (4, 'The Alchemist', 'Coelho', 'Fiction', 1988, 299),
    (5, 'Foundation', 'Asimov', 'Sci-Fi', 1951, 350),
    (6, 'Godan', 'Premchand', 'Fiction', 1936, 199),
    (7, 'Guns, Germs, and Steel', 'Diamond', 'History', 1997, 650);
`;

const SCHOOL = code`
  CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
  CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);
  CREATE TABLE enrolments (student_id INTEGER, course_id INTEGER, grade INTEGER);
  INSERT INTO students VALUES (1, 'Asha', 'Pune'), (2, 'Ravi', 'Delhi'), (3, 'Meera', 'Kochi'), (4, 'John', NULL);
  INSERT INTO courses VALUES (10, 'Maths'), (20, 'Biology'), (30, 'Art');
  INSERT INTO enrolments VALUES (1, 10, 91), (1, 20, 78), (2, 10, 64), (3, 20, 88), (3, 30, NULL);
`;

export const sqlKb = {
  intro: 'SQL from your first SELECT to query plans, data modelling and warehouses. Examples use books, schools, shops and flights, and every runnable one uses a real SQLite database in your browser.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'what-is-a-database',
      level: 'beginner',
      title: 'What a database is',
      summary: 'A relational database stores data in tables of rows and columns. SQL is the language you use to ask it questions.',
      body: [
        'Think of a database as a set of very strict spreadsheets. Each **table** holds one kind of thing (books, students, orders); each **row** is one record and each **column** one property with a fixed type. A **primary key** column gives every row a unique ID.',
        'SQL (Structured Query Language) is **declarative**: you describe the result you want and the database works out how to get it. The same basic SQL works in SQLite, PostgreSQL, MySQL, SQL Server, BigQuery and Snowflake. In these examples, `show()` is a small Python helper that runs a query and prints the result.',
      ],
      code: ex(LIBRARY, 'show("SELECT * FROM books")'),
      lang: 'python',
      run: true,
      points: ['Tables hold rows (records) and columns (fields).', 'A primary key uniquely identifies each row.', 'SQL describes what you want, not how to get it.'],
      realWorld: 'A library catalogue stores books, members and loans in separate tables linked by IDs.',
      check: { q: 'What is a primary key?', options: ['The first column', 'A column whose value is unique for every row', 'A password', 'The biggest number'], answer: 1, why: 'It identifies each row so other tables can refer to it.' },
      lesson: 'sql-tables',
    },
    {
      id: 'select-where',
      level: 'beginner',
      title: 'SELECT, WHERE, ORDER BY and LIMIT',
      summary: 'SELECT chooses columns, WHERE chooses rows, ORDER BY sorts and LIMIT keeps the first few.',
      body: [
        'A query reads almost like English: `SELECT title, price FROM books WHERE price < 400 ORDER BY price DESC LIMIT 3`. Text values go in single quotes. Combine conditions with `AND`, `OR`, `NOT`, and use `IN (...)`, `BETWEEN a AND b` and `LIKE \'%word%\'` (% means any characters).',
        'SQL keywords are not case-sensitive, but writing them in capitals makes queries easier to read. Ending a statement with `;` is standard.',
      ],
      code: ex(LIBRARY, code`
        show("SELECT title, price FROM books WHERE price < 400 ORDER BY price DESC")
        show("SELECT title, year FROM books WHERE genre IN ('Sci-Fi', 'Fantasy') AND year < 1960")
        show("SELECT title FROM books WHERE title LIKE '%the%' LIMIT 2")
      `),
      lang: 'python',
      run: true,
      points: ['SELECT columns FROM table WHERE condition.', 'ORDER BY col DESC for highest first.', 'LIKE with % for text patterns.'],
      realWorld: 'An online bookshop\'s "Sci-Fi under ₹400, newest first" filter is a single WHERE … ORDER BY query.',
      check: { q: 'Which clause filters rows?', options: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'], answer: 1, why: 'WHERE keeps only rows that match the condition.' },
      lesson: 'sql-select',
    },
    {
      id: 'aggregates',
      level: 'beginner',
      title: 'Counting and totals: COUNT, SUM, AVG, GROUP BY',
      summary: 'Aggregate functions boil many rows down to one number. GROUP BY gives one result per group.',
      body: [
        '`COUNT(*)`, `SUM(col)`, `AVG(col)`, `MIN(col)` and `MAX(col)` summarise rows. On their own they return one row for the whole table.',
        'Add `GROUP BY genre` to get one row per genre. Every column in SELECT must either be in the GROUP BY or inside an aggregate function. Use `AS` to give results friendly names.',
      ],
      code: ex(LIBRARY, code`
        show("SELECT COUNT(*) AS books, ROUND(AVG(price), 1) AS avg_price FROM books")
        show("SELECT genre, COUNT(*) AS books, MAX(price) AS dearest FROM books GROUP BY genre ORDER BY books DESC")
      `),
      lang: 'python',
      run: true,
      points: ['Aggregates turn many rows into one value.', 'GROUP BY gives one row per group.', 'Name results with AS.'],
      realWorld: 'A cinema chain counts tickets sold per film per day with COUNT and GROUP BY.',
      check: { q: 'SELECT genre, COUNT(*) FROM books GROUP BY genre returns…', options: ['One row', 'One row per genre', 'One row per book', 'An error'], answer: 1, why: 'GROUP BY produces one row for each distinct genre.' },
      lesson: 'sql-group',
    },
    {
      id: 'having-distinct',
      level: 'beginner',
      title: 'HAVING, DISTINCT and aliases',
      summary: 'WHERE filters rows before grouping; HAVING filters groups after. DISTINCT removes duplicates.',
      body: [
        'The database processes a query in this order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. That is why you cannot use an aggregate in WHERE: groups do not exist yet. Use `HAVING COUNT(*) > 1` instead.',
        '`SELECT DISTINCT genre` lists each value once. Table aliases (`FROM books AS b`) shorten long queries.',
      ],
      code: ex(LIBRARY, code`
        show("SELECT DISTINCT genre FROM books ORDER BY genre")
        show("""
        SELECT b.genre, COUNT(*) AS n, AVG(b.price) AS avg_price
        FROM books AS b
        WHERE b.year > 1900
        GROUP BY b.genre
        HAVING COUNT(*) >= 2
        """)
      `),
      lang: 'python',
      run: true,
      points: ['WHERE = rows before grouping; HAVING = groups after.', 'Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.', 'DISTINCT removes duplicate rows.'],
      realWorld: 'A fraud team finds cards used in 3 or more cities in one day with GROUP BY card HAVING COUNT(DISTINCT city) >= 3.',
      check: { q: 'To keep only genres with more than 2 books you use…', options: ['WHERE COUNT(*) > 2', 'HAVING COUNT(*) > 2', 'LIMIT 2', 'DISTINCT'], answer: 1, why: 'Conditions on aggregates go in HAVING.' },
      lesson: 'sql-group',
    },
    {
      id: 'changing-data',
      level: 'beginner',
      title: 'Changing data: INSERT, UPDATE, DELETE',
      summary: 'INSERT adds rows, UPDATE changes them and DELETE removes them. Always use a WHERE clause with UPDATE and DELETE.',
      body: [
        '`INSERT INTO table (cols) VALUES (...)` adds a row. `UPDATE table SET col = value WHERE ...` changes matching rows, and `DELETE FROM table WHERE ...` removes them. Without WHERE, every row is changed or deleted.',
        'A good habit: run the same WHERE as a SELECT first to see which rows will be affected.',
      ],
      code: ex(LIBRARY, code`
        db.execute("INSERT INTO books (title, author, genre, year, price) VALUES ('Malgudi Days', 'Narayan', 'Fiction', 1943, 249)")
        show("SELECT title, price FROM books WHERE genre = 'Sci-Fi'")     # check first
        db.execute("UPDATE books SET price = price * 0.9 WHERE genre = 'Sci-Fi'")
        db.execute("DELETE FROM books WHERE year < 1937")
        db.commit()
        show("SELECT id, title, genre, price FROM books")
      `),
      lang: 'python',
      run: true,
      points: ['INSERT adds, UPDATE changes, DELETE removes.', 'Always include WHERE on UPDATE and DELETE.', 'SELECT with the same WHERE first.'],
      realWorld: 'A store applies a 10% festival discount to one category with a single UPDATE … WHERE.',
      check: { q: 'What does DELETE FROM books; (no WHERE) do?', options: ['Nothing', 'Deletes the table definition', 'Deletes every row', 'Deletes one row'], answer: 2, why: 'Without WHERE the condition matches all rows.' },
      lesson: 'sql-safe',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'joins',
      level: 'intermediate',
      title: 'JOINs: combining tables',
      summary: 'Data is split into tables to avoid repetition. JOIN brings it back together on matching keys.',
      body: [
        '`INNER JOIN` keeps rows that match in both tables. `LEFT JOIN` keeps every row of the left table, with NULLs where nothing matched, which is perfect for "who has no orders?". (RIGHT and FULL OUTER joins exist in most databases too.)',
        'Joins can chain: students → enrolments → courses. Always join on keys, and watch row counts: joining to a table with several matches per key multiplies rows.',
      ],
      code: ex(SCHOOL, code`
        show("""
        SELECT s.name, c.title, e.grade
        FROM enrolments e
        JOIN students s ON s.id = e.student_id
        JOIN courses c ON c.id = e.course_id
        ORDER BY s.name
        """)
        show("""
        SELECT s.name, COUNT(e.course_id) AS courses
        FROM students s LEFT JOIN enrolments e ON e.student_id = s.id
        GROUP BY s.name
        """)
      `),
      lang: 'python',
      run: true,
      points: ['INNER JOIN = matches only.', 'LEFT JOIN keeps all left rows; missing matches are NULL.', 'Check row counts after joining.'],
      realWorld: 'A university joins students, enrolments and courses to print each student\'s timetable.',
      check: { q: 'To list all students, including those with no enrolments, use…', options: ['INNER JOIN', 'LEFT JOIN from students', 'WHERE', 'UNION'], answer: 1, why: 'LEFT JOIN keeps every student even without matches.' },
      lesson: 'sql-joins',
    },
    {
      id: 'nulls',
      level: 'intermediate',
      title: 'NULL: the value that means "unknown"',
      summary: 'NULL is not zero or empty text; it means unknown. Compare with IS NULL, and replace it with COALESCE.',
      body: [
        'Any comparison with NULL gives NULL (unknown), not True, so `WHERE city = NULL` matches nothing. Use `IS NULL` / `IS NOT NULL`. This is called three-valued logic.',
        '`COALESCE(a, b, ...)` returns the first non-NULL value, which is handy for defaults. Aggregates like AVG ignore NULLs, but `COUNT(*)` counts rows while `COUNT(col)` counts non-NULL values.',
      ],
      code: ex(SCHOOL, code`
        show("SELECT name FROM students WHERE city = NULL")       # no rows!
        show("SELECT name, COALESCE(city, 'Unknown') AS city FROM students WHERE city IS NULL")
        show("SELECT COUNT(*) AS rows, COUNT(grade) AS graded, AVG(grade) AS avg FROM enrolments")
      `),
      lang: 'python',
      run: true,
      points: ['= NULL never matches; use IS NULL.', 'COALESCE supplies a default.', 'COUNT(*) vs COUNT(col) differ when NULLs exist.'],
      realWorld: 'A hospital report counts patients with a recorded blood group using COUNT(blood_group), not COUNT(*).',
      check: { q: 'What does NULL = NULL evaluate to?', options: ['TRUE', 'FALSE', 'NULL (unknown)', 'An error'], answer: 2, why: 'Two unknowns are not known to be equal.' },
      lesson: 'sql-joins',
    },
    {
      id: 'ctes',
      level: 'intermediate',
      title: 'Subqueries and CTEs (WITH)',
      summary: 'A query can use the result of another query. WITH gives those inner queries names so complex logic reads step by step.',
      body: [
        'A **subquery** is a query in brackets inside another, for example `WHERE price > (SELECT AVG(price) FROM books)`. A **CTE** (Common Table Expression) writes the same idea up front: `WITH avg_price AS (...) SELECT ...`.',
        'CTEs make long analyses readable: each step is a named, testable block, and later steps can refer to earlier ones.',
      ],
      code: ex(LIBRARY, code`
        show("SELECT title, price FROM books WHERE price > (SELECT AVG(price) FROM books)")
        show("""
        WITH by_genre AS (
            SELECT genre, AVG(price) AS avg_price FROM books GROUP BY genre
        )
        SELECT b.title, b.genre, b.price, ROUND(g.avg_price) AS genre_avg
        FROM books b JOIN by_genre g ON g.genre = b.genre
        WHERE b.price > g.avg_price
        """)
      `),
      lang: 'python',
      run: true,
      points: ['Subqueries nest a query in brackets.', 'WITH names steps like variables.', 'CTEs make long queries readable and debuggable.'],
      realWorld: 'Marketing teams build customer segments in a chain of CTEs: active users → their spend → spend bands.',
      check: { q: 'What does WITH x AS (…) create?', options: ['A permanent table', 'A named temporary result used by the query', 'An index', 'A backup'], answer: 1, why: 'A CTE exists only for that query.' },
      lesson: 'sql-window',
    },
    {
      id: 'case-dates',
      level: 'intermediate',
      title: 'CASE expressions and dates',
      summary: 'CASE adds if/else logic inside a query. Date functions extract parts of dates and calculate differences.',
      body: [
        '`CASE WHEN cond THEN x WHEN ... ELSE y END` creates labels or buckets in SELECT, and can sit inside SUM to count conditionally (a "pivot" in plain SQL).',
        'Date functions differ between databases. SQLite uses `date()`, `strftime(\'%Y-%m\', d)` and `julianday()`; PostgreSQL uses `EXTRACT`, `date_trunc` and interval maths. Store dates in ISO format (YYYY-MM-DD) so they sort correctly.',
      ],
      code: ex(code`
        CREATE TABLE flights (code TEXT, dep TEXT, delay_min INTEGER);
        INSERT INTO flights VALUES ('AI101', '2026-05-01', 0), ('6E202', '2026-05-01', 45),
          ('UK303', '2026-05-15', 12), ('AI101', '2026-06-02', 95), ('6E202', '2026-06-20', 5);
      `, code`
        show("""
        SELECT code, dep, delay_min,
          CASE WHEN delay_min = 0 THEN 'On time'
               WHEN delay_min <= 15 THEN 'Minor'
               ELSE 'Delayed' END AS status
        FROM flights
        """)
        show("""
        SELECT strftime('%Y-%m', dep) AS month,
               COUNT(*) AS flights,
               SUM(CASE WHEN delay_min > 15 THEN 1 ELSE 0 END) AS delayed,
               CAST(julianday('2026-07-01') - julianday(MAX(dep)) AS INTEGER) AS days_since_last
        FROM flights GROUP BY month
        """)
      `),
      lang: 'python',
      run: true,
      points: ['CASE WHEN … THEN … ELSE … END.', 'SUM(CASE …) counts conditionally.', 'Date functions vary by database; store ISO dates.'],
      realWorld: 'Airlines report on-time performance by month with CASE buckets on delay minutes.',
      check: { q: 'SUM(CASE WHEN delay > 15 THEN 1 ELSE 0 END) gives…', options: ['Total delay minutes', 'The number of delayed flights', 'The average delay', 'An error'], answer: 1, why: 'Each delayed row adds 1.' },
    },
    {
      id: 'constraints',
      level: 'intermediate',
      title: 'Keys, constraints and good table design',
      summary: 'Constraints make the database reject bad data. Normalisation stores each fact once so it cannot contradict itself.',
      body: [
        'Constraints are rules: `PRIMARY KEY` (unique ID), `NOT NULL`, `UNIQUE`, `CHECK (price >= 0)` and `FOREIGN KEY ... REFERENCES` (the value must exist in another table). The database then refuses invalid writes, whatever app sends them.',
        '**Normalisation** means splitting data so each fact lives in one place: customer address in a customers table, not copied onto every order. Then an update happens once and cannot go out of sync.',
      ],
      code: ex(code`
        PRAGMA foreign_keys = ON;
        CREATE TABLE customers (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE);
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY,
          customer_id INTEGER NOT NULL REFERENCES customers(id),
          amount REAL CHECK (amount > 0)
        );
        INSERT INTO customers VALUES (1, 'asha@example.com');
      `, code`
        tests = [
            "INSERT INTO orders VALUES (1, 1, 499)",
            "INSERT INTO orders VALUES (2, 99, 120)",
            "INSERT INTO orders VALUES (3, 1, -5)",
            "INSERT INTO customers VALUES (2, 'asha@example.com')",
        ]
        for sql in tests:
            try:
                db.execute(sql)
                print("OK      ", sql)
            except sqlite3.IntegrityError as e:
                print("REJECTED", sql, "->", e)
      `),
      lang: 'python',
      run: true,
      points: ['Constraints enforce rules at the database level.', 'Foreign keys prevent orphan records.', 'Normalise: store each fact once.'],
      realWorld: 'A payments database rejects a refund pointing at a non-existent transaction thanks to a foreign key.',
      check: { q: 'A FOREIGN KEY on orders.customer_id ensures…', options: ['Orders are sorted', 'Every order points at a customer that exists', 'Emails are unique', 'Amounts are positive'], answer: 1, why: 'It references a row that must exist in customers.' },
      lesson: 'sql-tables',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'window-functions',
      level: 'advanced',
      title: 'Window functions',
      summary: 'Window functions calculate across related rows without collapsing them: rankings, running totals and comparisons with the previous row.',
      body: [
        'The `OVER (...)` clause defines the window: `PARTITION BY` splits into groups and `ORDER BY` sets the order inside each. `ROW_NUMBER()`, `RANK()` and `DENSE_RANK()` number rows; `SUM(x) OVER (ORDER BY d)` gives a running total; `LAG(x)` and `LEAD(x)` read the previous or next row.',
        'Unlike GROUP BY, every original row stays. A classic use: "top 2 per group" by ranking in a CTE, then filtering `WHERE rank <= 2`.',
      ],
      code: ex(code`
        CREATE TABLE sales (store TEXT, month TEXT, revenue INTEGER);
        INSERT INTO sales VALUES ('Pune','2026-01',120),('Pune','2026-02',150),('Pune','2026-03',140),
          ('Goa','2026-01',90),('Goa','2026-02',95),('Goa','2026-03',130);
      `, code`
        show("""
        SELECT store, month, revenue,
          SUM(revenue) OVER (PARTITION BY store ORDER BY month) AS running_total,
          revenue - LAG(revenue) OVER (PARTITION BY store ORDER BY month) AS change,
          RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS rank_in_month
        FROM sales ORDER BY store, month
        """)
      `),
      lang: 'python',
      run: true,
      points: ['OVER (PARTITION BY … ORDER BY …) defines the window.', 'Rows are kept, unlike GROUP BY.', 'LAG/LEAD compare with neighbouring rows.'],
      realWorld: 'Streaming platforms rank the top 10 songs per country per day with ROW_NUMBER() OVER (PARTITION BY country …).',
      check: { q: 'Which keeps every row while adding a per-group total?', options: ['GROUP BY', 'SUM() OVER (PARTITION BY …)', 'DISTINCT', 'HAVING'], answer: 1, why: 'Window functions add values without collapsing rows.' },
      lesson: 'sql-window',
    },
    {
      id: 'indexes',
      level: 'advanced',
      title: 'Indexes and query plans',
      summary: 'An index is like a book\'s index: it lets the database jump to matching rows instead of reading the whole table. EXPLAIN shows which one it uses.',
      body: [
        'Without an index, `WHERE email = ...` must **scan** every row. With an index on email, the database **searches** a sorted tree (a B-tree) in a few steps. Indexes speed up WHERE, JOIN and ORDER BY on those columns.',
        'They are not free: every INSERT and UPDATE must update the index too, and they take space. Index columns you filter and join on often. `EXPLAIN QUERY PLAN` (SQLite) or `EXPLAIN ANALYZE` (PostgreSQL) shows the plan.',
      ],
      code: code`
        import sqlite3, time
        db = sqlite3.connect(":memory:")
        db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, city TEXT)")
        db.executemany("INSERT INTO users (email, city) VALUES (?, ?)",
                       ((f"user{i}@mail.com", f"city{i % 500}") for i in range(200_000)))

        def timed(sql):
            start = time.perf_counter()
            db.execute(sql).fetchall()
            plan = db.execute("EXPLAIN QUERY PLAN " + sql).fetchall()[0][-1]
            print(f"{(time.perf_counter() - start) * 1000:7.2f} ms  {plan}")

        q = "SELECT * FROM users WHERE email = 'user199999@mail.com'"
        timed(q)
        db.execute("CREATE INDEX idx_users_email ON users(email)")
        timed(q)
      `,
      lang: 'python',
      run: true,
      points: ['Indexes turn full scans into quick searches.', 'They slow down writes and use space.', 'Read the query plan before and after.'],
      realWorld: 'A login page that took 2 seconds on 50 million users became instant after indexing the email column.',
      check: { q: 'A downside of adding many indexes is…', options: ['Slower reads', 'Slower inserts and updates, and more storage', 'Data loss', 'Wrong results'], answer: 1, why: 'Each write must maintain every index.' },
    },
    {
      id: 'transactions',
      level: 'advanced',
      title: 'Transactions and ACID',
      summary: 'A transaction groups changes so they all happen or none do. ACID is the set of guarantees that keeps data correct.',
      body: [
        '**A**tomicity (all or nothing), **C**onsistency (rules stay true), **I**solation (concurrent transactions do not see each other\'s half-done work) and **D**urability (committed data survives a crash).',
        'Use `BEGIN`, then `COMMIT` to save or `ROLLBACK` to undo. In Python\'s sqlite3, `with db:` commits on success and rolls back on an exception: exactly what a money transfer needs.',
      ],
      code: ex(code`
        CREATE TABLE wallets (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0));
        INSERT INTO wallets VALUES ('Asha', 500), ('Ravi', 100);
      `, code`
        def transfer(src, dst, amount):
            try:
                with db:   # one transaction
                    db.execute("UPDATE wallets SET balance = balance + ? WHERE name = ?", (amount, dst))
                    db.execute("UPDATE wallets SET balance = balance - ? WHERE name = ?", (amount, src))
                print(f"Sent {amount} from {src} to {dst}")
            except sqlite3.IntegrityError:
                print(f"Transfer of {amount} failed and was rolled back")

        transfer("Asha", "Ravi", 200)
        transfer("Ravi", "Asha", 1000)    # would make Ravi negative
        show("SELECT * FROM wallets")
      `),
      lang: 'python',
      run: true,
      points: ['Transactions are all-or-nothing.', 'ACID: atomic, consistent, isolated, durable.', 'with db: commits or rolls back for you.'],
      realWorld: 'UPI payments debit one account and credit another inside a transaction so money is never lost or duplicated.',
      check: { q: 'The credit succeeded but the debit failed. With a transaction…', options: ['Both changes stay', 'The credit is rolled back too', 'Only the debit is retried', 'The database crashes'], answer: 1, why: 'Atomicity: all or nothing.' },
      lesson: 'sql-safe',
    },
    {
      id: 'recursive',
      level: 'advanced',
      title: 'Recursive queries for hierarchies',
      summary: 'A recursive CTE walks tree-shaped data like org charts, folder trees or category paths.',
      body: [
        'A recursive CTE has two parts joined by `UNION ALL`: a **starting** query (the root) and a **recursive** query that joins the CTE to the table to find the next level. It repeats until no new rows appear.',
        'Track depth or path as you go to indent or show breadcrumbs, and add a depth limit to protect against cycles in bad data.',
      ],
      code: ex(code`
        CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
        INSERT INTO staff VALUES (1,'CEO Nisha',NULL),(2,'CTO Arun',1),(3,'CFO Leela',1),
          (4,'Dev lead Sam',2),(5,'Developer Zoya',4),(6,'Accountant Imran',3);
      `, code`
        show("""
        WITH RECURSIVE chart(id, name, depth, path) AS (
            SELECT id, name, 0, name FROM staff WHERE manager_id IS NULL
            UNION ALL
            SELECT s.id, s.name, c.depth + 1, c.path || ' > ' || s.name
            FROM staff s JOIN chart c ON s.manager_id = c.id
            WHERE c.depth < 10
        )
        SELECT substr('            ', 1, depth * 3) || name AS org_chart, path FROM chart ORDER BY path
        """)
      `),
      lang: 'python',
      run: true,
      points: ['Anchor query + UNION ALL + recursive query.', 'Carry depth and path along.', 'Limit depth to guard against cycles.'],
      realWorld: 'E-commerce sites build category breadcrumbs (Home > Electronics > Phones) with recursive queries.',
      check: { q: 'What stops a recursive CTE?', options: ['A timer', 'The recursive step returns no new rows (or a limit is reached)', 'ORDER BY', 'It never stops'], answer: 1, why: 'Recursion ends when a level adds nothing.' },
    },
    {
      id: 'views-injection',
      level: 'advanced',
      title: 'Views, parameters and SQL injection',
      summary: 'Views save a query under a name. Parameters keep user input separate from SQL, which blocks SQL injection, one of the most common security holes.',
      body: [
        'A **view** (`CREATE VIEW top_books AS SELECT ...`) behaves like a read-only table that always reflects current data, which is good for sharing standard definitions like "active customer".',
        'Never build SQL by pasting user text into a string. An input like `x\' OR \'1\'=\'1` changes the query\'s meaning. **Parameters** (`?` or `%s` placeholders) send values separately, so they can never become SQL.',
      ],
      code: ex(code`
        CREATE TABLE accounts (user TEXT, secret TEXT);
        INSERT INTO accounts VALUES ('asha', 'a-123'), ('ravi', 'r-456');
        CREATE VIEW public_users AS SELECT user FROM accounts;
      `, code`
        evil = "nobody' OR '1'='1"
        unsafe = f"SELECT * FROM accounts WHERE user = '{evil}'"
        print("UNSAFE returns:", db.execute(unsafe).fetchall())             # leaks everything!
        print("SAFE returns:  ", db.execute("SELECT * FROM accounts WHERE user = ?", (evil,)).fetchall())
        show("SELECT * FROM public_users")
      `),
      lang: 'python',
      run: true,
      points: ['Views name and share standard queries.', 'Never format user input into SQL strings.', 'Always use parameters (? / %s / :name).'],
      realWorld: 'Many real data breaches came from SQL injection in login and search forms; parameterised queries prevent it.',
      check: { q: 'What prevents SQL injection?', options: ['Using capital letters', 'Parameterised queries', 'Longer passwords', 'Views'], answer: 1, why: 'Parameters are never parsed as SQL.' },
      lesson: 'sql-safe',
    },
    // ------------------------------------------------------------ expert
    {
      id: 'optimisation',
      level: 'expert',
      title: 'Query optimisation',
      summary: 'Fast queries read less data. Filter early, keep conditions index-friendly (sargable), select only needed columns, and verify with the query plan.',
      body: [
        'A condition is **sargable** when it can use an index: `WHERE created >= \'2026-01-01\'` is; `WHERE strftime(\'%Y\', created) = \'2026\'` is not, because it wraps the column in a function. Leading wildcards (`LIKE \'%x\'`) also prevent index use.',
        'Other habits: avoid `SELECT *` on wide tables, use composite indexes in the order of your filters (equality columns first), replace correlated subqueries with joins or window functions, and check `EXPLAIN ANALYZE` for estimated vs actual rows. Keep table statistics fresh (`ANALYZE`).',
      ],
      code: code`
        import sqlite3
        db = sqlite3.connect(":memory:")
        db.execute("CREATE TABLE events (id INTEGER PRIMARY KEY, created TEXT, kind TEXT)")
        db.execute("CREATE INDEX idx_created ON events(created)")

        for sql in [
            "SELECT id FROM events WHERE strftime('%Y', created) = '2026'",
            "SELECT id FROM events WHERE created >= '2026-01-01' AND created < '2027-01-01'",
        ]:
            plan = db.execute("EXPLAIN QUERY PLAN " + sql).fetchall()[0][-1]
            print(plan, "<-", sql[30:])
      `,
      lang: 'python',
      run: true,
      points: ['Do not wrap indexed columns in functions.', 'Filter early and select only needed columns.', 'Compare plans before and after each change.'],
      realWorld: 'Rewriting one dashboard query to be sargable cut a retailer\'s database CPU by half.',
      check: { q: 'Which WHERE clause can use an index on created?', options: ["strftime('%Y', created) = '2026'", "created >= '2026-01-01'", "created LIKE '%2026'", 'None'], answer: 1, why: 'The column is compared directly, so the index range can be searched.' },
    },
    {
      id: 'modelling',
      level: 'expert',
      title: 'Data modelling for analytics: star schemas',
      summary: 'Analytics warehouses use fact tables (events with numbers) surrounded by dimension tables (who, what, where, when).',
      body: [
        'A **fact table** has one row per event, such as a sale, with numeric measures and foreign keys. **Dimension tables** describe those keys: product, store, customer, date. Drawn out, it looks like a star. Queries join facts to a few dimensions and aggregate.',
        'Dimensions change over time; **slowly changing dimensions (SCD type 2)** keep history by adding a new row with valid_from/valid_to dates, so last year\'s sales stay assigned to last year\'s region. Tools like dbt manage these models as version-controlled SQL.',
      ],
      code: code`
        -- Star schema for a supermarket chain
        CREATE TABLE dim_date    (date_key INT PRIMARY KEY, date DATE, month TEXT, is_weekend BOOLEAN);
        CREATE TABLE dim_store   (store_key INT PRIMARY KEY, name TEXT, city TEXT, region TEXT,
                                  valid_from DATE, valid_to DATE);            -- SCD type 2
        CREATE TABLE dim_product (product_key INT PRIMARY KEY, name TEXT, category TEXT);
        CREATE TABLE fact_sales  (date_key INT, store_key INT, product_key INT,
                                  units INT, revenue NUMERIC);

        -- Typical question: weekend revenue by region and category
        SELECT s.region, p.category, SUM(f.revenue) AS revenue
        FROM fact_sales f
        JOIN dim_date d    ON d.date_key = f.date_key
        JOIN dim_store s   ON s.store_key = f.store_key
        JOIN dim_product p ON p.product_key = f.product_key
        WHERE d.is_weekend
        GROUP BY s.region, p.category;
      `,
      lang: 'sql',
      points: ['Facts = events and measures; dimensions = context.', 'SCD type 2 keeps history with validity dates.', 'Model with version-controlled SQL (e.g. dbt).'],
      realWorld: 'Supermarket chains answer "weekend snack sales by region" in seconds from star schemas with billions of fact rows.',
      check: { q: 'In a star schema, revenue per sale belongs in…', options: ['A dimension table', 'The fact table', 'An index', 'A view only'], answer: 1, why: 'Measures of events live in facts.' },
    },
    {
      id: 'isolation',
      level: 'expert',
      title: 'Concurrency and isolation levels',
      summary: 'When many users write at once, isolation levels trade safety for speed. Know the anomalies and pick the right level or locking strategy.',
      body: [
        'Anomalies: a **dirty read** sees uncommitted data; a **non-repeatable read** gets different values when reading twice; a **phantom** sees new rows appear; a **lost update** happens when two transactions read and write the same row and one overwrites the other.',
        'SQL standard levels: READ UNCOMMITTED, READ COMMITTED (PostgreSQL\'s default), REPEATABLE READ (MySQL InnoDB\'s default) and SERIALIZABLE. To prevent lost updates, lock rows with `SELECT ... FOR UPDATE`, use atomic updates (`SET stock = stock - 1 WHERE stock > 0`), or optimistic locking with a version column.',
      ],
      code: code`
        -- PostgreSQL: sell the last ticket safely
        BEGIN;
        SELECT seats_left FROM shows WHERE id = 42 FOR UPDATE;   -- locks the row
        UPDATE shows SET seats_left = seats_left - 1 WHERE id = 42 AND seats_left > 0;
        COMMIT;

        -- Optimistic locking: fails if someone else changed the row first
        UPDATE profiles SET bio = 'New bio', version = version + 1
        WHERE id = 7 AND version = 3;       -- 0 rows updated => retry

        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;   -- strongest; retry on serialization failure
      `,
      lang: 'sql',
      points: ['Know dirty reads, non-repeatable reads, phantoms and lost updates.', 'Atomic conditional updates avoid many races.', 'SERIALIZABLE is safest; apps must retry on conflicts.'],
      realWorld: 'Concert ticketing systems use row locks or atomic updates so two fans can never buy the same last seat.',
      check: { q: 'Two clerks read stock = 5 and both write stock = 4 after selling one item each. This is a…', options: ['Phantom read', 'Lost update', 'Dirty read', 'Deadlock'], answer: 1, why: 'One sale overwrote the other.' },
    },
    {
      id: 'dialects-json',
      level: 'expert',
      title: 'SQL dialects, JSON and semi-structured data',
      summary: 'Core SQL is shared, but every database has its own functions. Modern databases also query JSON directly.',
      body: [
        'Differences to watch: limiting rows (`LIMIT` vs `TOP` vs `FETCH FIRST`), string concatenation (`||` vs `CONCAT`), date functions, auto-increment IDs, and quoting identifiers. Warehouses add features like `QUALIFY` (filter on window functions in BigQuery and Snowflake) and arrays/structs.',
        'JSON columns hold flexible data like API payloads. SQLite has `json_extract` and `->>`; PostgreSQL has `jsonb` with `->`, `->>` and indexes; BigQuery has `JSON_VALUE`. Pull frequently-queried fields into real columns for speed.',
      ],
      code: ex(code`
        CREATE TABLE events (id INTEGER, payload TEXT);
        INSERT INTO events VALUES
          (1, '{"user": "asha", "device": {"os": "Android"}, "items": [3, 5]}'),
          (2, '{"user": "ravi", "device": {"os": "iOS"}, "items": [1]}');
      `, code`
        show("""
        SELECT id,
               json_extract(payload, '$.user') AS user,
               payload ->> '$.device.os' AS os,
               json_array_length(payload, '$.items') AS n_items
        FROM events
        """)
      `),
      lang: 'python',
      run: true,
      points: ['Learn your database\'s dialect for dates, limits and strings.', 'Warehouses add QUALIFY, arrays and structs.', 'JSON functions query semi-structured data.'],
      realWorld: 'Mobile analytics teams store raw app events as JSON and extract device and screen fields with SQL.',
      check: { q: 'Which is NOT standard across all SQL databases?', options: ['SELECT', 'WHERE', 'Date functions such as strftime / date_trunc', 'JOIN'], answer: 2, why: 'Date functions differ a lot between dialects.' },
    },
    {
      id: 'scaling',
      level: 'expert',
      title: 'OLTP vs OLAP, replication, partitioning and sharding',
      summary: 'Apps and analytics need different databases. At scale, data is copied (replication), split by range (partitioning) or spread across servers (sharding).',
      body: [
        '**OLTP** databases (PostgreSQL, MySQL) handle many small, fast reads and writes for apps, stored row by row. **OLAP** warehouses (BigQuery, Snowflake, Redshift, ClickHouse) scan billions of rows for analytics, stored column by column. Data flows from one to the other through ETL/ELT pipelines.',
        '**Replication** keeps copies for safety and read scaling. **Partitioning** splits a big table (for example by month) so queries skip irrelevant parts. **Sharding** spreads rows across servers by a key such as user_id; it scales writes but makes cross-shard joins hard.',
      ],
      code: code`
        -- PostgreSQL declarative partitioning by month
        CREATE TABLE page_views (
          viewed_at TIMESTAMPTZ NOT NULL,
          user_id BIGINT,
          url TEXT
        ) PARTITION BY RANGE (viewed_at);

        CREATE TABLE page_views_2026_06 PARTITION OF page_views
          FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

        -- Only the June partition is scanned:
        SELECT url, COUNT(*) FROM page_views
        WHERE viewed_at >= '2026-06-10' AND viewed_at < '2026-06-11'
        GROUP BY url;
      `,
      lang: 'sql',
      points: ['OLTP = app transactions (rows); OLAP = analytics (columns).', 'Partition big tables by time to prune scans.', 'Shard only when one server cannot keep up.'],
      realWorld: 'Social networks shard user data across thousands of database servers by user ID.',
      check: { q: 'A warehouse that scans billions of rows for reports is…', options: ['OLTP', 'OLAP', 'A cache', 'A message queue'], answer: 1, why: 'OLAP systems are built for large analytical scans.' },
    },
  ],
};
