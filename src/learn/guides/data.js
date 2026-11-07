// Beginner guides for the pandas, SQL and Matplotlib lessons (same shape as guides/python.js).

export const pandasGuide = {
  'pd-excel': {
    idea: 'Everything you do in Excel has a pandas equivalent, written once as code and repeated perfectly every month.',
    terms: ['pandas', 'dataframe', 'groupby', 'merge', 'pivot'],
    mistakes: [
      ['Trying to "click" through data cell by cell', 'pandas works on whole columns at once: df["balance"] * 2 doubles every row.'],
      ['Expecting changes to save back to the file', 'pandas works on a copy in memory. Write it out with df.to_csv(…) or df.to_excel(…).'],
    ],
    faq: [
      ['Do I still need Excel?', 'Excel is great for looking at data and sharing it. pandas is better for repeating the same steps reliably and for files too big for a spreadsheet.'],
      ['Is pandas hard if I know Excel well?', 'No. The ideas are the same (filter, sort, SUMIF, VLOOKUP, pivot). You are learning new words for things you already do.'],
    ],
    recap: ['A DataFrame is a sheet; a column is a Series.', 'Filter = boolean mask, SUMIF = groupby, VLOOKUP = merge, pivot = pivot_table.', 'Code makes the monthly report repeatable.'],
  },
  'np-arrays': {
    idea: 'NumPy does maths on a whole list of numbers in one step, which is both shorter to write and much faster than a loop.',
    terms: ['numpy', 'vectorised', 'dtype'],
    mistakes: [
      ['Using a Python list for maths: [1, 2] * 2', 'That repeats the list. np.array([1, 2]) * 2 gives array([2, 4]).'],
      ['Mixing up axis=0 and axis=1', 'axis=0 goes down the rows (one result per column); axis=1 goes across (one result per row).'],
    ],
    faq: [
      ['Why learn NumPy if I want pandas?', 'pandas is built on NumPy. Columns behave like NumPy arrays, so the same vectorised thinking applies everywhere.'],
      ['Can an array hold text?', 'Yes, but arrays shine with numbers. Mixed data belongs in a pandas DataFrame.'],
    ],
    recap: ['np.array([...]) makes an array; .shape and .dtype describe it.', 'Arithmetic applies to every element at once.', '.sum(), .mean(), .max() summarise; axis picks the direction.'],
  },
  'np-masks': {
    idea: 'A comparison on an array gives a True/False mask you can use to filter, count or choose values, with no loop.',
    terms: ['boolean', 'vectorised'],
    mistakes: [
      ['Using and / or between arrays', 'Use & and | with each condition in brackets: (a > 0) & (a < 30).'],
      ['Putting np.select conditions in the wrong order', 'The first True condition wins, so list the narrowest first, like if/elif.'],
    ],
    faq: [
      ['Why does mask.sum() count?', 'True counts as 1 and False as 0, so summing a mask counts the Trues and its mean is the share.'],
      ['np.where or np.select?', 'np.where for two choices, np.select for many.'],
    ],
    recap: ['arr > 60 gives a mask; arr[mask] keeps matching values.', 'mask.sum() counts, mask.mean() gives the share.', 'np.where (two choices) and np.select (many) label values.'],
  },
  'pd-basics': {
    idea: 'A DataFrame is a table of named columns, and each column is a Series you can do maths on in one go.',
    terms: ['dataframe', 'series', 'index'],
    mistakes: [
      ['Writing df.balance for every column', 'It works for simple names, but df["balance"] always works, including names with spaces.'],
      ['Columns of different lengths when building a DataFrame', 'Every list in the dict must have the same number of items.'],
    ],
    faq: [
      ['What is the index?', 'The row labels on the left (0, 1, 2… by default). It can be meaningful, like account ids, with set_index.'],
      ['Why does df["col"] look different from df[["col"]]?', 'One name gives a Series (one column); a list of names gives a DataFrame (a table, even with one column).'],
    ],
    recap: ['pd.DataFrame({"col": [...]}) builds a table.', 'df["new"] = df["a"] / df["b"] adds a calculated column.', 'df.shape is (rows, columns); df.columns lists the names.'],
  },
  'pd-reading': {
    idea: 'read_csv loads a file into a DataFrame, and five quick commands tell you what is inside before you analyse anything.',
    terms: ['csv', 'dtype', 'dataframe'],
    mistakes: [
      ['Analysing before looking', 'Always run head(), info() and describe() first to spot wrong types and missing values.'],
      ['Leaving dates as text', 'Use parse_dates=["opened"] (or pd.to_datetime) so dates can be compared and grouped.'],
    ],
    faq: [
      ['What is the difference between count and size?', 'count skips missing values; size counts every row.'],
      ['How do I read Excel files?', 'pd.read_excel("file.xlsx", sheet_name="Sheet1") on your computer (it needs the openpyxl package).'],
    ],
    recap: ['pd.read_csv(path, parse_dates=[…]) loads data.', 'head, info, describe, value_counts and nunique explore it.', 'object dtype in a number column means messy data.'],
  },
  'pd-select': {
    idea: 'You pick columns with [ ], rows with a True/False filter, and both at once with loc (by label) or iloc (by position).',
    terms: ['index', 'boolean'],
    mistakes: [
      ['df[df["dpd"] > 60 and df["balance"] > 0]', 'Use & with brackets: df[(df["dpd"] > 60) & (df["balance"] > 0)].'],
      ['Changing a filtered copy: late = df[df["dpd"] > 90]; late["flag"] = 1', 'Change the original with loc: df.loc[df["dpd"] > 90, "flag"] = 1.'],
      ['Confusing loc and iloc after sorting', 'loc uses index labels, iloc positions. After sorting they no longer match.'],
    ],
    faq: [
      ['When should I use query()?', 'When a filter reads better as a sentence: df.query("product == \'Card\' and dpd > 30"). It does the same as a mask.'],
      ['How do I keep rows matching a list?', 'isin: df[df["city"].isin(["Pune", "Nashik"])].'],
    ],
    recap: ['df[["a", "b"]] picks columns; df[mask] picks rows.', 'loc[rows, cols] by label; iloc[rows, cols] by position.', 'Combine conditions with &, |, ~ and brackets.'],
  },
  'pd-sort': {
    idea: 'Sorting puts rows in a useful order, and nlargest / nsmallest grab the top or bottom few in one step.',
    terms: ['index'],
    mistakes: [
      ['Expecting sort_values to change df', 'It returns a new DataFrame. Assign it: df = df.sort_values(…).'],
      ['Keeping a jumbled index after sorting', 'reset_index(drop=True) gives a fresh 0, 1, 2… index.'],
    ],
    faq: [
      ['How do I sort by two columns in different directions?', 'sort_values(["product", "balance"], ascending=[True, False]).'],
      ['What does rank do with ties?', 'By default tied values share the average rank; method="min" gives them the same, lowest rank.'],
    ],
    recap: ['sort_values(col, ascending=False) sorts.', 'nlargest(n, col) and nsmallest(n, col) take the top or bottom n.', 'reset_index(drop=True) tidies the index.'],
  },
  'pd-missing': {
    idea: 'Missing values show up as NaN; count them first, then decide column by column whether to drop or fill.',
    terms: ['nan'],
    mistakes: [
      ['Dropping every incomplete row by reflex', 'dropna() can throw away real balances. Fill text with a placeholder and numbers with a rule you can defend.'],
      ['Comparing with == NaN', 'NaN is never equal to anything, even itself. Use isna() / notna().'],
    ],
    faq: [
      ['Why did my integer column become float?', 'A NaN forces a numeric column to float. After filling, astype(int) turns it back.'],
      ['Should I fill with the mean?', 'Only if it makes business sense. Often the median of similar rows, or a clear "unknown" flag, is more honest.'],
    ],
    recap: ['df.isna().sum() counts missing values per column.', 'fillna(value) fills; dropna() removes rows.', 'Work on a copy: clean = raw.copy().'],
  },
  'pd-tidy': {
    idea: 'Cleaning means turning messy text into proper numbers, consistent labels and one row per account, before any analysis.',
    terms: ['dtype', 'string'],
    mistakes: [
      ['astype(float) on "1,31,600"', 'Remove the commas first: .str.replace(",", ""), then pd.to_numeric(…, errors="coerce").'],
      ['Forgetting .str before a string method', 'Columns need the .str accessor: df["city"].str.strip(), not df["city"].strip().'],
    ],
    faq: [
      ['What does errors="coerce" do?', 'Anything that cannot become a number becomes NaN instead of crashing, so you can find and inspect it.'],
      ['duplicated() or duplicated(subset=…)?', 'Without subset, rows must match in every column; with subset, only in the listed columns (like account_id).'],
    ],
    recap: ['pd.to_numeric(…, errors="coerce") makes numbers safely.', '.str.strip(), .str.title(), .str.replace() tidy text.', 'drop_duplicates(subset="id") keeps one row per id.'],
  },
  'pd-columns': {
    idea: 'New columns come from vectorised maths, np.where for choices, pd.cut for buckets and map for lookups; apply is the slow last resort.',
    terms: ['vectorised', 'series'],
    mistakes: [
      ['Using apply for simple maths', 'df["a"] / df["b"] is far faster than df.apply(lambda r: r["a"] / r["b"], axis=1).'],
      ['Wrong pd.cut edges', 'Bins include the right edge by default: (30, 60]. Start at -1 to include 0.'],
    ],
    faq: [
      ['What happens to values map cannot find?', 'They become NaN. Check with .isna().sum() after mapping.'],
      ['When is apply the right choice?', 'For rules that genuinely need several columns and complex logic that np.where or np.select cannot express.'],
    ],
    recap: ['df["new"] = calculation on columns.', 'np.where for two outcomes; pd.cut for numeric buckets.', '.map(dict) for lookups; apply(axis=1) only when nothing else fits.'],
  },
  'pd-groupby': {
    idea: 'groupby splits rows into groups, calculates something for each, and combines the answers: pandas\' SUMIF and pivot in one tool.',
    terms: ['groupby', 'aggregate'],
    mistakes: [
      ['Grouping and forgetting to aggregate', 'df.groupby("agent") alone does nothing visible; add ["balance"].sum() or .agg(…).'],
      ['Using agg when you need a value on every row', 'Use transform: it returns one value per original row, ready to be a new column.'],
    ],
    faq: [
      ['What is named aggregation?', 'agg(total=("balance", "sum"), n=("account_id", "count")) names each output column as you create it.'],
      ['How do I turn the group labels back into a column?', 'Add .reset_index() at the end.'],
    ],
    recap: ['df.groupby(key)[col].sum() summarises per group.', '.agg(name=(col, func)) creates several named summaries.', 'transform puts a group result on every row.'],
  },
  'pd-reshape': {
    idea: 'Reshaping changes a table\'s layout: pivot_table summarises like Excel, crosstab counts pairs, and melt turns wide into long.',
    terms: ['pivot'],
    mistakes: [
      ['Using pivot when there are duplicate pairs', 'pivot fails on duplicates; pivot_table aggregates them with aggfunc.'],
      ['Reading crosstab counts as rates', 'Add normalize="index" to turn each row into shares that add up to 1.'],
    ],
    faq: [
      ['Long or wide: which is better?', 'Long (one row per observation) is best for analysis and charts; wide is best for people to read.'],
      ['What is a roll-rate matrix?', 'Rows are last month\'s bucket, columns this month\'s, and each cell the share of accounts that moved there.'],
    ],
    recap: ['pivot_table(index, columns, values, aggfunc) builds a summary table.', 'crosstab(a, b, normalize="index") gives row percentages.', 'melt turns columns into rows.'],
  },
  'pd-merge': {
    idea: 'merge joins two tables on a shared key, exactly like a SQL JOIN or a VLOOKUP that brings back whole rows.',
    terms: ['merge', 'primarykey'],
    mistakes: [
      ['Totals inflating after a merge', 'The key repeated on both sides. Add validate="many_to_one" to catch it with an error.'],
      ['Losing rows with an inner join', 'Use how="left" to keep every row of the left table.'],
    ],
    faq: [
      ['merge, join or concat?', 'merge combines by key columns; join is merge on the index; concat stacks tables on top of each other.'],
      ['How do I find rows with no match?', 'merge with indicator=True and keep _merge == "left_only" (an anti-join).'],
    ],
    recap: ['left.merge(right, on="key", how="left") keeps all left rows.', 'validate="many_to_one" protects totals.', 'pd.concat([a, b]) stacks tables.'],
  },
  'pd-time': {
    idea: 'With real dates, pandas can group by month, measure gaps in days, and smooth trends with rolling averages.',
    terms: ['dtype'],
    mistakes: [
      ['Resampling with dates as a normal column', 'resample needs the dates as the index: set_index("date") first (or pass on="date").'],
      ['Comparing date text in different formats', 'Convert with pd.to_datetime first; then comparisons and maths are reliable.'],
    ],
    faq: [
      ['What does "MS" mean?', 'Month start. "M"/"ME" is month end, "W" is weekly, "D" daily.'],
      ['pct_change or diff?', 'diff gives the change in units; pct_change gives it as a share of the previous value.'],
    ],
    recap: ['pd.to_datetime and .dt (year, month, day_name) handle dates.', 'set_index("date").resample("MS").sum() totals per month.', 'rolling(3).mean() smooths; pct_change() measures growth.'],
  },
  'pd-project': {
    idea: 'A monthly MIS pack is just reading, merging, grouping and formatting, wrapped in one function you can rerun every month.',
    terms: ['dataframe', 'groupby', 'merge'],
    mistakes: [
      ['Hard-coding this month\'s numbers', 'Compute everything from the files, so next month only the files change.'],
      ['One giant cell of code', 'Small steps with clear names make the report easy to check and fix.'],
    ],
    faq: [
      ['How would I run this at work?', 'Save it as a .py file, point it at the real export, write the results with to_excel, and schedule it.'],
      ['What next after pandas?', 'SQL with Python (getting data out of databases) and Charts with Matplotlib (presenting it).'],
    ],
    recap: ['Read → clean → merge → group → format.', 'Wrap the analysis in a function that returns the results.', 'The same code gives next month\'s report in seconds.'],
  },
};

