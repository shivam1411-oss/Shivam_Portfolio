import { B, Callout, F, H, P, Term } from '../ui';
import PyRunner from '../python/PyRunner';
import { py } from '../python/py';

// "Charts with Matplotlib": the standard Python charting library. Charts are drawn in the worker
// and shown as images under the output; tests inspect the figure and axes objects.

const modules = [
  { id: 'viz-basics', title: 'Drawing charts', level: 'Beginner', blurb: 'Figures and axes, the core chart types, and choosing the right one.' },
  { id: 'viz-present', title: 'Charts for reports', level: 'Intermediate', blurb: 'Plotting straight from pandas, several charts in one figure, and charts that make a point.' },
];

const lessons = [
  {
    id: 'viz-first',
    module: 'viz-basics',
    title: 'Figures, axes and your first chart',
    minutes: 10,
    goals: ['Create a figure and axes with plt.subplots', 'Draw line and bar charts', 'Add a title, axis labels and a legend'],
    body: () => (
      <>
        <P>
          <Term id="matplotlib">Matplotlib</Term> draws a chart on <B>axes</B> (the plotting area) inside a <B>figure</B> (the whole image). Always start with{' '}
          <F>fig, ax = plt.subplots()</F> and then call methods on <F>ax</F>: it scales cleanly to several charts later.
        </P>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
collected = [61.2, 57.7, 52.5, 51.0, 52.2, 57.2]       # ₹ crore

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(months, collected, marker="o", label="Collected")
ax.set_title("Monthly collections")
ax.set_xlabel("Month")
ax.set_ylabel("₹ crore")
ax.legend()
plt.show()
`}
        />
        <H>Bar charts compare categories</H>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt

buckets = ["Current", "1-30", "31-60", "61-90", "90+"]
accounts = [4, 5, 5, 3, 3]

fig, ax = plt.subplots(figsize=(7, 3.5))
bars = ax.bar(buckets, accounts, color="#0f8a7e")
ax.bar_label(bars)                         # numbers on top of the bars
ax.set_title("Accounts by DPD bucket")
ax.set_ylabel("Accounts")
plt.show()
`}
        />
        <Callout title="plt.show()">
          On your computer, <F>plt.show()</F> opens a window. Here charts are collected after your code runs and shown below the output, so it is optional, but keeping it makes
          your code work in both places.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'viz-bar',
        title: 'Collections by channel',
        prompt: 'Draw a bar chart of the totals below on ax: title "Collections by channel", y-axis label "₹", and one bar per channel in the given order.',
        starter: py`
import matplotlib.pyplot as plt

channels = ["UPI", "NACH", "Cash", "Card"]
totals = [182340, 96210, 31880, 25400]

fig, ax = plt.subplots()
# draw here
plt.show()
`,
        tests: [
          { name: 'one bar per channel with the right heights', code: py`
heights = [p.get_height() for p in ax.patches]
assert heights == totals, f"bar heights {heights}"
labels = [t.get_text() for t in ax.get_xticklabels()]
assert labels == channels, f"x labels {labels}"
` },
          { name: 'title is "Collections by channel"', code: py`assert ax.get_title() == "Collections by channel", f"title is {ax.get_title()!r}"` },
          { name: 'y label is "₹"', code: py`assert ax.get_ylabel() == "₹", f"y label is {ax.get_ylabel()!r}"` },
        ],
        hint: 'ax.bar(channels, totals); ax.set_title("Collections by channel"); ax.set_ylabel("₹")',
        solution: py`
import matplotlib.pyplot as plt

channels = ["UPI", "NACH", "Cash", "Card"]
totals = [182340, 96210, 31880, 25400]

fig, ax = plt.subplots()
ax.bar(channels, totals, color="#0f8a7e")
ax.set_title("Collections by channel")
ax.set_ylabel("₹")
plt.show()
`,
      },
    ],
    quiz: [
      { q: 'In fig, ax = plt.subplots(), what is ax?', options: ['The whole image', 'The plotting area you draw on', 'A colour', 'The data'], answer: 1, why: 'The figure holds one or more axes; you draw on axes.' },
      { q: 'Which chart compares values across categories?', options: ['Line', 'Bar', 'Pie only', 'Scatter'], answer: 1, why: 'Bars compare categories; lines show change over an ordered axis like time.' },
    ],
  },
  {
    id: 'viz-choose',
    module: 'viz-basics',
    title: 'Choosing the right chart',
    minutes: 12,
    goals: ['Match the question to the chart: trend, comparison, distribution, relationship', 'Draw histograms and scatter plots', 'Format axes as rupees and percentages'],
    body: () => (
      <>
        <P>Pick the chart from the question you are answering:</P>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1 marker:text-accent">
          <li>
            <B>How did it change over time?</B> Line.
          </li>
          <li>
            <B>Which is bigger?</B> Bar (horizontal bars when labels are long).
          </li>
          <li>
            <B>How is it spread out?</B> Histogram.
          </li>
          <li>
            <B>Do two things move together?</B> Scatter.
          </li>
        </ul>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
fig, (left, right) = plt.subplots(1, 2, figsize=(10, 3.5))

left.hist(acc["dpd"], bins=[0, 30, 60, 90, 120, 150], color="#5b61d6", edgecolor="white")
left.set_title("How overdue are accounts?")
left.set_xlabel("Days past due")

right.scatter(acc["balance"] / acc["credit_limit"], acc["dpd"], color="#0f8a7e")
right.set_title("Utilisation vs DPD")
right.set_xlabel("Utilisation")
right.set_ylabel("DPD")
plt.show()
`}
        />
        <H>Readable axes</H>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.ticker import FuncFormatter, PercentFormatter

m = pd.read_csv("data/monthly.csv")
m["cei"] = (m["opening_ar"] + m["billed"] - m["closing_ar"]) / (m["opening_ar"] + m["billed"] - m["closing_current"])

fig, (a, b) = plt.subplots(1, 2, figsize=(10, 3.2))
a.plot(m["month"], m["cei"], marker="o")
a.yaxis.set_major_formatter(PercentFormatter(1.0))          # 0.72 -> 72%
a.set_title("Collection efficiency")

b.bar(m["month"], m["closing_ar"], color="#0f8a7e")
b.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"₹{v:.0f} Cr"))   # values are in crore
b.set_title("Closing receivables")
plt.show()
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'viz-cei',
        title: 'A CEI trend chart',
        prompt: 'From data/monthly.csv compute CEI (as a fraction, e.g. 0.69) per month and plot it as a line on ax with marker="o". Format the y axis as percentages with PercentFormatter(1.0) and set the title "CEI by month".',
        starter: py`
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
import pandas as pd

m = pd.read_csv("data/monthly.csv")
m["cei"] = None   # (opening + billed - closing) / (opening + billed - closing_current)

fig, ax = plt.subplots()
plt.show()
`,
        tests: [
          { name: 'one line with the 6 CEI values', code: py`
import pandas as pd, numpy as np
r = pd.read_csv("data/monthly.csv")
ref = ((r["opening_ar"] + r["billed"] - r["closing_ar"]) / (r["opening_ar"] + r["billed"] - r["closing_current"])).to_numpy()
assert len(ax.lines) == 1, f"{len(ax.lines)} lines"
y = np.asarray(ax.lines[0].get_ydata(), dtype=float)
assert np.allclose(y, ref), f"y values {y}"
` },
          { name: 'markers are on', code: py`assert ax.lines[0].get_marker() == "o", f"marker is {ax.lines[0].get_marker()!r}"` },
          { name: 'y axis shows percentages', code: py`
from matplotlib.ticker import PercentFormatter
assert isinstance(ax.yaxis.get_major_formatter(), PercentFormatter), "use PercentFormatter(1.0)"
` },
          { name: 'title is "CEI by month"', code: py`assert ax.get_title() == "CEI by month", f"title is {ax.get_title()!r}"` },
        ],
        hint: 'm["cei"] = (m["opening_ar"] + m["billed"] - m["closing_ar"]) / (m["opening_ar"] + m["billed"] - m["closing_current"]); ax.plot(m["month"], m["cei"], marker="o"); ax.yaxis.set_major_formatter(PercentFormatter(1.0))',
        solution: py`
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
import pandas as pd

m = pd.read_csv("data/monthly.csv")
m["cei"] = (m["opening_ar"] + m["billed"] - m["closing_ar"]) / (m["opening_ar"] + m["billed"] - m["closing_current"])

fig, ax = plt.subplots()
ax.plot(m["month"], m["cei"], marker="o")
ax.yaxis.set_major_formatter(PercentFormatter(1.0))
ax.set_title("CEI by month")
plt.show()
`,
      },
    ],
    quiz: [
      { q: 'You want to see how balances are spread across accounts. Use…', options: ['A line chart', 'A histogram', 'A pie chart', 'A table'], answer: 1, why: 'Histograms show distributions.' },
      { q: 'Does a higher utilisation go with a higher DPD? Use…', options: ['Bar', 'Scatter', 'Histogram', 'Line'], answer: 1, why: 'Scatter plots show whether two numbers move together.' },
    ],
  },
  {
    id: 'viz-pandas',
    module: 'viz-present',
    title: 'Plotting from pandas and multiple charts',
    minutes: 12,
    goals: ['Plot straight from a DataFrame with .plot', 'Draw grouped and stacked bars from a pivot table', 'Lay out several charts with subplots'],
    body: () => (
      <>
        <P>
          Every DataFrame and Series has a <F>.plot()</F> method that calls Matplotlib for you, using the index as the x axis and each column as a series. Pass{' '}
          <F>ax=</F> to control where it draws.
        </P>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
pay = pd.read_csv("data/payments.csv")
j = pay.merge(acc[["account_id", "product"]], on="account_id")
j["month"] = j["date"].str[:7]
table = j.pivot_table(index="month", columns="product", values="amount", aggfunc="sum", fill_value=0)

fig, (a, b) = plt.subplots(1, 2, figsize=(11, 3.6))
table.plot(kind="bar", ax=a, rot=0, title="By product (grouped)")
table.plot(kind="bar", stacked=True, ax=b, rot=0, title="By product (stacked)")
b.legend(fontsize=8)
plt.show()
`}
        />
        <H>A small dashboard</H>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt
import pandas as pd

acc = pd.read_csv("data/accounts.csv")
fig, axes = plt.subplots(2, 2, figsize=(10, 6))
acc.groupby("agent")["balance"].sum().sort_values().plot(kind="barh", ax=axes[0, 0], title="Balance by agent")
acc["product"].value_counts().plot(kind="bar", ax=axes[0, 1], rot=0, title="Accounts by product")
acc.groupby("city")["dpd"].mean().plot(kind="bar", ax=axes[1, 0], rot=0, title="Average DPD by city")
acc.plot(kind="scatter", x="balance", y="dpd", ax=axes[1, 1], title="Balance vs DPD")
fig.tight_layout()                       # stop titles and labels overlapping
plt.show()
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'viz-dashboard',
        title: 'A two-chart summary',
        prompt:
          'Create fig with two side-by-side axes (left, right). On left, draw a horizontal bar chart (kind="barh") of total balance per agent, sorted ascending, titled "Balance by agent". On right, a bar chart of the number of accounts per city (value_counts, sorted by city name), titled "Accounts by city".',
        starter: py`
import matplotlib.pyplot as plt
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

fig, (left, right) = plt.subplots(1, 2, figsize=(10, 3.5))
plt.show()
`,
        tests: [
          { name: 'two axes in the figure', code: py`assert len(fig.axes) == 2, f"{len(fig.axes)} axes"` },
          { name: 'left: balance by agent, ascending, horizontal', code: py`
ref = acc.groupby("agent")["balance"].sum().sort_values()
widths = [p.get_width() for p in left.patches]
assert widths == ref.tolist(), f"bar widths {widths}"
assert left.get_title() == "Balance by agent", f"title {left.get_title()!r}"
` },
          { name: 'right: accounts per city, sorted by name', code: py`
ref = acc["city"].value_counts().sort_index()
heights = [p.get_height() for p in right.patches]
assert heights == ref.tolist(), f"bar heights {heights}"
assert [t.get_text() for t in right.get_xticklabels()] == list(ref.index), "cities not sorted by name"
assert right.get_title() == "Accounts by city", f"title {right.get_title()!r}"
` },
        ],
        hint:
          'acc.groupby("agent")["balance"].sum().sort_values().plot(kind="barh", ax=left, title="Balance by agent"); acc["city"].value_counts().sort_index().plot(kind="bar", ax=right, rot=0, title="Accounts by city")',
        solution: py`
import matplotlib.pyplot as plt
import pandas as pd

acc = pd.read_csv("data/accounts.csv")

fig, (left, right) = plt.subplots(1, 2, figsize=(10, 3.5))
acc.groupby("agent")["balance"].sum().sort_values().plot(kind="barh", ax=left, title="Balance by agent")
acc["city"].value_counts().sort_index().plot(kind="bar", ax=right, rot=0, title="Accounts by city")
fig.tight_layout()
plt.show()
`,
      },
    ],
    quiz: [
      { q: 'In df.plot(kind="bar"), what goes on the x axis?', options: ['The first column', 'The index', 'Random order', 'The column names'], answer: 1, why: 'pandas plots the index along x and each column as a series.' },
      { q: 'What does fig.tight_layout() fix?', options: ['Colours', 'Overlapping titles and labels between subplots', 'Wrong data', 'File size'], answer: 1, why: 'It adjusts spacing so subplots do not collide.' },
    ],
  },
  {
    id: 'viz-story',
    module: 'viz-present',
    title: 'Charts that make a point',
    minutes: 12,
    goals: ['Highlight what matters and grey out the rest', 'Annotate key points and add reference lines', 'Remove chart clutter for clean report visuals'],
    body: () => (
      <>
        <P>
          A chart for a management pack should answer one question at a glance. Highlight the answer, label it, and remove everything that does not help: that is the
          difference between a chart and an insight.
        </P>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt

buckets = ["Current", "1-30", "31-60", "61-90", "90+"]
roll = [0.10, 0.22, 0.31, 0.45, 0.60]      # share rolling to the next bucket
colours = ["#c7cbd1"] * 5
colours[2] = "#d9480f"                       # the one to talk about

fig, ax = plt.subplots(figsize=(7, 3.6))
bars = ax.bar(buckets, roll, color=colours)
ax.bar_label(bars, labels=[f"{r:.0%}" for r in roll])
ax.axhline(0.25, color="#555", linestyle="--", linewidth=1)
ax.annotate("Target 25%", xy=(4.4, 0.25), xytext=(4.4, 0.28), ha="right", fontsize=9)
ax.set_title("31-60 is rolling forward above target", loc="left", fontweight="bold")
for side in ["top", "right", "left"]:
    ax.spines[side].set_visible(False)       # declutter
ax.set_yticks([])
plt.show()
`}
        />
        <H>Saving charts for reports</H>
        <PyRunner
          code={py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot([1, 2, 3], [3, 1, 2])
fig.savefig("chart.png", dpi=200, bbox_inches="tight")   # high-resolution file for slides
import os
print("saved", os.path.getsize("chart.png"), "bytes")
`}
        />
        <Callout title="A checklist for every chart">
          One message in the title. Units on the axes. Highlight colour used once. Direct labels instead of a legend where possible. No 3-D, no unnecessary gridlines.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'viz-highlight',
        title: 'Highlight the worst agent',
        prompt:
          'Using the given roll rates, draw a bar per agent on ax where the agent with the highest roll rate is red ("#d9480f") and every other bar is grey ("#c7cbd1"). Add a dashed horizontal line at the average roll rate, and set the title to "<worst agent> has the highest roll rate".',
        starter: py`
import matplotlib.pyplot as plt

agents = ["Kiran", "Neha", "Amit", "Zoya"]
roll = [0.18, 0.27, 0.21, 0.35]

fig, ax = plt.subplots()
plt.show()
`,
        tests: [
          { name: 'the worst agent is red, the rest grey', code: py`
from matplotlib.colors import to_hex
colours = [to_hex(p.get_facecolor()) for p in ax.patches]
assert colours == ["#c7cbd1", "#c7cbd1", "#c7cbd1", "#d9480f"], f"colours {colours}"
` },
          { name: 'a dashed line at the average', code: py`
lines = [l for l in ax.lines if l.get_linestyle() == "--"]
assert lines, "no dashed line found"
y = lines[0].get_ydata()
assert abs(y[0] - sum(roll) / len(roll)) < 1e-9, f"line at {y[0]}"
` },
          { name: 'title names Zoya', code: py`assert ax.get_title() == "Zoya has the highest roll rate", f"title {ax.get_title()!r}"` },
          { name: 'does not hard-code the worst agent', code: py`assert "max(" in SOURCE or "index(" in SOURCE or "argmax" in SOURCE or "idxmax" in SOURCE, "find the worst agent with max()/index() rather than typing it"` },
        ],
        hint:
          'worst = agents[roll.index(max(roll))]; colours = ["#d9480f" if a == worst else "#c7cbd1" for a in agents]; ax.bar(agents, roll, color=colours); ax.axhline(sum(roll) / len(roll), linestyle="--"); ax.set_title(f"{worst} has the highest roll rate")',
        solution: py`
import matplotlib.pyplot as plt

agents = ["Kiran", "Neha", "Amit", "Zoya"]
roll = [0.18, 0.27, 0.21, 0.35]

worst = agents[roll.index(max(roll))]
colours = ["#d9480f" if a == worst else "#c7cbd1" for a in agents]

fig, ax = plt.subplots()
ax.bar(agents, roll, color=colours)
ax.axhline(sum(roll) / len(roll), color="#555", linestyle="--", linewidth=1)
ax.set_title(f"{worst} has the highest roll rate")
plt.show()
`,
      },
    ],
    quiz: [
      { q: 'Best way to make one bar stand out?', options: ['Make every bar a different colour', 'Grey for the rest, one strong colour for the bar that matters', '3-D bars', 'A bigger legend'], answer: 1, why: 'Contrast directs attention to the message.' },
      { q: 'What should the title of a report chart say?', options: ['Only the variable name', 'The message the chart supports', 'Nothing', 'The file name'], answer: 1, why: 'An action title tells the reader what to take away.' },
    ],
  },
];

export const vizCourse = {
  id: 'viz',
  title: 'Charts with Matplotlib',
  tagline: 'Turn analysis into charts that make a point',
  blurb:
    'Python\'s standard charting library: figures and axes, choosing the right chart, rupee and percentage axes, plotting from pandas, multi-chart dashboards and report-ready visuals. Best after the first pandas modules. Loads Matplotlib (about 9 MB) the first time.',
  levels: 'Beginner → Intermediate',
  icon: 'viz',
  usesPython: true,
  modules,
  lessons,
};
