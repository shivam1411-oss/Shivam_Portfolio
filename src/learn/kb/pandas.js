import { code } from './util';

export const pandasKb = {
  intro: 'pandas from the first table to production-grade pipelines. Examples use movies, shops, weather, sport and stock prices, and every one runs in your browser.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'what-is-pandas',
      level: 'beginner',
      title: 'What pandas is: a spreadsheet you control with code',
      summary: 'pandas gives Python a table called a DataFrame. Each column is a Series. Anything you do in Excel, you can do in pandas, and repeat it with one click.',
      body: [
        'A **DataFrame** is a table with named columns and a row label called the **index**. A single column is a **Series**. You can build one from a dictionary where each key is a column name and each value is a list.',
        'Why not just Excel? Code is repeatable (run next month\'s file through the same steps), handles millions of rows, and leaves a record of exactly what was done. By convention pandas is imported as `pd`.',
      ],
      code: code`
        import pandas as pd

        movies = pd.DataFrame({
            "title": ["Inception", "Dangal", "Spirited Away", "Parasite"],
            "year": [2010, 2016, 2001, 2019],
            "rating": [8.8, 8.3, 8.6, 8.5],
            "country": ["USA", "India", "Japan", "South Korea"],
        })
        print(movies)
        print(type(movies["rating"]))      # one column is a Series
        print("Average rating:", movies["rating"].mean())
      `,
      lang: 'python',
      run: true,
      points: ['DataFrame = table; Series = one column.', 'Build one from a dict of lists.', 'Column maths like .mean() works on the whole column at once.'],
      realWorld: 'Streaming services analyse viewing tables with pandas to decide which films to recommend.',
      check: { q: 'In pandas, a single column of a DataFrame is a…', options: ['List', 'Series', 'Row', 'Index'], answer: 1, why: 'Each column is a Series with the same index as the table.' },
      lesson: 'pd-basics',
    },
    {
      id: 'first-look',
      level: 'beginner',
      title: 'Your first look at a dataset',
      summary: 'Before analysing anything, check its size, column types and summary numbers with head, shape, dtypes, info and describe.',
      body: [
        '`df.head()` shows the first 5 rows and `df.tail()` the last. `df.shape` gives (rows, columns). `df.dtypes` shows each column\'s type: `int64`, `float64`, `object` (usually text), `bool` or `datetime64`.',
        '`df.describe()` gives count, mean, min, max and quartiles for number columns, which is a quick way to spot impossible values like negative ages. `df["col"].value_counts()` counts each category.',
      ],
      code: code`
        import pandas as pd

        shop = pd.DataFrame({
            "product": ["Tea", "Coffee", "Tea", "Juice", "Coffee", "Tea"],
            "qty": [2, 1, 5, 3, 2, 1],
            "price": [40.0, 120.0, 40.0, 60.0, 120.0, 40.0],
        })
        print(shop.head(3))
        print("Shape:", shop.shape)
        print(shop.dtypes)
        print(shop.describe())
        print(shop["product"].value_counts())
      `,
      lang: 'python',
      run: true,
      points: ['head, shape and dtypes first, every time.', 'describe() spots odd values quickly.', 'value_counts() counts categories.'],
      realWorld: 'A café owner checks value_counts() on the till export to see which drink sells most each week.',
      check: { q: 'What does df.shape return for a table with 100 rows and 4 columns?', options: ['400', '(4, 100)', '(100, 4)', '[100, 4]'], answer: 2, why: 'shape is (rows, columns).' },
      lesson: 'pd-basics',
    },
    {
      id: 'selecting',
      level: 'beginner',
      title: 'Selecting columns and rows: [], loc and iloc',
      summary: 'Pick columns with df["col"] or df[["a", "b"]]. Pick rows by label with .loc and by position with .iloc.',
      body: [
        'One column name in brackets gives a Series; a list of names gives a smaller DataFrame. `.loc[rows, columns]` uses **labels** (index values and column names) and includes both ends of a slice. `.iloc[rows, columns]` uses **positions** (0, 1, 2…) and, like Python lists, excludes the end.',
        'Setting a meaningful index with `set_index("name")` makes `.loc` read naturally: `df.loc["Mumbai", "temp"]`.',
      ],
      code: code`
        import pandas as pd

        weather = pd.DataFrame({
            "city": ["Mumbai", "Delhi", "Chennai", "Shillong"],
            "temp": [31, 38, 34, 19],
            "humidity": [78, 30, 70, 85],
        }).set_index("city")

        print(weather[["temp"]])
        print(weather.loc["Delhi", "temp"])           # label
        print(weather.loc["Mumbai":"Chennai"])        # labels, end included
        print(weather.iloc[0:2, 1])                   # positions, end excluded
      `,
      lang: 'python',
      run: true,
      points: ['df[["a", "b"]] for several columns (note the double brackets).', '.loc = labels, end included.', '.iloc = positions, end excluded.'],
      realWorld: 'A weather dashboard indexes by city so the code reads like the question: weather.loc["Delhi", "temp"].',
      check: { q: 'Which uses positions (0, 1, 2…) rather than labels?', options: ['.loc', '.iloc', 'df["col"]', '.at'], answer: 1, why: 'The i in iloc stands for integer position.' },
      lesson: 'pd-select',
    },
    {
      id: 'filtering',
      level: 'beginner',
      title: 'Filtering rows with conditions',
      summary: 'A comparison on a column gives True/False for each row. Put that inside df[...] to keep only the True rows.',
      body: [
        '`df["price"] > 100` produces a Series of booleans, often called a **mask**. `df[mask]` keeps matching rows. Combine conditions with `&` (and), `|` (or) and `~` (not), and wrap each condition in brackets.',
        'Helpers make common filters readable: `.isin([...])` for "one of these", `.between(a, b)` for ranges and `.str.contains("text")` for text search. `df.query("price > 100 and stock > 0")` is an alternative syntax.',
      ],
      code: code`
        import pandas as pd

        phones = pd.DataFrame({
            "model": ["A15", "Pixel 9", "iPhone 16", "Note 13", "Edge 50"],
            "brand": ["Samsung", "Google", "Apple", "Redmi", "Motorola"],
            "price": [15999, 79999, 79900, 17999, 27999],
            "rating": [4.2, 4.6, 4.7, 4.1, 4.4],
        })
        budget = phones[(phones["price"] < 30000) & (phones["rating"] >= 4.2)]
        print(budget)
        print(phones[phones["brand"].isin(["Apple", "Google"])])
        print(phones[phones["price"].between(15000, 20000)])
        print(phones.query("price < 20000 and rating > 4"))
      `,
      lang: 'python',
      run: true,
      points: ['A condition makes a True/False mask.', 'Use & | ~ with brackets around each condition.', 'isin, between and str.contains cover most filters.'],
      realWorld: 'Shopping sites build "under ₹30,000 with 4+ stars" filters with exactly this logic.',
      check: { q: 'Why does df[df.a > 1 and df.b < 5] fail?', options: ['and does not work element-wise on Series; use & with brackets', 'You cannot filter twice', 'a and b must be strings', 'It does not fail'], answer: 0, why: 'Python\'s and needs a single True/False; pandas needs & for row-by-row logic.' },
      lesson: 'pd-select',
    },
    {
      id: 'sort-new-columns',
      level: 'beginner',
      title: 'Sorting and creating new columns',
      summary: 'sort_values orders rows. New columns come from maths on existing ones, applied to every row at once.',
      body: [
        '`df.sort_values("col", ascending=False)` sorts; pass a list to sort by several columns. `df.nlargest(3, "col")` is a shortcut for the top rows.',
        'Create a column by assigning: `df["total"] = df["qty"] * df["price"]`. The calculation runs for all rows together (this is called **vectorisation**, and is much faster than a loop). `.assign()` does the same while returning a new DataFrame, handy in chains.',
      ],
      code: code`
        import pandas as pd

        runs = pd.DataFrame({
            "player": ["Kohli", "Root", "Smith", "Williamson", "Babar"],
            "runs": [652, 588, 471, 530, 499],
            "innings": [14, 15, 12, 13, 13],
        })
        runs["average"] = (runs["runs"] / runs["innings"]).round(1)
        runs = runs.assign(form=lambda d: d["average"].apply(lambda a: "hot" if a > 40 else "steady"))
        print(runs.sort_values("average", ascending=False))
        print(runs.nlargest(2, "runs")[["player", "runs"]])
      `,
      lang: 'python',
      run: true,
      points: ['sort_values(by, ascending=False) for descending.', 'Column maths applies to every row at once.', 'assign() returns a new DataFrame with extra columns.'],
      realWorld: 'Cricket statisticians compute averages and strike rates as new columns, then sort to build leaderboards.',
      check: { q: 'df.sort_values("score") sorts…', options: ['Highest first', 'Lowest first', 'Alphabetically by column name', 'Randomly'], answer: 1, why: 'ascending=True is the default.' },
      lesson: 'pd-sort',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'io',
      level: 'intermediate',
      title: 'Reading and writing CSV, Excel and more',
      summary: 'read_csv loads files with options for separators, dates and types. to_csv and to_excel save results.',
      body: [
        '`pd.read_csv(path)` handles most files; useful options are `sep=";"`, `parse_dates=["date"]`, `dtype={"pin": str}` (keep leading zeros), `usecols` and `nrows`. Excel uses `pd.read_excel(path, sheet_name=...)` with the openpyxl package installed.',
        'Write with `df.to_csv("out.csv", index=False)` so the index is not saved as an extra column. For big data, Parquet (`to_parquet`) is smaller and faster and keeps types.',
      ],
      code: code`
        import pandas as pd
        from io import StringIO

        raw = StringIO("""order_id;date;pincode;amount
        A1;2026-03-01;011001;499.0
        A2;2026-03-02;560001;1299.5
        A3;2026-03-02;400001;89.0""")

        orders = pd.read_csv(raw, sep=";", parse_dates=["date"], dtype={"pincode": str})
        print(orders.dtypes)
        print(orders)
        orders.to_csv("orders_clean.csv", index=False)
        print(open("orders_clean.csv").read())
      `,
      lang: 'python',
      run: true,
      points: ['Tell read_csv about separators, dates and text columns.', 'dtype={"col": str} keeps leading zeros.', 'to_csv(..., index=False) avoids an extra column.'],
      realWorld: 'Courier companies keep PIN codes as text so "011001" (Delhi) does not become 11001.',
      check: { q: 'Why pass dtype={"pincode": str}?', options: ['To sort faster', 'To keep leading zeros that a number would drop', 'To encrypt it', 'It is required for CSV'], answer: 1, why: 'As a number, 011001 becomes 11001.' },
      lesson: 'pd-reading',
    },
    {
      id: 'missing',
      level: 'intermediate',
      title: 'Missing data',
      summary: 'Gaps appear as NaN. Find them with isna, then decide: fill them, drop them, or keep and report them.',
      body: [
        '`df.isna().sum()` counts gaps per column. `dropna()` removes rows with gaps (or use `subset=[...]`). `fillna(value)` fills them, for example with 0, the column mean, or the previous value using `ffill()`.',
        'The right choice depends on meaning: a missing sales value might be 0, but a missing temperature is unknown, and filling it with 0 would be wrong. Most calculations like `.mean()` skip NaN automatically.',
      ],
      code: code`
        import pandas as pd
        import numpy as np

        sensors = pd.DataFrame({
            "hour": [1, 2, 3, 4, 5],
            "temp": [21.5, np.nan, 22.1, np.nan, 23.0],
            "door_opens": [3, np.nan, 1, 0, np.nan],
        })
        print(sensors.isna().sum())
        sensors["temp_filled"] = sensors["temp"].interpolate()   # estimate between readings
        sensors["door_opens"] = sensors["door_opens"].fillna(0)  # no record = no opens
        print(sensors)
        print("Mean temp (NaN skipped):", sensors["temp"].mean())
      `,
      lang: 'python',
      run: true,
      points: ['isna().sum() shows where the gaps are.', 'Choose fill values by meaning, not habit.', 'Statistics skip NaN by default.'],
      realWorld: 'Smart-building sensors drop readings; analysts interpolate short gaps in temperature but never invent long ones.',
      check: { q: 'A thermometer missed one reading between 21°C and 23°C. Best fill?', options: ['0', 'Interpolate (about 22°C)', 'Delete the whole dataset', '100'], answer: 1, why: 'Interpolation estimates from neighbours; 0 would be a fake cold reading.' },
      lesson: 'pd-missing',
    },
    {
      id: 'groupby',
      level: 'intermediate',
      title: 'Group and summarise with groupby',
      summary: 'groupby splits rows into groups, applies a calculation to each, and combines the answers: the pandas version of a pivot table.',
      body: [
        '`df.groupby("region")["sales"].sum()` totals sales per region. `.agg()` does several calculations at once, and **named aggregation** gives tidy column names: `agg(total=("sales", "sum"), orders=("id", "count"))`.',
        'Group by several columns with a list. Add `.reset_index()` to turn the group labels back into normal columns, which is easier to chart or export.',
      ],
      code: code`
        import pandas as pd

        sales = pd.DataFrame({
            "region": ["North", "South", "North", "East", "South", "East", "North"],
            "channel": ["Online", "Store", "Store", "Online", "Online", "Store", "Online"],
            "amount": [1200, 800, 450, 990, 1500, 300, 700],
        })
        print(sales.groupby("region")["amount"].sum())
        summary = sales.groupby(["region", "channel"]).agg(
            total=("amount", "sum"), orders=("amount", "count"), avg=("amount", "mean")
        ).reset_index()
        print(summary)
      `,
      lang: 'python',
      run: true,
      points: ['split → apply → combine.', 'Named aggregation: new_name=("column", "function").', 'reset_index() turns groups back into columns.'],
      realWorld: 'Retail chains total each store\'s sales by day and channel with groupby to plan staffing.',
      check: { q: 'What does df.groupby("team")["goals"].mean() return?', options: ['One number', 'Average goals for each team', 'The total goals', 'A sorted table'], answer: 1, why: 'groupby gives one result per group.' },
      lesson: 'pd-groupby',
    },
    {
      id: 'merge',
      level: 'intermediate',
      title: 'Combining tables: merge and concat',
      summary: 'merge joins tables on a shared key like a VLOOKUP that never breaks. concat stacks tables on top of each other.',
      body: [
        '`pd.merge(orders, customers, on="customer_id", how="left")` adds customer details to each order. `how` can be `inner` (only matches), `left` (all of the left table), `right` or `outer` (everything). Use `validate="many_to_one"` to catch duplicate keys that would multiply rows.',
        '`pd.concat([jan, feb])` stacks months with the same columns. `indicator=True` on merge adds a column showing where each row came from, a great check for unmatched keys.',
      ],
      code: code`
        import pandas as pd

        orders = pd.DataFrame({"order": [1, 2, 3, 4], "cust": ["C1", "C2", "C1", "C9"], "amount": [250, 400, 120, 75]})
        customers = pd.DataFrame({"cust": ["C1", "C2", "C3"], "name": ["Asha", "Ravi", "Meera"], "city": ["Pune", "Goa", "Kochi"]})

        full = pd.merge(orders, customers, on="cust", how="left", validate="many_to_one", indicator=True)
        print(full)
        print("Unmatched orders:", (full["_merge"] == "left_only").sum())

        jan = pd.DataFrame({"day": [1, 2], "visits": [120, 98]})
        feb = pd.DataFrame({"day": [1, 2], "visits": [143, 110]})
        print(pd.concat([jan.assign(month="Jan"), feb.assign(month="Feb")], ignore_index=True))
      `,
      lang: 'python',
      run: true,
      points: ['merge = join on keys; concat = stack.', 'how="left" keeps every row of the left table.', 'validate= and indicator= catch bad joins.'],
      realWorld: 'An e-commerce analyst merges orders with customers and products to see revenue by city and category.',
      check: { q: 'With how="inner", an order whose customer is missing from the customer table…', options: ['Appears with blanks', 'Is dropped', 'Causes an error', 'Is duplicated'], answer: 1, why: 'Inner joins keep only keys found in both tables.' },
      lesson: 'pd-merge',
    },
    {
      id: 'dates',
      level: 'intermediate',
      title: 'Dates and time series',
      summary: 'Convert text to real dates with to_datetime, pull out parts with .dt, and summarise by week or month with resample.',
      body: [
        '`pd.to_datetime(df["date"])` turns text into datetimes. Then `.dt.year`, `.dt.month_name()`, `.dt.day_name()` extract parts, and subtracting two dates gives a duration in days.',
        'With dates as the index, `resample("W")` or `resample("ME")` (month end) groups by calendar period. Date ranges are made with `pd.date_range`.',
      ],
      code: code`
        import pandas as pd

        days = pd.date_range("2026-01-01", periods=60, freq="D")
        steps = pd.DataFrame({"date": days, "steps": [6000 + (i * 137) % 5000 for i in range(60)]})
        steps["weekday"] = steps["date"].dt.day_name()

        print(steps.head(3))
        monthly = steps.set_index("date")["steps"].resample("ME").mean().round()
        print(monthly)
        print(steps.groupby("weekday")["steps"].mean().sort_values(ascending=False).head(3))
        print("Days covered:", (steps["date"].max() - steps["date"].min()).days)
      `,
      lang: 'python',
      run: true,
      points: ['to_datetime first; text dates cannot be compared properly.', '.dt gives year, month, weekday and more.', 'resample("W"/"ME") summarises by period.'],
      realWorld: 'Fitness apps resample step counts by week to show trends and by weekday to find your laziest day.',
      check: { q: 'Which groups a date-indexed series by calendar month?', options: ['groupby("month")', 'resample("ME")', 'sort_index()', 'rolling(30)'], answer: 1, why: 'resample works on time periods; "ME" means month end.' },
      lesson: 'pd-time',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'reshape',
      level: 'advanced',
      title: 'Reshaping: pivot_table, melt, stack',
      summary: 'Data comes long (one row per observation) or wide (one column per category). pivot_table goes long→wide; melt goes wide→long.',
      body: [
        '`pivot_table(index=..., columns=..., values=..., aggfunc=...)` builds a cross-tab like Excel, with `margins=True` for totals. `melt` does the reverse, which most charting and modelling tools prefer.',
        '`stack()` and `unstack()` move a level between rows and columns. Tidy data (one variable per column, one observation per row) makes every other step easier.',
      ],
      code: code`
        import pandas as pd

        exam = pd.DataFrame({
            "student": ["Asha", "Asha", "Ravi", "Ravi", "Meera", "Meera"],
            "subject": ["Maths", "Science"] * 3,
            "marks": [91, 85, 67, 74, 88, 95],
        })
        wide = exam.pivot_table(index="student", columns="subject", values="marks", aggfunc="mean", margins=True)
        print(wide)

        scores = pd.DataFrame({"team": ["Red", "Blue"], "Q1": [10, 7], "Q2": [12, 15]})
        long = scores.melt(id_vars="team", var_name="quarter", value_name="points")
        print(long)
      `,
      lang: 'python',
      run: true,
      points: ['Long → wide: pivot_table.', 'Wide → long: melt.', 'Tidy (long) data suits analysis and charts.'],
      realWorld: 'Schools pivot exam results into a student-by-subject grid for report cards, and melt them back for statistics.',
      check: { q: 'A table has columns Jan, Feb, Mar of sales. To make one "month" column you use…', options: ['pivot_table', 'melt', 'merge', 'sort_values'], answer: 1, why: 'melt turns several columns into rows.' },
      lesson: 'pd-reshape',
    },
    {
      id: 'vectorise',
      level: 'advanced',
      title: 'Vectorisation, np.where, cut and map',
      summary: 'Row-by-row loops and apply are slow. Whole-column operations, np.where, np.select, pd.cut and map are faster and clearer.',
      body: [
        'pandas and NumPy run column operations in optimised C code. `np.where(cond, a, b)` is a vectorised if/else; `np.select` handles many conditions. `pd.cut` puts numbers into bins (age groups, price bands) and `qcut` makes equal-sized groups.',
        '`.map(dict)` translates codes to labels. Use `.apply` only when no vectorised option exists.',
      ],
      code: code`
        import pandas as pd
        import numpy as np

        rides = pd.DataFrame({"km": [2.5, 12.0, 7.8, 31.0, 0.9], "hour": [9, 23, 14, 2, 18], "city": ["BLR", "DEL", "BLR", "MUM", "DEL"]})

        rides["fare"] = 40 + rides["km"] * 14
        rides["night"] = np.where((rides["hour"] >= 22) | (rides["hour"] < 6), "yes", "no")
        rides["fare"] = np.where(rides["night"] == "yes", rides["fare"] * 1.25, rides["fare"]).round()
        rides["distance_band"] = pd.cut(rides["km"], bins=[0, 3, 10, 50], labels=["short", "medium", "long"])
        rides["city_name"] = rides["city"].map({"BLR": "Bengaluru", "DEL": "Delhi", "MUM": "Mumbai"})
        print(rides)
      `,
      lang: 'python',
      run: true,
      points: ['Prefer column operations to loops and apply.', 'np.where for if/else; np.select for many cases.', 'pd.cut makes bins; map translates codes.'],
      realWorld: 'Ride-hailing apps compute fares for millions of trips with vectorised rules like night surcharges.',
      check: { q: 'Fastest way to label rows "high" when amount > 1000, else "low"?', options: ['A for loop', 'df.apply with a lambda', 'np.where(df.amount > 1000, "high", "low")', 'Edit in Excel'], answer: 2, why: 'np.where is vectorised.' },
      lesson: 'pd-columns',
    },
    {
      id: 'text-categories',
      level: 'advanced',
      title: 'Text cleaning and categoricals',
      summary: 'The .str accessor cleans whole text columns at once. Category dtype saves memory and keeps a meaningful order.',
      body: [
        '`.str.strip()`, `.str.lower()`, `.str.replace()`, `.str.extract(r"(\\d+)")` and `.str.split(expand=True)` clean messy text in one line. Regular expressions handle patterns like phone numbers or codes.',
        'Columns with a few repeated values (size, grade, city) can use `category` dtype, which stores each label once. An **ordered** category (`small < medium < large`) sorts and compares correctly.',
      ],
      code: code`
        import pandas as pd

        tickets = pd.DataFrame({
            "raw": ["  ORD-1042 Late delivery ", "ord-77 broken item", "Ord-301  WRONG SIZE"],
            "size": ["M", "L", "S"],
        })
        tickets["order_no"] = tickets["raw"].str.extract(r"(?i)ord-(\d+)", expand=False).astype(int)
        tickets["issue"] = tickets["raw"].str.replace(r"(?i)ord-\d+", "", regex=True).str.strip().str.capitalize()
        tickets["size"] = pd.Categorical(tickets["size"], categories=["S", "M", "L"], ordered=True)
        print(tickets.sort_values("size"))
        print(tickets["size"] > "S")
      `,
      lang: 'python',
      run: true,
      points: ['.str methods work on every row.', 'extract pulls out regex groups.', 'Ordered categories sort by meaning, not alphabet.'],
      realWorld: 'Support teams extract order numbers from free-text complaints to link tickets to orders automatically.',
      check: { q: 'Why make clothing sizes an ordered category?', options: ['To sort S < M < L correctly instead of alphabetically', 'To encrypt them', 'Text cannot be sorted', 'It is required by merge'], answer: 0, why: 'Alphabetically L < M < S, which is wrong.' },
      lesson: 'pd-tidy',
    },
    {
      id: 'windows',
      level: 'advanced',
      title: 'Rolling windows, shift and ranking',
      summary: 'rolling computes moving averages, shift compares with the previous row, pct_change gives growth, and rank orders values.',
      body: [
        '`s.rolling(7).mean()` is a 7-period moving average that smooths noise. `s.shift(1)` moves values down a row so you can compare today with yesterday; `pct_change()` does that as a percentage. `expanding()` gives running totals or records.',
        'Combine with groupby to do this per stock, store or player: `df.groupby("ticker")["price"].pct_change()`.',
      ],
      code: code`
        import pandas as pd

        prices = pd.DataFrame({
            "day": list(range(1, 9)) * 2,
            "ticker": ["SOLR"] * 8 + ["WNDY"] * 8,
            "close": [100, 102, 101, 105, 107, 106, 110, 112, 50, 49, 51, 48, 47, 49, 52, 55],
        })
        g = prices.groupby("ticker")["close"]
        prices["ma3"] = g.transform(lambda s: s.rolling(3).mean()).round(1)
        prices["daily_%"] = (g.pct_change() * 100).round(2)
        prices["record_high"] = g.cummax()
        print(prices[prices["ticker"] == "SOLR"])
        print(prices.groupby("ticker")["daily_%"].mean().rank(ascending=False))
      `,
      lang: 'python',
      run: true,
      points: ['rolling(n) for moving windows.', 'shift and pct_change compare with earlier rows.', 'groupby + transform keeps the original row count.'],
      realWorld: 'Trading platforms show 50- and 200-day moving averages computed with rolling windows.',
      check: { q: 'What does s.shift(1) do?', options: ['Sorts the series', 'Moves every value down one row', 'Deletes the first row', 'Adds 1'], answer: 1, why: 'Each row then holds the previous row\'s value.' },
      lesson: 'pd-time',
    },
    {
      id: 'multiindex',
      level: 'advanced',
      title: 'MultiIndex: rows labelled by several keys',
      summary: 'Grouping by two columns gives a MultiIndex. Select with tuples, swap levels with unstack, and flatten with reset_index.',
      body: [
        'A MultiIndex labels each row with several values, for example (country, year). `.loc[("India", 2024)]` selects one combination; `.xs(2024, level="year")` takes a cross-section across all countries.',
        'They are powerful but can confuse; when in doubt, `reset_index()` back to plain columns.',
      ],
      code: code`
        import pandas as pd

        medals = pd.DataFrame({
            "country": ["India", "India", "Japan", "Japan", "Kenya", "Kenya"],
            "games": [2021, 2024, 2021, 2024, 2021, 2024],
            "medals": [7, 6, 58, 45, 10, 11],
        }).set_index(["country", "games"])

        print(medals.loc[("Japan", 2024)])
        print(medals.xs(2024, level="games"))
        print(medals["medals"].unstack("games"))
      `,
      lang: 'python',
      run: true,
      points: ['MultiIndex = several row labels.', 'Select with tuples or xs.', 'unstack moves a level into columns.'],
      realWorld: 'Sports analysts index results by (country, games) to compare nations across Olympics.',
      check: { q: 'Easiest way to turn a MultiIndex back into normal columns?', options: ['drop()', 'reset_index()', 'sort_values()', 'melt()'], answer: 1, why: 'reset_index moves index levels into columns.' },
    },
    // ------------------------------------------------------------ expert
    {
      id: 'memory-speed',
      level: 'expert',
      title: 'Memory and speed at scale',
      summary: 'Right-size dtypes, use categories, read only what you need, and process huge files in chunks or with a columnar format.',
      body: [
        '`df.memory_usage(deep=True)` shows where memory goes. Downcast numbers (`int64`→`int32`), make repeated text `category`, and read only needed columns with `usecols`. A string column can shrink 10× as a category.',
        'For files bigger than memory, `read_csv(..., chunksize=100_000)` streams pieces you can aggregate. Parquet with the Arrow engine is columnar and compressed, often 5–10× smaller than CSV and much faster to read.',
      ],
      code: code`
        import pandas as pd
        import numpy as np

        n = 200_000
        rng = np.random.default_rng(1)
        df = pd.DataFrame({
            "store": rng.choice(["Andheri", "Bandra", "Colaba", "Dadar"], n),
            "units": rng.integers(0, 50, n),
            "price": rng.uniform(10, 500, n),
        })
        before = df.memory_usage(deep=True).sum() / 1e6
        df["store"] = df["store"].astype("category")
        df["units"] = pd.to_numeric(df["units"], downcast="integer")
        df["price"] = df["price"].astype("float32")
        after = df.memory_usage(deep=True).sum() / 1e6
        print(f"{before:.1f} MB -> {after:.1f} MB")
        print(df.dtypes)
      `,
      lang: 'python',
      run: true,
      points: ['Measure with memory_usage(deep=True).', 'category for repeated text; downcast numbers.', 'chunksize and Parquet for large data.'],
      realWorld: 'A telecom analyst fit a 40 GB call log into a laptop by reading only 6 columns as categories and Parquet.',
      check: { q: 'Which usually saves the most memory on a column of 4 store names repeated 1M times?', options: ['float32', 'category dtype', 'Sorting it', 'Adding an index'], answer: 1, why: 'Each name is stored once; rows hold small integer codes.' },
    },
    {
      id: 'copy-on-write',
      level: 'expert',
      title: 'Views, copies and Copy-on-Write',
      summary: 'Chained assignment like df[df.x > 0]["y"] = 1 may silently do nothing. Use .loc in one step, and learn Copy-on-Write, the default in pandas 3.',
      body: [
        'Historically, selecting part of a DataFrame might return a **view** (sharing data) or a **copy**, and you could not easily tell. Writing to it caused the famous `SettingWithCopyWarning`. The fix is always one `.loc` call: `df.loc[df["x"] > 0, "y"] = 1`.',
        '**Copy-on-Write** (opt-in in pandas 2.x with `pd.options.mode.copy_on_write = True`, default from pandas 3.0) makes every result behave like a copy, copying lazily only when you modify it. Chained assignment then never changes the original, so the .loc habit matters even more.',
      ],
      code: code`
        import pandas as pd

        pd.options.mode.copy_on_write = True
        stock = pd.DataFrame({"item": ["pen", "pad", "ink"], "qty": [0, 12, 3]})

        low = stock[stock["qty"] < 5]
        low["qty"] = 50                # changes only 'low', never 'stock'
        print(stock)

        stock.loc[stock["qty"] < 5, "qty"] = 50   # the right way: one .loc
        print(stock)
      `,
      lang: 'python',
      run: true,
      points: ['Never chain [] then assign.', 'df.loc[mask, "col"] = value in one step.', 'Copy-on-Write is the future default; code for it now.'],
      realWorld: 'An inventory script that "restocked" items via chained assignment silently did nothing until it was rewritten with .loc.',
      check: { q: 'Which reliably updates the original DataFrame?', options: ['df[df.a > 0]["b"] = 1', 'df.loc[df.a > 0, "b"] = 1', 'df.b[df.a > 0] = 1', 'All of them'], answer: 1, why: 'A single .loc call writes to the DataFrame itself.' },
    },
    {
      id: 'chaining',
      level: 'expert',
      title: 'Readable pipelines: method chaining and pipe',
      summary: 'Write analysis as one chain of steps, each on its own line, using assign, query, pipe and agg. It reads top to bottom like a recipe.',
      body: [
        'Each pandas method returns a new object, so steps can be chained inside brackets. `assign` adds columns with lambdas that see the current data, and `pipe(func)` plugs in your own functions.',
        'Chains avoid half-finished temporary variables and make each step easy to comment out while debugging. Keep each step small and name custom steps clearly.',
      ],
      code: code`
        import pandas as pd

        def remove_test_orders(df):
            return df[~df["customer"].str.startswith("TEST")]

        orders = pd.DataFrame({
            "customer": ["Asha", "TEST-1", "Ravi", "Asha", "Meera"],
            "amount": [450, 999, 1200, 300, 80],
            "date": ["2026-04-01", "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-03"],
        })

        report = (
            orders
            .pipe(remove_test_orders)
            .assign(date=lambda d: pd.to_datetime(d["date"]), big=lambda d: d["amount"] >= 400)
            .groupby("customer", as_index=False)
            .agg(spent=("amount", "sum"), big_orders=("big", "sum"))
            .sort_values("spent", ascending=False)
        )
        print(report)
      `,
      lang: 'python',
      run: true,
      points: ['Wrap chains in brackets, one step per line.', 'assign with lambdas sees the current data.', 'pipe plugs in reusable functions.'],
      realWorld: 'Analytics teams keep their monthly KPI pipelines as one chain per report so reviewers can follow every step.',
      check: { q: 'What does .pipe(f) do?', options: ['Saves to a file', 'Calls f(df) and continues the chain with its result', 'Runs f on each row', 'Plots the data'], answer: 1, why: 'df.pipe(f) is the same as f(df), but fits in a chain.' },
    },
    {
      id: 'validation',
      level: 'expert',
      title: 'Testing and validating data pipelines',
      summary: 'Data changes underneath your code. Assert your assumptions (unique keys, ranges, no gaps) and unit-test transformations with small, known tables.',
      body: [
        'Put cheap checks at each step: keys unique (`df["id"].is_unique`), no unexpected gaps, values in range, row counts stable after a merge. Fail loudly with a clear message instead of producing a wrong report.',
        'Unit-test transformation functions with tiny hand-made inputs and `pd.testing.assert_frame_equal`. Libraries like pandera or Great Expectations turn these rules into declared schemas.',
      ],
      code: code`
        import pandas as pd

        def add_vat(df, rate=0.18):
            return df.assign(gross=(df["net"] * (1 + rate)).round(2))

        def check(df):
            assert df["invoice"].is_unique, "duplicate invoices"
            assert df["net"].ge(0).all(), "negative amounts"
            assert df.notna().all().all(), "missing values"
            return df

        expected = pd.DataFrame({"invoice": [1, 2], "net": [100.0, 50.0], "gross": [118.0, 59.0]})
        result = add_vat(pd.DataFrame({"invoice": [1, 2], "net": [100.0, 50.0]})).pipe(check)
        pd.testing.assert_frame_equal(result, expected)
        print("add_vat passes")

        try:
            check(pd.DataFrame({"invoice": [1, 1], "net": [10.0, 5.0]}))
        except AssertionError as e:
            print("Caught bad data:", e)
      `,
      lang: 'python',
      run: true,
      points: ['Assert assumptions at every step.', 'Test transformations with tiny known tables.', 'assert_frame_equal compares values and dtypes.'],
      realWorld: 'A bank\'s reporting pipeline refuses to publish if invoice IDs are duplicated, rather than reporting inflated revenue.',
      check: { q: 'Why check row counts after a merge?', options: ['Merges are slow', 'Duplicate keys can silently multiply rows', 'To sort the data', 'It is required by pandas'], answer: 1, why: 'A many-to-many join can inflate totals.' },
    },
    {
      id: 'beyond',
      level: 'expert',
      title: 'Beyond pandas: Arrow, Polars, DuckDB and Spark',
      summary: 'pandas is perfect up to a few GB. Bigger or faster needs call for Polars, DuckDB, or distributed engines like Spark, which share the same ideas.',
      body: [
        '**Apache Arrow** is a shared columnar memory format; pandas can use it (`dtype_backend="pyarrow"`) for faster strings and real missing values. **Polars** is a fast DataFrame library with lazy queries and all CPU cores. **DuckDB** runs SQL directly on DataFrames, CSV and Parquet files, at high speed on one machine.',
        'For terabytes across many machines, teams use **Spark** (PySpark) or a cloud warehouse (BigQuery, Snowflake). The concepts — filter, group, join, window — are the same everywhere, so pandas skills transfer.',
      ],
      code: code`
        # Polars: lazy, multi-core
        import polars as pl
        (pl.scan_parquet("trips/*.parquet")
           .filter(pl.col("km") > 5)
           .group_by("city")
           .agg(pl.col("fare").mean().alias("avg_fare"))
           .collect())

        # DuckDB: SQL on files or DataFrames
        import duckdb
        duckdb.sql("SELECT city, avg(fare) FROM 'trips/*.parquet' WHERE km > 5 GROUP BY city").df()

        # pandas with Arrow types
        import pandas as pd
        df = pd.read_parquet("trips.parquet", dtype_backend="pyarrow")
      `,
      lang: 'python',
      note: 'Shown, not run: these libraries are not loaded in the browser.',
      points: ['Arrow is the common columnar format.', 'Polars and DuckDB scale one machine further.', 'Spark and warehouses handle terabytes; the concepts carry over.'],
      realWorld: 'A logistics start-up moved nightly reports from pandas to DuckDB and cut runtime from 40 minutes to 2.',
      check: { q: 'Which lets you run SQL directly on Parquet files and DataFrames on a laptop?', options: ['Matplotlib', 'DuckDB', 'NumPy', 'Jupyter'], answer: 1, why: 'DuckDB is an in-process analytical SQL engine.' },
    },
  ],
};