export const sqlGuide = {
  'sql-tables': {
    idea: 'A database stores data in tables of rows and columns; SQL is the language for creating tables, adding rows and asking questions.',
    terms: ['sql', 'table', 'primarykey', 'null'],
    mistakes: [
      ['Forgetting quotes around text values', 'Text needs single quotes in SQL: \'Pune\'. Numbers do not.'],
      ['Inserting a duplicate primary key', 'The database refuses it with an IntegrityError: that is the key doing its job.'],
    ],
    faq: [
      ['Why not keep everything in Excel?', 'Databases handle millions of rows, many users at once, and rules (like unique keys) that keep data correct.'],
      ['What is SQLite?', 'A complete SQL database in a single file, built into Python. Ideal for learning and for small apps.'],
    ],
    recap: ['CREATE TABLE defines columns and their types.', 'INSERT INTO … VALUES (…) adds rows.', 'A PRIMARY KEY keeps every row unique.'],
  },
  'sql-select': {
    idea: 'SELECT asks for columns, FROM names the table, WHERE keeps matching rows, and ORDER BY sorts them.',
    terms: ['query', 'sql'],
    mistakes: [
      ['Putting clauses in the wrong order', 'Always SELECT … FROM … WHERE … ORDER BY … LIMIT.'],
      ['Using == for equals', 'SQL uses a single = to compare: WHERE city = \'Pune\'.'],
    ],
    faq: [
      ['Is SQL case-sensitive?', 'Keywords are not (select = SELECT). Text values usually are, depending on the database.'],
      ['What does SELECT * do?', 'Returns every column. Fine for exploring; name the columns you need in real queries.'],
    ],
    recap: ['SELECT columns FROM table WHERE condition ORDER BY column LIMIT n.', 'AND, OR, IN, BETWEEN and LIKE build conditions.', 'con.execute(sql).fetchall() returns the rows to Python.'],
  },
  'sql-group': {
    idea: 'Aggregates turn many rows into one number, and GROUP BY does that once per group, like a pivot table.',
    terms: ['aggregate', 'groupby'],
    mistakes: [
      ['Using an aggregate in WHERE', 'WHERE runs before grouping. Filter on SUM/COUNT with HAVING.'],
      ['Selecting a column that is neither grouped nor aggregated', 'Every selected column must be in GROUP BY or inside an aggregate.'],
    ],
    faq: [
      ['COUNT(*) or COUNT(column)?', 'COUNT(*) counts rows; COUNT(column) skips NULLs in that column.'],
      ['How do I make buckets in SQL?', 'CASE WHEN dpd = 0 THEN \'Current\' WHEN dpd <= 30 THEN \'1-30\' … END.'],
    ],
    recap: ['COUNT, SUM, AVG, MIN, MAX summarise.', 'GROUP BY gives one row per group; HAVING filters groups.', 'CASE WHEN creates labels and conditional counts.'],
  },
  'sql-joins': {
    idea: 'A JOIN lines up rows from two tables that share a key, so payments can be read alongside the accounts they belong to.',
    terms: ['merge', 'primarykey', 'null'],
    mistakes: [
      ['Using INNER JOIN when you need every account', 'LEFT JOIN keeps all rows of the first table.'],
      ['Ambiguous columns after a join', 'Prefix with the table alias: a.account_id, p.amount.'],
    ],
    faq: [
      ['What does COALESCE do?', 'Returns the first non-NULL value: COALESCE(SUM(p.amount), 0) turns "no payments" into 0.'],
      ['Why do my totals double after a join?', 'A row matched several rows on the other side. Aggregate one side first, or check the keys.'],
    ],
    recap: ['JOIN … ON a.key = b.key keeps matches.', 'LEFT JOIN keeps every left row; unmatched columns are NULL.', 'LEFT JOIN … WHERE b.key IS NULL finds rows with no match.'],
  },
  'sql-safe': {
    idea: 'Pass values to SQL with ? placeholders, never by pasting text into the query, and group related changes in a transaction.',
    terms: ['injection', 'transaction'],
    mistakes: [
      ['Building SQL with f-strings from user input', 'Use ? placeholders: con.execute("… WHERE id = ?", (account_id,)).'],
      ['Forgetting the comma in a one-value tuple', '(account_id,) is a tuple; (account_id) is just the value.'],
    ],
    faq: [
      ['What does commit mean?', 'It makes changes permanent. with con: commits automatically on success and rolls back on error.'],
      ['Is SQL injection a real risk?', 'Yes, it is one of the most common security flaws. Placeholders remove it completely.'],
    ],
    recap: ['Always use ? placeholders for values.', 'INSERT, UPDATE and DELETE change data.', 'with con: makes a group of changes all-or-nothing.'],
  },
  'sql-window': {
    idea: 'Window functions calculate across related rows while keeping every row: top-N per group, running totals and month-on-month change.',
    terms: ['window', 'aggregate'],
    mistakes: [
      ['Using a window function in WHERE', 'Calculate it in a CTE first, then filter: WITH r AS (…) SELECT … WHERE rn = 1.'],
      ['Forgetting ORDER BY inside OVER', 'Ranking, running totals and LAG all need an order to make sense.'],
    ],
    faq: [
      ['What is a CTE?', 'A named step (WITH name AS (…)) you can query like a table. It makes long queries readable.'],
      ['ROW_NUMBER, RANK or DENSE_RANK?', 'ROW_NUMBER never ties; RANK gives ties the same number and skips; DENSE_RANK ties without skipping.'],
    ],
    recap: ['WITH step AS (…) names a sub-query.', 'ROW_NUMBER() OVER (PARTITION BY … ORDER BY …) ranks within groups.', 'SUM() OVER (ORDER BY …) runs a total; LAG looks back a row.'],
  },
  'sql-pandas': {
    idea: 'Let SQL filter and summarise inside the database, then hand the result to pandas to reshape, chart or export.',
    terms: ['sql', 'pandas', 'dataframe'],
    mistakes: [
      ['Loading whole tables into pandas to filter them', 'Filter in SQL first; move less data.'],
      ['Formatting values into the query string', 'read_sql_query takes params=(…) just like execute.'],
    ],
    faq: [
      ['How do I connect to a real company database?', 'With that database\'s driver (or SQLAlchemy) instead of sqlite3; the queries and read_sql_query work the same way.'],
      ['Can pandas write to a database?', 'Yes: df.to_sql("table", con) creates or appends a table.'],
    ],
    recap: ['pd.read_sql_query(sql, con, params=…) returns a DataFrame.', 'df.to_sql(name, con) writes one.', 'SQL for filtering and aggregating; pandas for reshaping and presenting.'],
  },
};

