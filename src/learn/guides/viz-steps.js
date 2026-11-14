// Step-by-step material for the Matplotlib lessons: same shape as python-steps.js (terms, process, steps).
// `practice` is the code the practice box starts with, so the steps can go straight to the idea being taught.
// Attached to the lessons in content/ (see withGuide); checked by scripts/check-steps.mjs.

const ADD = 'Add this line under what you have, then press Run.';
const ADD_LINES = 'Add these lines under what you have, then press Run.';

const PLT = `import matplotlib.pyplot as plt
`;
const PLT_NOTE = 'The practice box already has the line that brings in Matplotlib under the short name plt. Leave it there. ';

export const vizSteps = {
  'viz-first': {
    terms: ['matplotlib', 'figure', 'axes', 'chart', 'list'],
    process: {
      title: 'How a chart is put together',
      stages: [
        ['Make a figure and axes', 'fig, ax = plt.subplots() gives you a blank page (the figure) with one plotting area on it (the axes).'],
        ['Draw on the axes', 'ax.plot(x, y) draws a line; ax.bar(x, y) draws bars. Each call adds to the same area.'],
        ['Label it', 'ax.set_title, ax.set_xlabel and ax.set_ylabel add the words.'],
        ['Add a legend if there are several series', 'Give each one a label=, then call ax.legend().'],
        ['Show it', 'plt.show() displays the finished figure under your code.'],
      ],
    },
    practice: PLT,
    steps: [
      { do: PLT_NOTE + 'Under it, make a blank chart.', code: 'fig, ax = plt.subplots()\nplt.show()', see: 'An empty chart: a white box with numbers along the bottom and left edges.', chart: true },
      { do: 'Draw a line. Put these two lines above plt.show() (click at the start of that line, type them, and press Enter).', code: 'months = ["Jan", "Feb", "Mar", "Apr"]\nax.plot(months, [62, 64, 61, 67])', see: 'A line that rises, dips in March, and rises again.', chart: true, insertAt: 2 },
      { do: 'Add a title and axis labels, again above plt.show().', code: 'ax.set_title("Collection efficiency")\nax.set_ylabel("CEI %")', see: 'The same line with a title on top and CEI % down the left side.', chart: true, insertAt: 4 },
      { do: 'Add a second line and a legend. Change the ax.plot line to give it a label, then add the two lines below above plt.show().', code: 'ax.plot(months, [60, 60, 62, 63], label="Target")\nax.legend()', see: 'Two lines in different colours, and a small box saying which is Actual and which is Target.', chart: true, insertAt: 6, edit: ['ax.plot(months, [62, 64, 61, 67])', 'ax.plot(months, [62, 64, 61, 67], label="Actual")'] },
    ],
  },
  'viz-choose': {
    terms: ['chart', 'histogram', 'figure', 'axes'],
    process: {
      title: 'How to choose a chart',
      stages: [
        ['Ask what the question is', 'A chart answers one question. Name it before you draw.'],
        ['Change over time: a line', 'Months along the bottom, the measure up the side.'],
        ['Comparing categories: bars', 'One bar per product, city or agent.'],
        ['How values are spread: a histogram', 'It counts how many values fall into each range.'],
        ['How two numbers relate: a scatter plot', 'One dot per account, positioned by both numbers.'],
      ],
    },
    practice: PLT + 'import pandas as pd\n\naccounts = pd.read_csv("data/accounts.csv")\n',
    steps: [
      { do: 'The practice box already brings in Matplotlib and loads the accounts table. Under those lines, compare categories with bars.', code: 'totals = accounts.groupby("product")["balance"].sum()\nfig, ax = plt.subplots()\nax.bar(totals.index, totals.values)\nplt.show()', see: 'Three bars, one per product. Personal loan is by far the tallest.', chart: true },
      { do: 'See how days past due are spread with a histogram. ' + ADD_LINES, code: 'fig, ax = plt.subplots()\nax.hist(accounts["dpd"], bins=6)\nax.set_xlabel("Days past due")\nplt.show()', see: 'A second chart: bars showing how many accounts fall into each range of days past due.', chart: true },
      { do: 'See how two numbers relate with a scatter plot. ' + ADD_LINES, code: 'fig, ax = plt.subplots()\nax.scatter(accounts["credit_limit"], accounts["balance"])\nax.set_xlabel("Credit limit")\nax.set_ylabel("Balance")\nplt.show()', see: 'A third chart: one dot per account. Dots further right (bigger limits) tend to sit higher (bigger balances).', chart: true },
    ],
  },
  'viz-pandas': {
    terms: ['dataframe', 'figure', 'axes', 'chart', 'pivot'],
    process: {
      title: 'How pandas draws a chart for you',
      stages: [
        ['Shape the data first', 'groupby or pivot_table gives a small table: categories as the row labels, numbers in the columns.'],
        ['Call .plot on it', 'table.plot(kind="bar", ax=ax)'],
        ['pandas reads the labels', 'Row labels go along the bottom; each column becomes its own set of bars or its own line.'],
        ['Matplotlib does the drawing', 'So everything from the first lesson (titles, labels, legend) still works on ax.'],
      ],
    },
    practice: PLT + 'import pandas as pd\n\naccounts = pd.read_csv("data/accounts.csv")\n',
    steps: [
      { do: 'The practice box already brings in Matplotlib and loads the accounts table. Under those lines, plot a grouped total straight from pandas.', code: 'fig, ax = plt.subplots()\naccounts.groupby("city")["balance"].sum().plot(kind="bar", ax=ax)\nplt.show()', see: 'Five bars, one per city, with the city names along the bottom.', chart: true },
      { do: 'Draw one set of bars per product from a pivot table. ' + ADD_LINES, code: 'table = accounts.pivot_table(index="city", columns="product", values="balance", aggfunc="sum", fill_value=0)\nfig, ax = plt.subplots()\ntable.plot(kind="bar", stacked=True, ax=ax)\nplt.show()', see: 'A second chart: one bar per city, split into coloured sections for each product, with a legend.', chart: true },
      { do: 'Put two charts side by side. ' + ADD_LINES, code: 'fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3))\naccounts["product"].value_counts().plot(kind="bar", ax=left)\naccounts["dpd"].plot(kind="hist", ax=right)\nplt.show()', see: 'A third figure holding two charts next to each other: counts per product, and the spread of days past due.', chart: true },
    ],
  },
  'viz-story': {
    terms: ['chart', 'figure', 'axes'],
    process: {
      title: 'How to make a chart say one thing',
      stages: [
        ['Decide the message', 'For example: "Personal loans hold most of the balance."'],
        ['Grey out everything else', 'Draw all the bars in grey.'],
        ['Colour only what matters', 'Give the one bar you are talking about a strong colour.'],
        ['Say it in the title', 'Write the conclusion, not just the name of the measure.'],
        ['Remove clutter', 'Hide the top and right borders and anything else that carries no information.'],
      ],
    },
    practice: PLT,
    steps: [
      { do: PLT_NOTE + 'Under it, draw plain bars.', code: 'products = ["Card", "Consumer durable", "Personal loan"]\nbalance = [3.8, 1.5, 11.9]\nfig, ax = plt.subplots()\nbars = ax.bar(products, balance, color="lightgrey")\nplt.show()', see: 'Three grey bars.', chart: true },
      { do: 'Colour the one bar that matters. Add this line above plt.show().', code: 'bars[2].set_color("teal")', see: 'The Personal loan bar is now teal; the other two stay grey.', chart: true, insertAt: 5 },
      { do: 'State the message in the title, above plt.show().', code: 'ax.set_title("Personal loans hold most of the balance")', see: 'The same chart with the conclusion written across the top.', chart: true, insertAt: 6 },
      { do: 'Remove the clutter, above plt.show().', code: 'ax.spines[["top", "right"]].set_visible(False)', see: 'The box around the chart is gone on the top and right sides, leaving a cleaner picture.', chart: true, insertAt: 7 },
    ],
  },
};
