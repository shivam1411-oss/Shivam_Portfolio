import { code } from './util';

export const vizKb = {
  intro: 'Data visualisation from your first line chart to honest, publication-quality graphics. Examples cover weather, sport, health, music and markets, and every chart is drawn in your browser.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'why-charts',
      level: 'beginner',
      title: 'Why charts, and your first plot',
      summary: 'A chart turns a table of numbers into a picture your eyes understand in seconds. Matplotlib draws charts in Python with a few lines.',
      body: [
        'Our brains spot patterns, trends and outliers in shapes far faster than in columns of numbers. The question decides the chart: **comparison** → bar, **trend over time** → line, **distribution** → histogram, **relationship** → scatter.',
        'In Matplotlib you import `matplotlib.pyplot as plt`, call a plotting function with your x and y values, and the chart appears. `plt.show()` displays it.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        hours = [6, 9, 12, 15, 18, 21]
        temp = [18, 24, 31, 33, 27, 21]

        plt.plot(hours, temp, marker="o")
        plt.title("Temperature in Jaipur today")
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Pick the chart from the question you are answering.', 'plt.plot(x, y) draws a line.', 'Every chart needs a title that says what it shows.'],
      realWorld: 'Weather apps show the day\'s temperature as a line so you can see at a glance when it peaks.',
      check: { q: 'To show how website visitors changed over 12 months, the best start is a…', options: ['Pie chart', 'Line chart', 'Scatter plot', 'Table'], answer: 1, why: 'Lines show change over time.' },
      lesson: 'viz-first',
    },
    {
      id: 'bar-charts',
      level: 'beginner',
      title: 'Bar charts for comparing categories',
      summary: 'Bars compare amounts between categories. Sort them and start the axis at zero so lengths are honest.',
      body: [
        '`plt.bar(categories, values)` draws vertical bars; `plt.barh` draws horizontal ones, which are easier to read when labels are long. Sorting bars by value makes ranking obvious.',
        'Because we judge bars by their length, the value axis must start at zero; otherwise small differences look huge.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        fruits = {"Mango": 340, "Banana": 410, "Apple": 220, "Guava": 150, "Papaya": 95}
        ranked = sorted(fruits.items(), key=lambda kv: kv[1])
        names = [k for k, v in ranked]
        sold = [v for k, v in ranked]

        plt.barh(names, sold, color="#14b8a6")
        plt.title("Fruit sold this week (kg)")
        plt.xlabel("kg")
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Bars compare categories.', 'Sort bars to show ranking.', 'Bar axes start at zero.'],
      realWorld: 'A farmers\' market co-op compares weekly sales per fruit with a sorted bar chart.',
      check: { q: 'Why must a bar chart\'s axis start at zero?', options: ['It looks nicer', 'Readers compare bar lengths, so a cut axis exaggerates differences', 'Matplotlib requires it', 'It does not matter'], answer: 1, why: 'Length encodes value; truncation distorts it.' },
      lesson: 'viz-choose',
    },
    {
      id: 'line-charts',
      level: 'beginner',
      title: 'Line charts for trends, with several series',
      summary: 'Lines show how values change over an ordered axis like time. Plot several lines to compare trends and add a legend.',
      body: [
        'Call `plt.plot` once per series and give each a `label`. `plt.legend()` then shows which line is which. Markers (`marker="o"`) help when there are few points.',
        'Too many lines become spaghetti; with more than 4 or 5 series, highlight one and grey out the rest, or use small multiples (covered later).',
      ],
      code: code`
        import matplotlib.pyplot as plt

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        delhi = [14, 17, 23, 30, 34, 33]
        bengaluru = [21, 23, 26, 28, 27, 24]

        plt.plot(months, delhi, marker="o", label="Delhi")
        plt.plot(months, bengaluru, marker="o", label="Bengaluru")
        plt.title("Average temperature (°C)")
        plt.legend()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['One plot() per series, each with a label.', 'legend() explains the colours.', 'Keep to a few lines per chart.'],
      realWorld: 'Travel sites compare city temperatures month by month to suggest the best time to visit.',
      check: { q: 'What makes legend() show names?', options: ['The title', 'The label= on each plot()', 'The axis labels', 'Colours'], answer: 1, why: 'The legend lists each series\' label.' },
      lesson: 'viz-first',
    },
    {
      id: 'labels',
      level: 'beginner',
      title: 'Titles, axis labels and units',
      summary: 'A chart without labels is a puzzle. Say what is measured, in which units, and the main message.',
      body: [
        'Use `plt.title`, `plt.xlabel` and `plt.ylabel`. Include units (₹, %, kg, km). A good title states the takeaway ("Sales doubled after the festival"), not just the topic.',
        'Add a source note with `plt.figtext` when sharing charts, and keep fonts large enough to read on a phone.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        weeks = [1, 2, 3, 4, 5, 6, 7, 8]
        km = [5, 7, 6, 9, 11, 12, 15, 16]

        plt.plot(weeks, km, marker="o", color="#6366f1")
        plt.title("Weekly running distance tripled in 8 weeks")
        plt.xlabel("Week of training")
        plt.ylabel("Distance (km)")
        plt.figtext(0.01, 0.01, "Source: my running app", fontsize=8, color="gray")
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Label both axes with units.', 'Make the title the takeaway.', 'Cite your source.'],
      realWorld: 'Newsrooms write chart titles as headlines so readers get the point even if they skip the chart.',
      check: { q: 'Which is the better chart title?', options: ['"Data"', '"Sales chart"', '"Online sales overtook store sales in March"', '"Figure 1"'], answer: 2, why: 'It states the message.' },
      lesson: 'viz-story',
    },
    {
      id: 'histograms',
      level: 'beginner',
      title: 'Histograms: seeing a distribution',
      summary: 'A histogram groups numbers into ranges (bins) and shows how many fall in each, revealing the shape of your data.',
      body: [
        '`plt.hist(values, bins=10)` counts how many values fall in each range. You can see the centre, the spread, skew (a long tail on one side) and outliers.',
        'Bin count changes the story: too few hides detail, too many looks noisy. Try a few and add a line for the mean or median with `plt.axvline`.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import random

        random.seed(4)
        scores = [min(100, max(0, round(random.gauss(68, 12)))) for _ in range(300)]
        avg = sum(scores) / len(scores)

        plt.hist(scores, bins=15, color="#f59e0b", edgecolor="white")
        plt.axvline(avg, color="black", linestyle="--", label=f"average {avg:.0f}")
        plt.title("Exam scores of 300 students")
        plt.xlabel("Score"); plt.ylabel("Students")
        plt.legend()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Histograms show shape, centre and spread.', 'Try several bin counts.', 'Mark the mean or median for reference.'],
      realWorld: 'Exam boards look at score histograms to check whether a paper was too hard or too easy.',
      check: { q: 'A histogram with a long tail to the right means…', options: ['Most values are high', 'A few values are much larger than the rest (right skew)', 'The data is wrong', 'The mean is zero'], answer: 1, why: 'The tail shows rare large values, as with incomes.' },
      lesson: 'viz-choose',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'fig-axes',
      level: 'intermediate',
      title: 'Figures and Axes: the object-oriented way',
      summary: 'Professional Matplotlib code creates a Figure (the canvas) and Axes (each plot) with plt.subplots, then calls methods on the axes.',
      body: [
        '`fig, ax = plt.subplots()` gives you explicit objects. Methods mirror the plt functions: `ax.plot`, `ax.set_title`, `ax.set_xlabel`. This style scales to several charts side by side: `fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))`.',
        '`fig.tight_layout()` stops labels overlapping, and `fig.suptitle` adds a title over all panels.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        steps = [7200, 8100, 6500, 9900, 7600, 12400, 4300]
        sleep = [6.5, 7.0, 6.0, 7.5, 6.8, 8.2, 9.0]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
        ax1.bar(days, steps, color="#22c55e")
        ax1.set_title("Steps")
        ax2.plot(days, sleep, marker="o", color="#8b5cf6")
        ax2.set_title("Sleep (hours)")
        fig.suptitle("My week from a fitness tracker")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['fig, ax = plt.subplots() is the standard start.', 'ax.set_title / set_xlabel instead of plt.title.', 'tight_layout() fixes overlaps.'],
      realWorld: 'Fitness apps show steps and sleep side by side so users spot the link between them.',
      check: { q: 'What does plt.subplots(2, 2) create?', options: ['Two charts', 'A 2×2 grid of four Axes', 'Two figures', 'A 2-inch chart'], answer: 1, why: 'Rows × columns of Axes in one Figure.' },
      lesson: 'viz-pandas',
    },
    {
      id: 'scatter',
      level: 'intermediate',
      title: 'Scatter plots and relationships',
      summary: 'A scatter plot puts one variable on each axis to reveal relationships, clusters and outliers. Correlation is not causation.',
      body: [
        '`ax.scatter(x, y)` draws one dot per item. Colour (`c=`) or size (`s=`) can add a third variable. A trend line from `numpy.polyfit` helps show direction.',
        'The **correlation coefficient** (−1 to 1) measures how straight-line related two variables are. A strong correlation still does not prove one causes the other: both may depend on a third factor.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        rng = np.random.default_rng(7)
        study = rng.uniform(0, 10, 60)
        score = 40 + 5 * study + rng.normal(0, 7, 60)

        slope, intercept = np.polyfit(study, score, 1)
        r = np.corrcoef(study, score)[0, 1]

        fig, ax = plt.subplots()
        ax.scatter(study, score, alpha=0.7)
        xs = np.linspace(0, 10, 2)
        ax.plot(xs, slope * xs + intercept, color="crimson", label=f"trend (r = {r:.2f})")
        ax.set_xlabel("Hours studied per week"); ax.set_ylabel("Test score")
        ax.set_title("More study, higher scores")
        ax.legend()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Scatter = one dot per item, two variables.', 'Add a trend line and r to quantify.', 'Correlation does not prove causation.'],
      realWorld: 'Health researchers plot daily steps against resting heart rate to explore links between activity and fitness.',
      check: { q: 'Ice-cream sales and drowning incidents are correlated. Why?', options: ['Ice cream causes drowning', 'Both rise in hot weather (a third factor)', 'Coincidence only', 'Bad data'], answer: 1, why: 'Summer drives both.' },
    },
    {
      id: 'formatting-axes',
      level: 'intermediate',
      title: 'Formatting axes: currency, percentages and dates',
      summary: 'Readable ticks matter: show ₹1.2L or 25% instead of 120000 or 0.25, and space dates sensibly.',
      body: [
        '`matplotlib.ticker` formats tick labels: `PercentFormatter` for percentages, `FuncFormatter` for any custom format like lakhs or "k". `ax.set_ylim(0, ...)` sets the range.',
        'For dates, pass real datetime values and use `matplotlib.dates` locators and formatters, or `fig.autofmt_xdate()` to tilt labels.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        from matplotlib.ticker import FuncFormatter, PercentFormatter

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        revenue = [180000, 210000, 260000, 240000, 310000, 355000]
        margin = [0.18, 0.21, 0.24, 0.22, 0.27, 0.29]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
        ax1.bar(months, revenue, color="#0ea5e9")
        ax1.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"₹{v / 100000:.1f}L"))
        ax1.set_title("Revenue")
        ax2.plot(months, margin, marker="o", color="#f97316")
        ax2.yaxis.set_major_formatter(PercentFormatter(1.0))
        ax2.set_ylim(0, 0.35)
        ax2.set_title("Profit margin")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Format ticks in the units people use.', 'PercentFormatter(1.0) for fractions.', 'FuncFormatter for anything custom.'],
      realWorld: 'Indian business dashboards format revenue in lakhs and crores because that is how managers read numbers.',
      check: { q: 'Values 0.25, 0.30 should display as 25%, 30%. Use…', options: ['set_ylim', 'PercentFormatter(1.0)', 'legend()', 'bar()'], answer: 1, why: 'It multiplies fractions by 100 and adds %.' },
      lesson: 'viz-story',
    },
    {
      id: 'colour',
      level: 'intermediate',
      title: 'Colour with purpose, and accessibility',
      summary: 'Use colour to highlight what matters and grey for the rest. Choose palettes that colour-blind readers can tell apart.',
      body: [
        'About 1 in 12 men has some colour-vision deficiency, most often red-green. Avoid red-versus-green as the only difference; use colour-blind-safe palettes (Matplotlib\'s `tab10` and `viridis` are good defaults) and add labels or patterns.',
        'The most powerful trick: make everything grey except the one series or bar you are talking about.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        states = ["Kerala", "Goa", "Punjab", "Bihar", "Gujarat", "Assam"]
        literacy = [94, 89, 76, 62, 79, 72]
        focus = "Bihar"

        colours = ["#d1d5db" if s != focus else "#dc2626" for s in states]
        fig, ax = plt.subplots()
        ax.bar(states, literacy, color=colours)
        ax.set_title("Bihar has the lowest literacy rate of these states (%)")
        for i, v in enumerate(literacy):
            ax.text(i, v + 1, f"{v}%", ha="center", fontsize=9)
        ax.set_ylim(0, 105)
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Highlight one thing; grey the rest.', 'Do not rely on red vs green alone.', 'Direct labels beat legends.'],
      realWorld: 'Government reports highlight the one region needing action and grey out the others to focus attention.',
      check: { q: 'The most common colour-vision deficiency makes it hard to tell apart…', options: ['Blue and yellow', 'Red and green', 'Black and white', 'Purple and orange'], answer: 1, why: 'Red-green deficiency is by far the most common.' },
    },
    {
      id: 'pandas-plot',
      level: 'intermediate',
      title: 'Plotting straight from pandas',
      summary: 'DataFrames have a .plot() method built on Matplotlib, so a groupby result becomes a chart in one line.',
      body: [
        '`df.plot(x="month", y=["a", "b"])` draws lines; `kind="bar"`, `"barh"`, `"hist"`, `"scatter"` and `"box"` switch type. It returns an Axes, so you can keep customising with Matplotlib.',
        'Shape the data first (groupby, pivot) so each column is a series you want to plot.',
      ],
      code: code`
        import pandas as pd
        import matplotlib.pyplot as plt

        plays = pd.DataFrame({
            "genre": ["Pop", "Rock", "Pop", "Indie", "Rock", "Pop", "Indie", "Classical"],
            "platform": ["App", "Web", "Web", "App", "App", "App", "Web", "Web"],
            "streams": [520, 210, 340, 150, 180, 610, 90, 70],
        })
        table = plays.pivot_table(index="genre", columns="platform", values="streams", aggfunc="sum", fill_value=0)
        ax = table.sort_values("App").plot(kind="barh", stacked=True, figsize=(7, 4))
        ax.set_title("Streams by genre and platform (thousands)")
        ax.set_xlabel("Streams (k)")
        plt.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['df.plot(kind=…) for quick charts.', 'Reshape first: one column per series.', 'It returns an Axes for further styling.'],
      realWorld: 'Music-streaming analysts chart genre popularity per platform straight from pivot tables.',
      check: { q: 'What does df.plot() return?', options: ['A DataFrame', 'A Matplotlib Axes', 'A PNG file', 'Nothing'], answer: 1, why: 'So you can keep customising.' },
      lesson: 'viz-pandas',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'annotations',
      level: 'advanced',
      title: 'Annotations and storytelling',
      summary: 'Point readers to the moment that matters with arrows, reference lines, shaded regions and direct labels.',
      body: [
        '`ax.annotate(text, xy=point, xytext=label_position, arrowprops=...)` draws an arrow to a data point. `ax.axhline` adds a target line and `ax.axvspan` shades a period such as a lockdown or campaign.',
        'Remove clutter (top and right spines, heavy gridlines) so annotations stand out. Every element should help the message.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        weeks = list(range(1, 21))
        signups = [120, 130, 125, 140, 138, 150, 160, 155, 300, 420, 390, 360, 340, 330, 335, 345, 350, 360, 365, 380]

        fig, ax = plt.subplots(figsize=(9, 4))
        ax.plot(weeks, signups, color="#2563eb", linewidth=2)
        ax.axvspan(9, 11, color="#fde68a", alpha=0.5)
        ax.annotate("TV advert ran\nweeks 9-11", xy=(10, 420), xytext=(13, 440),
                    arrowprops=dict(arrowstyle="->"), fontsize=9)
        ax.axhline(300, color="gray", linestyle=":", label="target 300/week")
        ax.spines[["top", "right"]].set_visible(False)
        ax.set_title("Sign-ups stayed above target after the TV advert")
        ax.legend(frameon=False)
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['annotate for arrows and notes.', 'axvspan shades periods; axhline marks targets.', 'Remove chart junk.'],
      realWorld: 'Product teams annotate launches and outages on metrics charts so anyone can explain the bumps.',
      check: { q: 'Which shades a time range on the x-axis?', options: ['axhline', 'axvspan', 'annotate', 'legend'], answer: 1, why: 'axvspan spans an x range vertically.' },
      lesson: 'viz-story',
    },
    {
      id: 'distributions',
      level: 'advanced',
      title: 'Comparing distributions: box and violin plots',
      summary: 'Box plots summarise each group\'s median, spread and outliers side by side. Violin plots add the full shape.',
      body: [
        'A box shows the middle 50% (from the 25th to 75th percentile) with a line at the median; whiskers reach typical values and dots mark outliers. Comparing several boxes shows which group is higher and which is more variable.',
        'Averages hide spread: two hospitals with the same average wait can differ hugely in how often patients wait over 3 hours.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        rng = np.random.default_rng(3)
        waits = {
            "Hospital A": rng.normal(45, 10, 200),
            "Hospital B": rng.normal(45, 30, 200).clip(5),
            "Hospital C": rng.gamma(2, 20, 200),
        }
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), sharey=True)
        ax1.boxplot(list(waits.values()))
        ax1.set_xticks([1, 2, 3], list(waits.keys()))
        ax1.set_title("Box plot")
        ax1.set_ylabel("Waiting time (minutes)")
        ax2.violinplot(list(waits.values()), showmedians=True)
        ax2.set_xticks([1, 2, 3], list(waits.keys()))
        ax2.set_title("Violin plot")
        fig.suptitle("Similar average waits, very different experiences")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Box = median, middle 50%, whiskers, outliers.', 'Violins show the full shape.', 'Compare spread, not just averages.'],
      realWorld: 'Health departments compare emergency waiting times across hospitals with box plots.',
      check: { q: 'In a box plot, the line inside the box is the…', options: ['Mean', 'Median', 'Maximum', 'Mode'], answer: 1, why: 'Box plots are built on percentiles; the middle line is the median.' },
    },
    {
      id: 'small-multiples',
      level: 'advanced',
      title: 'Small multiples',
      summary: 'Instead of one crowded chart, draw a grid of small identical charts, one per group, with shared axes for fair comparison.',
      body: [
        '`plt.subplots(rows, cols, sharex=True, sharey=True)` makes a grid where every panel has the same scale, so differences in height are real. Loop over groups and axes together with `zip(groups, axes.flat)`.',
        'Add a faint background line of the overall average to every panel for context.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        months = np.arange(1, 13)
        cities = {"Mumbai": [1, 1, 0, 1, 18, 485, 617, 340, 290, 88, 15, 5],
                  "Chennai": [25, 6, 7, 15, 50, 55, 95, 120, 130, 280, 350, 140],
                  "Delhi": [19, 20, 15, 10, 30, 75, 210, 230, 120, 15, 5, 8],
                  "Kolkata": [15, 25, 35, 60, 140, 300, 330, 330, 290, 150, 20, 5]}
        avg = np.mean(list(cities.values()), axis=0)

        fig, axes = plt.subplots(2, 2, figsize=(9, 6), sharex=True, sharey=True)
        for (city, rain), ax in zip(cities.items(), axes.flat):
            ax.plot(months, avg, color="lightgray", label="average")
            ax.bar(months, rain, color="#0284c7")
            ax.set_title(city)
        fig.suptitle("Approx. monthly rainfall (mm): Chennai peaks in Oct-Nov, the rest in Jul-Aug")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['One small chart per group.', 'sharex/sharey keep comparisons fair.', 'Add a common reference line.'],
      realWorld: 'Climate scientists compare monsoon patterns across cities with small multiples of monthly rainfall.',
      check: { q: 'Why share the y-axis in small multiples?', options: ['To save ink', 'So equal heights mean equal values across panels', 'Matplotlib requires it', 'To hide data'], answer: 1, why: 'Different scales would mislead comparisons.' },
    },
    {
      id: 'heatmaps',
      level: 'advanced',
      title: 'Heatmaps',
      summary: 'A heatmap colours a grid of numbers so patterns across two categories, like hour × weekday, jump out.',
      body: [
        '`ax.imshow(matrix, cmap="YlOrRd")` draws the grid; `fig.colorbar` explains the colours. Label rows and columns with `set_xticks` and `set_yticks`, and print values in cells when the grid is small.',
        'Use a **sequential** colormap (light → dark) for amounts and a **diverging** one (blue ↔ red) for values above and below a midpoint like zero.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        hours = ["8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"]
        rng = np.random.default_rng(2)
        visits = rng.integers(10, 40, (7, 7))
        visits[5:, 2:5] += 60      # weekend afternoons are busy
        visits[:5, 0] += 35        # weekday mornings before work

        fig, ax = plt.subplots(figsize=(7, 5))
        im = ax.imshow(visits, cmap="YlOrRd")
        ax.set_xticks(range(7), hours); ax.set_yticks(range(7), days)
        for i in range(7):
            for j in range(7):
                ax.text(j, i, visits[i, j], ha="center", va="center", fontsize=8)
        fig.colorbar(im, label="Visitors")
        ax.set_title("Gym visitors by day and hour")
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['imshow + colorbar.', 'Sequential maps for amounts; diverging around a midpoint.', 'Label cells when the grid is small.'],
      realWorld: 'Gyms and cafés use visitor heatmaps to plan staff shifts for busy hours.',
      check: { q: 'Temperature anomalies above and below normal suit which colormap?', options: ['Sequential', 'Diverging', 'Random', 'Greyscale'], answer: 1, why: 'Diverging maps centre on a meaningful midpoint.' },
    },
    {
      id: 'styling',
      level: 'advanced',
      title: 'Styles, themes and exporting',
      summary: 'Set fonts, colours and sizes once with rcParams or a style sheet, then save crisp files with savefig.',
      body: [
        '`plt.style.use("ggplot")` or a custom `rcParams` dictionary changes the look of every chart. A house style keeps reports consistent.',
        '`fig.savefig("chart.png", dpi=200, bbox_inches="tight")` saves a sharp image; `.svg` or `.pdf` stay crisp at any size for print and slides.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        plt.rcParams.update({
            "font.size": 11,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.titleweight": "bold",
            "axes.prop_cycle": plt.cycler(color=["#0f766e", "#f59e0b", "#6366f1"]),
        })

        years = [2020, 2021, 2022, 2023, 2024, 2025]
        fig, ax = plt.subplots()
        ax.plot(years, [12, 18, 25, 31, 40, 52], label="Solar")
        ax.plot(years, [30, 31, 33, 34, 36, 37], label="Wind")
        ax.set_title("Installed capacity (GW)")
        ax.legend(frameon=False)
        fig.savefig("capacity.png", dpi=200, bbox_inches="tight")
        plt.show()
        print("Saved capacity.png")
      `,
      lang: 'python',
      run: true,
      points: ['rcParams set a house style once.', 'savefig(dpi=200, bbox_inches="tight") for sharp images.', 'SVG/PDF for print.'],
      realWorld: 'Consultancies ship a Matplotlib style file so every analyst\'s chart matches the brand.',
      check: { q: 'Which keeps a chart sharp at any size?', options: ['PNG at 72 dpi', 'SVG', 'JPEG', 'A screenshot'], answer: 1, why: 'SVG is vector, so it scales without blur.' },
    },
    // ------------------------------------------------------------ expert
    {
      id: 'honesty',
      level: 'expert',
      title: 'Honest charts and perception',
      summary: 'Charts can mislead without a single false number. Know the tricks so you never use them and can spot them.',
      body: [
        'Common distortions: truncated bar axes, dual y-axes that invent correlations, 3D effects, pie charts with many slices, cherry-picked date ranges, and areas scaled by width instead of area. Our eyes judge position best, then length, then angle and area, then colour.',
        'Show context (comparison periods, totals), normalise when sizes differ (per capita, per 1,000), and keep aspect ratios that do not exaggerate slopes.',
      ],
      code: code`
        import matplotlib.pyplot as plt

        brands = ["Brand A", "Brand B"]
        share = [51, 49]

        fig, (bad, good) = plt.subplots(1, 2, figsize=(9, 3.5))
        bad.bar(brands, share, color=["#dc2626", "#9ca3af"])
        bad.set_ylim(48.5, 51.5)
        bad.set_title("Misleading: A looks 3x bigger")
        good.bar(brands, share, color=["#dc2626", "#9ca3af"])
        good.set_ylim(0, 60)
        good.set_title("Honest: nearly level")
        for ax in (bad, good):
            ax.set_ylabel("Market share (%)")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Position and length are read most accurately.', 'Avoid truncated bars, 3D and gratuitous dual axes.', 'Normalise and give context.'],
      realWorld: 'Fact-checkers regularly flag political adverts that use truncated axes to exaggerate small differences.',
      check: { q: 'Which is generally read most accurately?', options: ['Area', 'Angle (pie slices)', 'Position on a common scale', 'Colour intensity'], answer: 2, why: 'Perception research (Cleveland & McGill) ranks position highest.' },
    },
    {
      id: 'uncertainty',
      level: 'expert',
      title: 'Showing uncertainty',
      summary: 'Estimates and forecasts are never exact. Error bars and shaded bands show readers how confident they should be.',
      body: [
        '`ax.errorbar(x, y, yerr=...)` adds error bars (for example a 95% confidence interval). `ax.fill_between(x, low, high, alpha=0.2)` shades a band around a forecast. Always say what the band means (standard deviation, 95% CI, 80% prediction interval).',
        'Uncertainty usually widens the further a forecast reaches. Hiding it makes predictions look more certain than they are.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        days = np.arange(0, 15)
        actual = 30 + 0.8 * days[:8] + np.array([0, 1, -1, 2, 0, 1, -0.5, 1])
        future = np.arange(7, 15)
        forecast = actual[-1] + 0.8 * (future - 7)
        spread = 1.0 + 0.6 * (future - 7)

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.plot(days[:8], actual, "o-", color="black", label="observed")
        ax.plot(future, forecast, "--", color="#2563eb", label="forecast")
        ax.fill_between(future, forecast - 1.96 * spread, forecast + 1.96 * spread,
                        color="#2563eb", alpha=0.15, label="95% interval")
        ax.set_xlabel("Day"); ax.set_ylabel("Max temperature (°C)")
        ax.set_title("Forecast uncertainty grows with time")
        ax.legend(frameon=False)
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['errorbar and fill_between show uncertainty.', 'State what the interval means.', 'Uncertainty grows with forecast distance.'],
      realWorld: 'Hurricane forecasts show a widening "cone of uncertainty" for the storm\'s path.',
      check: { q: 'A forecast band that widens over time means…', options: ['The model is broken', 'We are less certain about further-ahead values', 'Values will increase', 'Nothing'], answer: 1, why: 'Errors compound the further you predict.' },
    },
    {
      id: 'big-data-plots',
      level: 'expert',
      title: 'Plotting large datasets',
      summary: 'With 100,000+ points, scatter plots become ink blots. Use transparency, hexbin, 2D histograms or aggregate first.',
      body: [
        '**Overplotting** hides density: thousands of dots on top of each other look the same as ten. Fixes: `alpha=0.05` for transparency, `ax.hexbin` or `hist2d` to count points per cell, or sampling.',
        'Aggregate before plotting (daily means instead of every reading) and use rasterised output for huge vector files. Libraries like Datashader render billions of points.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        import numpy as np

        rng = np.random.default_rng(0)
        n = 100_000
        distance = rng.gamma(2.0, 3.0, n)
        duration = distance * 3 + rng.normal(0, 4, n) + 5

        fig, (a1, a2) = plt.subplots(1, 2, figsize=(10, 4), sharey=True)
        a1.scatter(distance, duration, s=2)
        a1.set_title("100,000 points: an ink blot")
        hb = a2.hexbin(distance, duration, gridsize=40, cmap="viridis", bins="log", mincnt=1)
        a2.set_title("Hexbin shows where trips concentrate")
        fig.colorbar(hb, ax=a2, label="trips (log)")
        for a in (a1, a2):
            a.set_xlabel("Distance (km)")
        a1.set_ylabel("Duration (min)")
        fig.tight_layout()
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Overplotting hides density.', 'Use alpha, hexbin or hist2d.', 'Aggregate or sample before plotting.'],
      realWorld: 'Taxi and delivery companies use density maps of millions of trips to place depots and drivers.',
      check: { q: 'Best fix for a scatter plot of 1 million overlapping points?', options: ['Bigger dots', 'A hexbin or 2D histogram', 'A pie chart', '3D effects'], answer: 1, why: 'They show how many points fall in each area.' },
    },
    {
      id: 'interactive',
      level: 'expert',
      title: 'Interactive and web visualisation',
      summary: 'Matplotlib makes static images. For hover, zoom and dashboards, use Plotly, Altair (Vega-Lite), Bokeh, D3 or BI tools.',
      body: [
        '**Plotly** and **Bokeh** produce interactive HTML charts from Python. **Altair** describes charts declaratively (data + encodings) using Vega-Lite. **D3.js** gives web developers full control. Dashboards can be built with Streamlit, Dash or tools like Power BI, Tableau and Looker.',
        'Interactivity should answer follow-up questions (filter, hover for exact values), not decorate. The design principles from static charts still apply.',
      ],
      code: code`
        # Plotly Express: interactive with hover and zoom
        import plotly.express as px
        df = px.data.gapminder().query("year == 2007")
        fig = px.scatter(df, x="gdpPercap", y="lifeExp", size="pop", color="continent",
                         hover_name="country", log_x=True)
        fig.show()

        # Altair: declarative grammar of graphics
        import altair as alt
        alt.Chart(df).mark_circle().encode(
            x=alt.X("gdpPercap", scale=alt.Scale(type="log")),
            y="lifeExp", color="continent", tooltip=["country", "pop"]
        ).interactive()
      `,
      lang: 'python',
      note: 'Shown, not run: Plotly and Altair are not loaded in the browser here.',
      points: ['Plotly/Bokeh/Altair for interactive Python charts.', 'D3 for custom web graphics.', 'Interactivity should answer questions.'],
      realWorld: 'Public health dashboards during the pandemic used interactive charts so people could filter to their own district.',
      check: { q: 'Which library is declarative, built on Vega-Lite?', options: ['Matplotlib', 'Altair', 'NumPy', 'Seaborn'], answer: 1, why: 'Altair describes charts as data plus encodings.' },
    },
    {
      id: 'chart-system',
      level: 'expert',
      title: 'Reusable chart functions and a chart style guide',
      summary: 'Teams standardise charts as functions with sensible defaults and a written style guide, so every report looks consistent and correct.',
      body: [
        'Wrap common charts in functions that take data and options and return the figure, applying house colours, number formats and source notes automatically. Test them like any other code.',
        'A style guide decides: palette (categorical, sequential, diverging), fonts, how to format money and dates, when to use each chart type, and accessibility rules like minimum contrast.',
      ],
      code: code`
        import matplotlib.pyplot as plt
        from matplotlib.ticker import FuncFormatter

        BRAND = ["#0f766e", "#94a3b8"]

        def trend_chart(x, y, title, unit="", highlight_last=True, source=None):
            fig, ax = plt.subplots(figsize=(7, 3.5))
            ax.plot(x, y, color=BRAND[0], linewidth=2)
            if highlight_last:
                ax.scatter([x[-1]], [y[-1]], color=BRAND[0], zorder=3)
                ax.annotate(f"{y[-1]:,}{unit}", (x[-1], y[-1]), xytext=(6, 0), textcoords="offset points", va="center")
            ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:,.0f}{unit}"))
            ax.spines[["top", "right"]].set_visible(False)
            ax.set_title(title, loc="left", fontweight="bold")
            if source:
                fig.text(0.01, 0.01, f"Source: {source}", fontsize=8, color="gray")
            return fig, ax

        trend_chart(["Q1", "Q2", "Q3", "Q4"], [1200, 1850, 2400, 3100], "App downloads keep climbing", source="Store console")
        plt.show()
      `,
      lang: 'python',
      run: true,
      points: ['Wrap house charts in functions.', 'Write a style guide for colour, type and formats.', 'Defaults should make the right thing easy.'],
      realWorld: 'The Financial Times and The Economist publish internal chart style guides so hundreds of journalists chart consistently.',
      check: { q: 'Main benefit of a team chart function library?', options: ['Bigger files', 'Consistent, correct charts with less effort', 'Faster CPUs', 'No need for data'], answer: 1, why: 'Good defaults are applied every time.' },
    },
  ],
};