export const vizGuide = {
  'viz-first': {
    idea: 'Every chart is drawn on axes inside a figure: create them with plt.subplots(), draw, then label so a reader understands it.',
    terms: ['matplotlib', 'figure'],
    mistakes: [
      ['A chart with no title or axis labels', 'Always say what is shown and in which units: set_title, set_xlabel, set_ylabel.'],
      ['Mixing plt.plot and ax.plot styles', 'Stick to fig, ax = plt.subplots() and ax.… methods; it scales to many charts.'],
    ],
    faq: [
      ['Why fig, ax and not just plt?', 'plt is fine for one quick chart; ax lets you control each chart when there are several.'],
      ['How do I change the size?', 'plt.subplots(figsize=(width, height)) in inches.'],
    ],
    recap: ['fig, ax = plt.subplots() creates the canvas.', 'ax.plot for lines, ax.bar for bars.', 'Title, axis labels and a legend make it readable.'],
  },
  'viz-choose': {
    idea: 'Pick the chart from the question: line for change over time, bar for comparing, histogram for spread, scatter for relationships.',
    terms: ['histogram', 'figure'],
    mistakes: [
      ['A line chart for unrelated categories', 'Lines imply an order (like time). Use bars for categories.'],
      ['Axes showing raw decimals for rates', 'PercentFormatter(1.0) turns 0.72 into 72%; FuncFormatter adds ₹ and units.'],
    ],
    faq: [
      ['When is a pie chart OK?', 'Rarely: only for two or three parts of a whole. Bars are easier to compare.'],
      ['How many bins should a histogram have?', 'Choose edges that mean something, like DPD buckets, or try 10–20 and see.'],
    ],
    recap: ['Trend → line, compare → bar, spread → histogram, relationship → scatter.', 'Format axes in the reader\'s units (%, ₹, Cr).', 'One chart, one question.'],
  },
  'viz-pandas': {
    idea: 'pandas can draw a chart straight from a DataFrame, and subplots put several charts in one figure like a small dashboard.',
    terms: ['dataframe', 'figure'],
    mistakes: [
      ['Plotting unsorted categories', 'Sort first (sort_values or sort_index) so the chart reads naturally.'],
      ['Overlapping titles in a grid', 'Call fig.tight_layout() after drawing.'],
    ],
    faq: [
      ['Grouped or stacked bars?', 'Grouped to compare the parts; stacked to compare the totals.'],
      ['Can I mix pandas plots and ax methods?', 'Yes: pass ax=… to .plot(), then use ax.set_title and friends as usual.'],
    ],
    recap: ['df.plot(kind="bar", ax=ax) draws from a DataFrame.', 'plt.subplots(rows, cols) creates a grid of axes.', 'fig.tight_layout() fixes spacing.'],
  },
  'viz-story': {
    idea: 'A report chart should make one point: highlight it, label it directly and remove everything that does not help.',
    terms: ['figure'],
    mistakes: [
      ['Every bar a different colour', 'Grey for context and one strong colour for the point you are making.'],
      ['A title that only names the data', 'Write the message: "31-60 is rolling forward above target".'],
    ],
    faq: [
      ['How do I put a chart in PowerPoint?', 'fig.savefig("chart.png", dpi=200, bbox_inches="tight") and insert the image.'],
      ['Should I remove gridlines?', 'Keep only what helps reading values; direct labels often make gridlines unnecessary.'],
    ],
    recap: ['Highlight one thing; grey the rest.', 'Annotate key values and add reference lines.', 'An action title tells the reader what to take away.'],
  },
};
