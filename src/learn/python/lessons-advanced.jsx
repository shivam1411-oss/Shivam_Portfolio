import { B, Callout, F, H, P, Term } from '../ui';
import PyRunner from './PyRunner';
import { py } from './lessons-beginner';

// Python course, modules 4–6 (intermediate to advanced).

export const advancedModules = [
  { id: 'functions', title: 'Functions', level: 'Intermediate', blurb: 'Package code into reusable functions, pass data in and out, and handle errors.' },
  { id: 'organising', title: 'Organising code', level: 'Intermediate', blurb: 'The standard library, files, CSV and JSON, and your own classes.' },
  { id: 'advanced', title: 'Advanced Python', level: 'Advanced', blurb: 'Inheritance, dataclasses, generators, decorators, type hints and testing, then a project.' },
];

export const advancedLessons = [
  // ---------------------------------------------------------------- Functions
  {
    id: 'functions',
    module: 'functions',
    title: 'Writing functions',
    minutes: 12,
    goals: ['Define functions with def and return a result', 'Use default and keyword arguments', 'Know the difference between print and return'],
    body: () => (
      <>
        <P>
          A <Term id="pyfunction">function</Term> is a named, reusable block of code. You define it once with <F>def</F> and call it whenever you need it. Values passed in
          are <B>parameters</B>; <F>return</F> sends a result back.
        </P>
        <PyRunner
          code={py`
def collection_rate(collected, due):
    """Share of the due amount that was collected, from 0 to 1."""
    if due == 0:
        return 0
    return collected / due

r = collection_rate(64500, 100000)
print(f"{r:.1%}")
print(f"{collection_rate(30, 40):.0%}")
`}
        />
        <H>Defaults and keyword arguments</H>
        <PyRunner
          code={py`
def reminder(name, amount, channel="SMS", urgent=False):
    tone = "URGENT: " if urgent else ""
    return f"{tone}{channel} to {name}: please pay ₹{amount:,}"

print(reminder("Asha", 4500))                           # uses the defaults
print(reminder("Ravi", 12000, channel="WhatsApp"))      # keyword argument
print(reminder(amount=800, name="Meena", urgent=True))  # any order by keyword
`}
        />
        <H>return is not print</H>
        <P>
          <F>print</F> only shows a value on screen. <F>return</F> hands it back to the code that called the function, so it can be stored, compared or used in maths. A
          function without <F>return</F> gives back <F>None</F>.
        </P>
        <PyRunner
          code={py`
def shows(x):
    print(x * 2)

def gives(x):
    return x * 2

a = shows(5)   # prints 10, but a is None
b = gives(5)   # prints nothing, b is 10
print("a =", a, "| b =", b, "| b + 1 =", b + 1)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'emi',
        title: 'EMI calculator',
        prompt:
          'Write emi(principal, annual_rate, months) that returns the monthly instalment rounded to 2 decimals, using EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1) where r = annual_rate ÷ 12. If annual_rate is 0, return principal ÷ months.',
        starter: py`
def emi(principal, annual_rate, months):
    pass  # replace with your code

print(emi(100000, 0.12, 12))
`,
        tests: [
          { name: 'emi(100000, 0.12, 12) == 8884.88', code: py`assert emi(100000, 0.12, 12) == 8884.88, f"got {emi(100000, 0.12, 12)!r}"` },
          { name: 'emi(500000, 0.09, 60) == 10379.18', code: py`assert emi(500000, 0.09, 60) == 10379.18, f"got {emi(500000, 0.09, 60)!r}"` },
          { name: 'Zero interest: emi(12000, 0, 12) == 1000', code: py`assert emi(12000, 0, 12) == 1000, f"got {emi(12000, 0, 12)!r}"` },
        ],
        hint: 'r = annual_rate / 12. If r == 0: return round(principal / months, 2). Otherwise growth = (1 + r) ** months and return round(principal * r * growth / (growth - 1), 2).',
        solution: py`
def emi(principal, annual_rate, months):
    r = annual_rate / 12
    if r == 0:
        return round(principal / months, 2)
    growth = (1 + r) ** months
    return round(principal * r * growth / (growth - 1), 2)

print(emi(100000, 0.12, 12))
`,
      },
      {
        id: 'bucket-fn',
        title: 'Bucket as a function',
        prompt: 'Turn the DPD bucket logic into a function bucket(dpd) that returns "Current", "1-30", "31-60", "61-90" or "90+".',
        starter: py`
def bucket(dpd):
    return "Current"

print(bucket(45))
`,
        tests: [
          { name: 'bucket(0) == "Current"', code: py`assert bucket(0) == "Current", f"got {bucket(0)!r}"` },
          { name: 'Boundaries 1, 30, 31, 60, 61, 90, 91', code: py`
got = [bucket(d) for d in (1, 30, 31, 60, 61, 90, 91)]
assert got == ["1-30", "1-30", "31-60", "31-60", "61-90", "61-90", "90+"], f"got {got}"
` },
        ],
        hint: 'Use if / elif with return in each branch; once a return runs, the function stops.',
        solution: py`
def bucket(dpd):
    if dpd == 0:
        return "Current"
    if dpd <= 30:
        return "1-30"
    if dpd <= 60:
        return "31-60"
    if dpd <= 90:
        return "61-90"
    return "90+"

print(bucket(45))
`,
      },
    ],
    quiz: [
      { q: 'What does a function return if it has no return statement?', options: ['0', 'An empty string', 'None', 'An error'], answer: 2, why: 'Python returns None by default.' },
      { q: 'def f(a, b=2): return a * b. What is f(5)?', options: ['5', '7', '10', 'Error: b is missing'], answer: 2, why: 'b takes its default of 2, so 5 × 2.' },
    ],
  },
  {
    id: 'more-functions',
    module: 'functions',
    title: 'More about functions',
    minutes: 12,
    goals: ['Understand local and global scope', 'Accept any number of arguments with *args and **kwargs', 'Use lambda with sorted(), and recursion'],
    body: () => (
      <>
        <H>Scope</H>
        <P>Variables created inside a function are <B>local</B>: they exist only while it runs. Pass values in as parameters and get results out with return.</P>
        <PyRunner
          code={py`
rate = 0.18          # global: visible everywhere

def interest(balance):
    monthly = balance * rate / 12   # local
    return monthly

print(interest(10000))
print("monthly" in globals())       # False: it only lived inside the function
`}
        />
        <H>*args and **kwargs</H>
        <PyRunner
          code={py`
def total(*amounts):            # any number of positional arguments, as a tuple
    return sum(amounts)

def describe(**fields):         # any keyword arguments, as a dict
    return ", ".join(f"{k}={v}" for k, v in fields.items())

print(total(100, 250, 75))
print(describe(id="ACC1", dpd=12, channel="SMS"))

values = [1, 2, 3]
print(total(*values))           # * unpacks a list into arguments
`}
        />
        <H>lambda and sorting by a key</H>
        <P>
          A <F>lambda</F> is a tiny unnamed function, handy for telling <F>sorted</F>, <F>max</F> or <F>min</F> what to compare.
        </P>
        <PyRunner
          code={py`
accounts = [("A1", 47, 25000), ("A2", 5, 61000), ("A3", 92, 4000)]

by_balance = sorted(accounts, key=lambda a: a[2], reverse=True)
print("Largest first:", by_balance)

oldest = max(accounts, key=lambda a: a[1])
print("Most overdue:", oldest)
`}
        />
        <H>Recursion</H>
        <P>A recursive function calls itself on a smaller problem until it reaches a simple <B>base case</B>.</P>
        <PyRunner
          code={py`
def factorial(n):
    if n <= 1:          # base case: stop here
        return 1
    return n * factorial(n - 1)

print([factorial(n) for n in range(1, 8)])
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'sort-args',
        title: 'Flexible helpers',
        prompt: 'Write average(*numbers) returning the mean (or 0 when no numbers are given), and set ranked to the agents list sorted by recovery rate (second item), highest first.',
        starter: py`
def average(*numbers):
    pass

agents = [("Kiran", 0.42), ("Neha", 0.61), ("Amit", 0.35), ("Zoya", 0.58)]
ranked = agents

print(average(2, 4, 9), ranked)
`,
        tests: [
          { name: 'average(2, 4, 9) == 5', code: py`assert average(2, 4, 9) == 5, f"got {average(2, 4, 9)!r}"` },
          { name: 'average() == 0', code: py`assert average() == 0, f"got {average()!r}"` },
          { name: 'ranked is highest rate first', code: py`assert [a for a, _ in ranked] == ["Neha", "Zoya", "Kiran", "Amit"], f"got {ranked}"` },
        ],
        hint: 'if not numbers: return 0, otherwise return sum(numbers) / len(numbers). For ranked: sorted(agents, key=lambda a: a[1], reverse=True).',
        solution: py`
def average(*numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

agents = [("Kiran", 0.42), ("Neha", 0.61), ("Amit", 0.35), ("Zoya", 0.58)]
ranked = sorted(agents, key=lambda a: a[1], reverse=True)

print(average(2, 4, 9), ranked)
`,
      },
    ],
    quiz: [
      { q: 'Inside def f(*args), what type is args?', options: ['list', 'tuple', 'dict', 'set'], answer: 1, why: '*args collects positional arguments into a tuple.' },
      { q: 'What must every recursive function have?', options: ['A loop', 'A base case that stops the recursion', 'A global variable', 'A lambda'], answer: 1, why: 'Without a base case it calls itself forever and raises RecursionError.' },
    ],
  },
  {
    id: 'errors',
    module: 'functions',
    title: 'Handling errors',
    minutes: 12,
    goals: ['Catch errors with try / except', 'Use else and finally', 'Raise your own errors with clear messages'],
    body: () => (
      <>
        <P>
          When something goes wrong, Python raises an <Term id="exception">exception</Term>. If nothing catches it, the program stops. <F>try</F> / <F>except</F> lets you
          handle it and carry on.
        </P>
        <PyRunner
          code={py`
rows = ["1200", "abc", "450", "", "3000"]

total = 0
bad = 0
for text in rows:
    try:
        total += float(text)
    except ValueError:
        bad += 1
        print(f"Skipped {text!r}: not a number")

print("Total:", total, "| bad rows:", bad)
`}
        />
        <H>else and finally</H>
        <PyRunner
          code={py`
def safe_ratio(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("Cannot divide by zero")
        return None
    else:
        print("Worked fine")      # runs only if no error happened
        return result
    finally:
        print("Done checking")    # always runs

print(safe_ratio(10, 4))
print(safe_ratio(10, 0))
`}
        />
        <H>Raising errors</H>
        <P>
          Your own functions should <F>raise</F> an error when given bad input, with a message that says what is wrong. That is far better than silently returning a wrong
          answer.
        </P>
        <PyRunner
          code={py`
def apply_payment(balance, amount):
    if amount <= 0:
        raise ValueError("Payment must be positive")
    if amount > balance:
        raise ValueError(f"Payment {amount} is more than the balance {balance}")
    return balance - amount

print(apply_payment(5000, 1200))
try:
    apply_payment(5000, 9000)
except ValueError as e:
    print("Rejected:", e)
`}
        />
        <Callout tone="warn" title="Do not catch everything">
          A bare <F>except:</F> also hides typos and real bugs. Catch the specific error you expect, like <F>ValueError</F> or <F>KeyError</F>.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'parse-amount',
        title: 'A careful parser',
        prompt:
          'Write parse_amount(text): strip spaces and commas, convert to float and return it. Raise ValueError("Amount must be positive") if the number is 0 or less. Text that is not a number should raise ValueError too (float() already does that).',
        starter: py`
def parse_amount(text):
    return float(text)

print(parse_amount(" 1,250.50 "))
`,
        tests: [
          { name: 'parse_amount(" 1,250.50 ") == 1250.5', code: py`assert parse_amount(" 1,250.50 ") == 1250.5, f"got {parse_amount(' 1,250.50 ')!r}"` },
          { name: 'Negative raises ValueError("Amount must be positive")', code: py`
try:
    parse_amount("-5")
except ValueError as e:
    assert str(e) == "Amount must be positive", f"message was {str(e)!r}"
else:
    raise AssertionError("no error was raised for -5")
` },
          { name: 'Zero raises ValueError', code: py`
try:
    parse_amount("0")
except ValueError:
    pass
else:
    raise AssertionError("no error was raised for 0")
` },
          { name: '"abc" raises ValueError', code: py`
try:
    parse_amount("abc")
except ValueError:
    pass
else:
    raise AssertionError("no error was raised for 'abc'")
` },
        ],
        hint: 'value = float(text.strip().replace(",", "")). Then: if value <= 0: raise ValueError("Amount must be positive"). Return value.',
        solution: py`
def parse_amount(text):
    value = float(text.strip().replace(",", ""))
    if value <= 0:
        raise ValueError("Amount must be positive")
    return value

print(parse_amount(" 1,250.50 "))
`,
      },
    ],
    quiz: [
      { q: 'When does the finally block run?', options: ['Only after an error', 'Only when there is no error', 'Always', 'Never'], answer: 2, why: 'finally always runs, which makes it ideal for clean-up.' },
      { q: 'Which is the best practice?', options: ['except: pass', 'except Exception: pass', 'except ValueError: handle it', 'Never use try'], answer: 2, why: 'Catch the specific error you expect and handle it.' },
    ],
  },

  // ---------------------------------------------------------------- Organising code
  {
    id: 'modules',
    module: 'organising',
    title: 'Modules and the standard library',
    minutes: 12,
    goals: ['Import modules and names from them', 'Use math, statistics, random, datetime and collections', 'Know where to look before writing code yourself'],
    body: () => (
      <>
        <P>
          A <Term id="module">module</Term> is a file of ready-made code. Python ships with a huge <B>standard library</B> of them, so many problems are already solved.
        </P>
        <PyRunner
          code={py`
import math
import statistics as stats            # a shorter nickname
from datetime import date, timedelta  # import just the names you need

print(math.sqrt(144), math.ceil(4.1), math.floor(4.9))

collections_by_day = [42000, 38500, 51000, 47250, 39800]
print("mean", stats.mean(collections_by_day), "median", stats.median(collections_by_day))
print("stdev", round(stats.stdev(collections_by_day), 1))

due = date(2026, 10, 5)
today = date(2026, 11, 6)
print("Days past due:", (today - due).days)
print("Next reminder:", today + timedelta(days=3))
`}
        />
        <H>collections.Counter</H>
        <PyRunner
          code={py`
from collections import Counter

outcomes = ["PTP", "No answer", "Paid", "PTP", "No answer", "No answer", "Refused"]
counts = Counter(outcomes)
print(counts)
print(counts.most_common(2))
`}
        />
        <H>random, with a seed</H>
        <PyRunner
          code={py`
import random
random.seed(7)                          # same seed -> same "random" results
accounts = [f"ACC{n}" for n in range(1, 11)]
sample = random.sample(accounts, 3)     # a test group for a champion-challenger trial
print("Challenger group:", sample)
print("Dice:", random.randint(1, 6))
`}
        />
        <Callout title="Good to know">
          Your own <F>.py</F> files are modules too: <F>import helpers</F> loads <F>helpers.py</F> from the same folder. Packages from the internet (like pandas) are
          installed with <F>pip</F> on your computer; here only the standard library is available.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'dates-stats',
        title: 'Dates and statistics',
        prompt: 'Write days_past_due(due, today) that takes two "YYYY-MM-DD" strings and returns the number of days (0 if not yet due). Then set busiest to the most common day name in visits using Counter.',
        starter: py`
from datetime import date
from collections import Counter

def days_past_due(due, today):
    return 0

visits = ["Mon", "Tue", "Mon", "Fri", "Tue", "Mon"]
busiest = None

print(days_past_due("2026-10-05", "2026-11-06"), busiest)
`,
        tests: [
          { name: 'days_past_due("2026-10-05", "2026-11-06") == 32', code: py`assert days_past_due("2026-10-05", "2026-11-06") == 32, f"got {days_past_due('2026-10-05', '2026-11-06')!r}"` },
          { name: 'Not yet due gives 0', code: py`assert days_past_due("2026-12-01", "2026-11-06") == 0, f"got {days_past_due('2026-12-01', '2026-11-06')!r}"` },
          { name: 'busiest == "Mon"', code: py`assert busiest == "Mon", f"got {busiest!r}"` },
        ],
        hint: 'date.fromisoformat("2026-10-05") makes a date. Subtracting dates gives a timedelta with .days. Use max(0, …). Counter(visits).most_common(1)[0][0].',
        solution: py`
from datetime import date
from collections import Counter

def days_past_due(due, today):
    gap = (date.fromisoformat(today) - date.fromisoformat(due)).days
    return max(0, gap)

visits = ["Mon", "Tue", "Mon", "Fri", "Tue", "Mon"]
busiest = Counter(visits).most_common(1)[0][0]

print(days_past_due("2026-10-05", "2026-11-06"), busiest)
`,
      },
    ],
    quiz: [
      { q: 'from math import sqrt lets you write…', options: ['math.sqrt(9)', 'sqrt(9)', 'both', 'neither'], answer: 1, why: 'Only the name sqrt is imported, not the module name math.' },
      { q: 'What does random.seed(7) do?', options: ['Makes numbers truly random', 'Makes the "random" sequence repeatable', 'Picks 7 numbers', 'Nothing'], answer: 1, why: 'The same seed always gives the same sequence, which makes tests and experiments reproducible.' },
    ],
  },
  {
    id: 'files',
    module: 'organising',
    title: 'Files, CSV and JSON',
    minutes: 12,
    goals: ['Write and read text files with with open(...)', 'Read and write CSV with the csv module', 'Turn Python data into JSON and back'],
    body: () => (
      <>
        <P>
          Real data lives in files. Code here runs in a small virtual file system inside your browser, so you can practise safely: files you create disappear when the page
          reloads.
        </P>
        <PyRunner
          code={py`
with open("notes.txt", "w") as f:        # "w" = write (creates or replaces)
    f.write("Call ACC102 tomorrow\n")
    f.write("Send statement to ACC311\n")

with open("notes.txt", "a") as f:        # "a" = append
    f.write("Escalate ACC509\n")

with open("notes.txt") as f:             # default "r" = read
    for line_no, line in enumerate(f, start=1):
        print(line_no, line.strip())
`}
        />
        <P>
          <F>with</F> closes the file for you when the block ends, even if an error happens. Always use it.
        </P>
        <H>CSV files</H>
        <PyRunner
          code={py`
import csv

rows = [
    {"account": "A1", "agent": "Kiran", "amount": "1200"},
    {"account": "A2", "agent": "Neha", "amount": "5000"},
    {"account": "A3", "agent": "Kiran", "amount": "800"},
]
with open("payments.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["account", "agent", "amount"])
    writer.writeheader()
    writer.writerows(rows)

with open("payments.csv", newline="") as f:
    print(f.read())

with open("payments.csv", newline="") as f:
    for row in csv.DictReader(f):           # each row becomes a dict
        print(row["agent"], float(row["amount"]))
`}
        />
        <H>JSON</H>
        <PyRunner
          code={py`
import json

report = {"month": "2026-10", "cei": 0.65, "buckets": {"1-30": 412, "31-60": 120}}
text = json.dumps(report, indent=2)     # Python -> JSON text
print(text)
back = json.loads(text)                 # JSON text -> Python
print(back["buckets"]["1-30"] + 1)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'csv-totals',
        title: 'Totals by agent from a CSV',
        prompt: 'The code writes payments.csv. Write total_by_agent(path) that reads it with csv.DictReader and returns a dict of agent → total amount (as float).',
        starter: py`
import csv

with open("payments.csv", "w", newline="") as f:
    f.write("account,agent,amount\nA1,Kiran,1200\nA2,Neha,5000\nA3,Kiran,800\nA4,Zoya,450.5\nA5,Neha,1000\n")

def total_by_agent(path):
    return {}

print(total_by_agent("payments.csv"))
`,
        tests: [
          { name: 'Totals are correct', code: py`
got = total_by_agent("payments.csv")
assert got == {"Kiran": 2000.0, "Neha": 6000.0, "Zoya": 450.5}, f"got {got}"
` },
          { name: 'Works on a different file', code: py`
with open("other.csv", "w", newline="") as f:
    f.write("account,agent,amount\nB1,Amit,10\nB2,Amit,15\n")
got = total_by_agent("other.csv")
assert got == {"Amit": 25.0}, f"got {got}"
` },
        ],
        hint: 'with open(path, newline="") as f: then for row in csv.DictReader(f): totals[row["agent"]] = totals.get(row["agent"], 0) + float(row["amount"])',
        solution: py`
import csv

with open("payments.csv", "w", newline="") as f:
    f.write("account,agent,amount\nA1,Kiran,1200\nA2,Neha,5000\nA3,Kiran,800\nA4,Zoya,450.5\nA5,Neha,1000\n")

def total_by_agent(path):
    totals = {}
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            totals[row["agent"]] = totals.get(row["agent"], 0) + float(row["amount"])
    return totals

print(total_by_agent("payments.csv"))
`,
      },
    ],
    quiz: [
      { q: 'Which mode adds to the end of an existing file?', options: ['"r"', '"w"', '"a"', '"x"'], answer: 2, why: '"a" appends; "w" would erase the file first.' },
      { q: 'What type does csv.DictReader give each value?', options: ['int or float as appropriate', 'str', 'bytes', 'It guesses'], answer: 1, why: 'CSV is plain text, so every value arrives as a string. Convert numbers yourself.' },
    ],
  },
  {
    id: 'classes',
    module: 'organising',
    title: 'Classes and objects',
    minutes: 14,
    goals: ['Define a class with __init__ and methods', 'Understand self and attributes', 'Give objects a readable __repr__'],
    body: () => (
      <>
        <P>
          A <Term id="class">class</Term> is a blueprint that bundles data (attributes) with the actions on that data (methods). Each object made from it is an{' '}
          <B>instance</B> with its own data.
        </P>
        <PyRunner
          code={py`
class Account:
    def __init__(self, account_id, balance):   # runs when an Account is created
        self.account_id = account_id            # self = this particular object
        self.balance = balance
        self.payments = []

    def pay(self, amount):
        self.balance -= amount
        self.payments.append(amount)

    def is_settled(self):
        return self.balance <= 0

    def __repr__(self):                         # how the object prints
        return f"Account({self.account_id!r}, balance={self.balance})"

a = Account("ACC1", 5000)
b = Account("ACC2", 1200)
a.pay(2000)
b.pay(1200)
print(a, a.payments, a.is_settled())
print(b, b.is_settled())
`}
        />
        <H>Class attributes</H>
        <P>Attributes set on the class itself are shared by every instance, which suits constants like a default interest rate.</P>
        <PyRunner
          code={py`
class Card:
    annual_rate = 0.36                     # shared by all cards

    def __init__(self, holder, balance):
        self.holder = holder
        self.balance = balance

    def monthly_interest(self):
        return round(self.balance * self.annual_rate / 12, 2)

cards = [Card("Asha", 20000), Card("Ravi", 5000)]
for c in cards:
    print(c.holder, c.monthly_interest())
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'account-class',
        title: 'A safer Account',
        prompt:
          'Complete the Account class: pay(amount) should raise ValueError if amount is 0 or less or more than the balance; otherwise reduce the balance. is_settled() returns True when the balance is 0. __repr__ returns e.g. Account(ACC1: 3000).',
        starter: py`
class Account:
    def __init__(self, account_id, balance):
        self.account_id = account_id
        self.balance = balance

    def pay(self, amount):
        pass

    def is_settled(self):
        pass

    def __repr__(self):
        return "Account"

acc = Account("ACC1", 5000)
acc.pay(2000)
print(acc)
`,
        tests: [
          { name: 'pay() reduces the balance', code: py`
a = Account("T1", 5000)
a.pay(2000)
assert a.balance == 3000, f"balance is {a.balance}"
` },
          { name: 'Overpaying raises ValueError', code: py`
a = Account("T2", 100)
try:
    a.pay(500)
except ValueError:
    pass
else:
    raise AssertionError("no ValueError for paying more than the balance")
assert a.balance == 100, "balance changed after a rejected payment"
` },
          { name: 'Zero or negative raises ValueError', code: py`
for bad in (0, -50):
    try:
        Account("T3", 100).pay(bad)
    except ValueError:
        continue
    raise AssertionError(f"no ValueError for {bad}")
` },
          { name: 'is_settled() after paying in full', code: py`
a = Account("T4", 300)
assert a.is_settled() is False, "a new account with a balance is not settled"
a.pay(300)
assert a.is_settled() is True, "fully paid account should be settled"
` },
          { name: 'repr is Account(ACC1: 3000)', code: py`assert repr(acc) == "Account(ACC1: 3000)", f"got {acc!r}"` },
        ],
        hint: 'In pay: if amount <= 0 or amount > self.balance: raise ValueError("Invalid payment"). Then self.balance -= amount. __repr__: return f"Account({self.account_id}: {self.balance})"',
        solution: py`
class Account:
    def __init__(self, account_id, balance):
        self.account_id = account_id
        self.balance = balance

    def pay(self, amount):
        if amount <= 0 or amount > self.balance:
            raise ValueError("Invalid payment")
        self.balance -= amount

    def is_settled(self):
        return self.balance == 0

    def __repr__(self):
        return f"Account({self.account_id}: {self.balance})"

acc = Account("ACC1", 5000)
acc.pay(2000)
print(acc)
`,
      },
    ],
    quiz: [
      { q: 'What is self inside a method?', options: ['The class', 'The object the method was called on', 'A keyword that must be global', 'The module'], answer: 1, why: 'a.pay(10) passes a as self.' },
      { q: 'When does __init__ run?', options: ['When the class is defined', 'Each time a new object is created', 'When the program ends', 'Only if called by hand'], answer: 1, why: 'Account("A1", 500) creates an object and runs __init__ on it.' },
    ],
  },

  // ---------------------------------------------------------------- Advanced
  {
    id: 'inheritance',
    module: 'advanced',
    title: 'Inheritance, dataclasses and properties',
    minutes: 14,
    goals: ['Build a class on top of another with inheritance and super()', 'Cut boilerplate with @dataclass', 'Compute attributes with @property'],
    body: () => (
      <>
        <P>A child class <B>inherits</B> everything from its parent and can add to it or override it. <F>super()</F> calls the parent's version.</P>
        <PyRunner
          code={py`
class Loan:
    def __init__(self, principal, annual_rate):
        self.principal = principal
        self.annual_rate = annual_rate

    def describe(self):
        return f"{type(self).__name__} of ₹{self.principal:,} at {self.annual_rate:.0%}"

class SecuredLoan(Loan):
    def __init__(self, principal, annual_rate, collateral):
        super().__init__(principal, annual_rate)   # let Loan set the shared parts
        self.collateral = collateral

    def describe(self):                            # override, reusing the parent
        return super().describe() + f", secured by {self.collateral}"

for loan in [Loan(50000, 0.16), SecuredLoan(800000, 0.09, "property")]:
    print(loan.describe(), "| is a Loan:", isinstance(loan, Loan))
`}
        />
        <H>@dataclass</H>
        <P>For classes that mostly hold data, <F>@dataclass</F> writes <F>__init__</F>, <F>__repr__</F> and <F>__eq__</F> for you.</P>
        <PyRunner
          code={py`
from dataclasses import dataclass, field

@dataclass
class Payment:
    account: str
    amount: float
    channel: str = "UPI"
    tags: list = field(default_factory=list)   # a fresh list for each payment

p = Payment("ACC1", 1200)
print(p)
print(p == Payment("ACC1", 1200))   # compares field by field
`}
        />
        <H>@property</H>
        <PyRunner
          code={py`
from dataclasses import dataclass

@dataclass
class Bucket:
    opening: float
    collected: float

    @property
    def efficiency(self):            # used like an attribute, but calculated
        return self.collected / self.opening if self.opening else 0.0

b = Bucket(opening=200000, collected=130000)
print(f"{b.efficiency:.0%}")
b.collected += 20000
print(f"{b.efficiency:.0%}")         # always up to date
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'dataclass-loan',
        title: 'A Loan dataclass',
        prompt:
          'Make Loan a @dataclass with principal, annual_rate and months, plus a property emi returning the rounded instalment (same formula as before; r = annual_rate / 12; if r is 0 use principal / months). Then make TopUpLoan(Loan) with an extra field top_up: float = 0 whose emi is calculated on principal + top_up.',
        starter: py`
from dataclasses import dataclass

class Loan:
    pass

class TopUpLoan(Loan):
    pass
`,
        tests: [
          { name: 'Loan(100000, 0.12, 12).emi == 8884.88', code: py`assert Loan(100000, 0.12, 12).emi == 8884.88, f"got {Loan(100000, 0.12, 12).emi!r}"` },
          { name: 'Loan is a dataclass (prints its fields)', code: py`
r = repr(Loan(1000, 0, 10))
assert "principal=1000" in r and "months=10" in r, f"repr is {r}"
` },
          { name: 'TopUpLoan(100000, 0.12, 12, top_up=20000).emi == 10661.85', code: py`
t = TopUpLoan(100000, 0.12, 12, top_up=20000)
assert t.emi == 10661.85, f"got {t.emi!r}"
assert isinstance(t, Loan), "TopUpLoan should inherit from Loan"
` },
        ],
        hint: 'Write a helper method _emi_for(self, amount) on Loan; the property emi returns self._emi_for(self.principal), and TopUpLoan overrides emi to return self._emi_for(self.principal + self.top_up). Remember @dataclass on both classes.',
        solution: py`
from dataclasses import dataclass

@dataclass
class Loan:
    principal: float
    annual_rate: float
    months: int

    def _emi_for(self, amount):
        r = self.annual_rate / 12
        if r == 0:
            return round(amount / self.months, 2)
        growth = (1 + r) ** self.months
        return round(amount * r * growth / (growth - 1), 2)

    @property
    def emi(self):
        return self._emi_for(self.principal)

@dataclass
class TopUpLoan(Loan):
    top_up: float = 0

    @property
    def emi(self):
        return self._emi_for(self.principal + self.top_up)

print(Loan(100000, 0.12, 12), TopUpLoan(100000, 0.12, 12, top_up=20000).emi)
`,
      },
    ],
    quiz: [
      { q: 'What does super().__init__(...) do in a child class?', options: ['Creates a second object', "Runs the parent class's __init__ on this object", 'Deletes the parent', 'Nothing'], answer: 1, why: 'It reuses the parent\'s set-up instead of repeating it.' },
      { q: 'Why use field(default_factory=list) instead of = []?', options: ['It is shorter', 'So each object gets its own new list rather than sharing one', 'Lists are not allowed', 'For speed'], answer: 1, why: 'A plain [] default would be shared by every instance.' },
    ],
  },
  {
    id: 'generators',
    module: 'advanced',
    title: 'Iterators and generators',
    minutes: 12,
    goals: ['See how for loops use iterators', 'Write generator functions with yield', 'Process big or endless data lazily'],
    body: () => (
      <>
        <P>
          A for loop asks an object for an <B>iterator</B>, then calls <F>next()</F> on it until it runs out. A <Term id="generator">generator</Term> is the easiest way to
          make your own: a function that uses <F>yield</F> instead of return.
        </P>
        <PyRunner
          code={py`
def countdown(n):
    while n > 0:
        yield n          # hand back one value, then pause here
        n -= 1

gen = countdown(3)
print(next(gen), next(gen), next(gen))
for x in countdown(5):
    print(x, end=" ")
print()
`}
        />
        <H>Lazy: one item at a time</H>
        <P>
          Generators produce values only when asked, so they can describe huge or even endless sequences without filling memory. <F>itertools.islice</F> takes just the
          first few.
        </P>
        <PyRunner
          code={py`
from itertools import islice

def account_ids(prefix="ACC"):
    n = 1
    while True:                  # endless, but that is fine: it is lazy
        yield f"{prefix}{n:05d}"
        n += 1

print(list(islice(account_ids(), 4)))

# A generator expression: like a list comprehension, but with ( ) and lazy
total = sum(x * x for x in range(1_000_000))
print(total)
`}
        />
        <H>A practical pattern: batching</H>
        <PyRunner
          code={py`
def batches(items, size):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch          # whatever is left over

for b in batches(range(1, 11), 4):
    print("Send SMS batch:", b)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'fib-chunks',
        title: 'Two generators',
        prompt: 'Write fibonacci(), an endless generator of 0, 1, 1, 2, 3, 5, …, and chunks(items, n) that yields lists of n items (the last one may be shorter).',
        starter: py`
from itertools import islice

def fibonacci():
    yield 0

def chunks(items, n):
    yield list(items)

print(list(islice(fibonacci(), 10)))
print(list(chunks([1, 2, 3, 4, 5], 2)))
`,
        tests: [
          { name: 'First 10 Fibonacci numbers', code: py`
from itertools import islice
got = list(islice(fibonacci(), 10))
assert got == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], f"got {got}"
` },
          { name: 'fibonacci() is a generator', code: py`
import inspect
assert inspect.isgeneratorfunction(fibonacci), "use yield inside fibonacci"
` },
          { name: 'chunks([1, 2, 3, 4, 5], 2)', code: py`
got = list(chunks([1, 2, 3, 4, 5], 2))
assert got == [[1, 2], [3, 4], [5]], f"got {got}"
` },
          { name: 'chunks works on a range', code: py`
got = list(chunks(range(6), 3))
assert got == [[0, 1, 2], [3, 4, 5]], f"got {got}"
` },
        ],
        hint: 'fibonacci: a, b = 0, 1, then loop forever: yield a; a, b = b, a + b. chunks: reuse the batches pattern from the lesson.',
        solution: py`
from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def chunks(items, n):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == n:
            yield batch
            batch = []
    if batch:
        yield batch

print(list(islice(fibonacci(), 10)))
print(list(chunks([1, 2, 3, 4, 5], 2)))
`,
      },
    ],
    quiz: [
      { q: 'What does yield do?', options: ['Ends the function for good', 'Returns a value and pauses, ready to continue', 'Raises an error', 'Prints a value'], answer: 1, why: 'The function resumes after the yield when the next value is requested.' },
      { q: 'Why is sum(x for x in range(10**6)) memory-friendly?', options: ['It uses a set', 'The generator makes one number at a time instead of a list of a million', 'sum is special', 'It is not'], answer: 1, why: 'No million-item list is ever built.' },
    ],
  },
  {
    id: 'decorators',
    module: 'advanced',
    title: 'Closures and decorators',
    minutes: 14,
    goals: ['Treat functions as values', 'Write closures that remember data', 'Write and use decorators, including functools.lru_cache'],
    body: () => (
      <>
        <P>In Python, functions are values: you can store them, pass them to other functions and return them. A function that returns a function can remember data: a <B>closure</B>.</P>
        <PyRunner
          code={py`
def make_fee(rate):
    def fee(amount):            # 'fee' remembers 'rate'
        return round(amount * rate, 2)
    return fee

late_fee = make_fee(0.02)
bounce_fee = make_fee(0.05)
print(late_fee(10000), bounce_fee(10000))
`}
        />
        <H>Decorators</H>
        <P>
          A <Term id="decorator">decorator</Term> takes a function and returns an improved version. The <F>@name</F> line above a def is shorthand for{' '}
          <F>func = name(func)</F>.
        </P>
        <PyRunner
          code={py`
import functools, time

def timed(func):
    @functools.wraps(func)                   # keep the original name and docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        ms = (time.perf_counter() - start) * 1000
        print(f"{func.__name__} took {ms:.2f} ms")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

print(slow_sum(2_000_000))
`}
        />
        <H>Built-in decorator: lru_cache</H>
        <PyRunner
          code={py`
from functools import lru_cache

@lru_cache(maxsize=None)        # remember answers already worked out
def paths(n):
    if n <= 1:
        return 1
    return paths(n - 1) + paths(n - 2)

print(paths(80))                # instant; without the cache this would take ages
print(paths.cache_info())
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'count-calls',
        title: 'Count the calls',
        prompt: 'Write a decorator count_calls that adds a calls attribute to the wrapped function, starting at 0 and going up by 1 on every call. Keep the original function name with functools.wraps.',
        starter: py`
import functools

def count_calls(func):
    return func

@count_calls
def greet(name):
    return f"Hello {name}"

greet("Asha")
greet("Ravi")
print(greet.calls)
`,
        tests: [
          { name: 'greet.calls == 2 after two calls', code: py`assert greet.calls == 2, f"got {greet.calls}"` },
          { name: 'A new decorated function starts at 0', code: py`
@count_calls
def f(x):
    return x * 2
assert f.calls == 0, f"starts at {f.calls}"
assert f(4) == 8, "the result must still be returned"
assert f.calls == 1, f"after one call: {f.calls}"
` },
          { name: 'Keeps the function name', code: py`assert greet.__name__ == "greet", f"name is {greet.__name__}"` },
        ],
        hint: 'Inside count_calls define wrapper(*args, **kwargs) that does wrapper.calls += 1 and returns func(*args, **kwargs). Decorate wrapper with @functools.wraps(func), set wrapper.calls = 0, return wrapper.',
        solution: py`
import functools

def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def greet(name):
    return f"Hello {name}"

greet("Asha")
greet("Ravi")
print(greet.calls)
`,
      },
    ],
    quiz: [
      { q: '@timed above def f(): ... is the same as…', options: ['f = timed', 'f = timed(f)', 'timed = f(timed)', 'f(timed)'], answer: 1, why: 'The decorator receives the function and its result replaces it.' },
      { q: 'What does functools.wraps preserve?', options: ['Speed', "The original function's name and docstring", 'The arguments', 'Return values'], answer: 1, why: 'Without it, every decorated function would be called "wrapper".' },
    ],
  },
  {
    id: 'typing-testing',
    module: 'advanced',
    title: 'Type hints and testing',
    minutes: 12,
    goals: ['Annotate functions with type hints', 'Test code with assert and unittest', 'Write code that is easy to test'],
    body: () => (
      <>
        <P>
          <B>Type hints</B> document what a function expects and returns. Python does not enforce them while running, but editors and checkers like mypy use them to catch
          mistakes early.
        </P>
        <PyRunner
          code={py`
from typing import Optional

def find_agent(agents: dict[str, float], name: str) -> Optional[float]:
    """Return the agent's recovery rate, or None if unknown."""
    return agents.get(name)

rates: dict[str, float] = {"Neha": 0.61, "Kiran": 0.42}
print(find_agent(rates, "Neha"), find_agent(rates, "Zed"))
print(find_agent.__annotations__)
`}
        />
        <H>Testing with assert</H>
        <P>A test runs code with known inputs and checks the output. The exercises in this course are tested exactly like this.</P>
        <PyRunner
          code={py`
def roll_rate(rolled: float, bucket: float) -> float:
    return 0.0 if bucket == 0 else min(rolled, bucket) / bucket

assert roll_rate(22, 100) == 0.22
assert roll_rate(5, 0) == 0.0          # edge case: empty bucket
assert roll_rate(150, 100) == 1.0      # cannot roll more than existed
print("All asserts passed")
`}
        />
        <H>unittest</H>
        <P>For real projects, the built-in <F>unittest</F> module groups tests and reports results.</P>
        <PyRunner
          code={py`
import unittest

def cei(opening, billed, closing, closing_current):
    denom = opening + billed - closing_current
    return 0.0 if denom <= 0 else (opening + billed - closing) / denom * 100

class TestCEI(unittest.TestCase):
    def test_example(self):
        self.assertAlmostEqual(cei(100, 40, 77, 43), 64.948, places=3)

    def test_zero_denominator(self):
        self.assertEqual(cei(0, 0, 0, 0), 0.0)

unittest.main(argv=["tests"], exit=False, verbosity=2)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'phone',
        title: 'Normalise phone numbers',
        prompt:
          'Write normalise_phone(text: str) -> str that turns Indian mobile numbers like "98765 43210", "+91-98765-43210" or "098765 43210" into "+919876543210". Keep only digits, drop a leading 91 or 0 when that leaves 10 digits, and raise ValueError if 10 digits are not left.',
        starter: py`
def normalise_phone(text: str) -> str:
    return text

print(normalise_phone("+91-98765-43210"))
`,
        tests: [
          { name: 'Plain 10 digits with a space', code: py`assert normalise_phone("98765 43210") == "+919876543210", f"got {normalise_phone('98765 43210')!r}"` },
          { name: 'With +91 and dashes', code: py`assert normalise_phone("+91-98765-43210") == "+919876543210", f"got {normalise_phone('+91-98765-43210')!r}"` },
          { name: 'With a leading 0', code: py`assert normalise_phone("098765 43210") == "+919876543210", f"got {normalise_phone('098765 43210')!r}"` },
          { name: 'Too short raises ValueError', code: py`
try:
    normalise_phone("12345")
except ValueError:
    pass
else:
    raise AssertionError("no ValueError for '12345'")
` },
        ],
        hint: 'digits = "".join(ch for ch in text if ch.isdigit()). If len is 12 and it starts with "91", drop 2; if len is 11 and starts with "0", drop 1. Then check len == 10.',
        solution: py`
def normalise_phone(text: str) -> str:
    digits = "".join(ch for ch in text if ch.isdigit())
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 10:
        raise ValueError(f"Not a valid mobile number: {text!r}")
    return "+91" + digits

print(normalise_phone("+91-98765-43210"))
`,
      },
    ],
    quiz: [
      { q: 'What happens if you pass a str where a hint says int?', options: ['Python refuses to run', 'Nothing at run time; a type checker or editor would warn', 'It converts automatically', 'It crashes immediately'], answer: 1, why: 'Hints are for tools and readers; Python itself does not check them.' },
      { q: 'What makes a function easy to test?', options: ['It prints its result', 'It takes inputs and returns an output without depending on hidden state', 'It uses global variables', 'It is long'], answer: 1, why: 'Pure functions give the same output for the same input, so tests are simple asserts.' },
    ],
  },
  {
    id: 'project',
    module: 'advanced',
    title: 'Project: a collections report',
    minutes: 20,
    goals: ['Combine everything into one small program', 'Parse, group, summarise and format real-looking data', 'Structure a program into small tested functions'],
    body: () => (
      <>
        <P>
          Time to use it all. You will build the core of a daily collections report from a CSV export: the kind of thing that usually lives in a spreadsheet, now automated
          in a few lines of Python. Here is the data and a first look at it.
        </P>
        <PyRunner
          code={py`
import csv, io

DATA = """account,dpd,balance,collected
A101,0,12000,12000
A102,12,8000,2000
A103,45,25000,0
A104,47,15000,5000
A105,88,40000,10000
A106,120,61000,0
A107,5,3000,3000
"""

rows = list(csv.DictReader(io.StringIO(DATA)))   # read CSV text without a file
print(len(rows), "accounts")
print(rows[0])
`}
        />
        <H>The plan</H>
        <P>
          Small functions, each easy to test: <F>parse</F> turns text rows into numbers, <F>bucket</F> labels each account, and <F>build_report</F> summarises. The final
          exercise asks you to write <F>build_report</F>.
        </P>
        <PyRunner
          code={py`
def bucket(dpd: int) -> str:
    if dpd == 0: return "Current"
    if dpd <= 30: return "1-30"
    if dpd <= 60: return "31-60"
    if dpd <= 90: return "61-90"
    return "90+"

for dpd in (0, 12, 45, 88, 120):
    print(dpd, "->", bucket(dpd))
`}
        />
        <Callout title="Where to go next">
          On your own computer, install Python from python.org and try <B>pandas</B> for spreadsheets, <B>matplotlib</B> for charts and <B>requests</B> for APIs. The ideas
          you practised here (functions, dictionaries, tests) carry over directly.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'report',
        title: 'Build the report',
        prompt:
          'Write build_report(text) that takes the CSV text and returns a dict with: "accounts" (count), "balance" (total balance), "collected" (total collected), "rate" (collected ÷ balance, rounded to 3), "by_bucket" (bucket → number of accounts, using bucket()), and "top_risk" (account ids with dpd over 60, largest balance first).',
        starter: py`
import csv, io

DATA = """account,dpd,balance,collected
A101,0,12000,12000
A102,12,8000,2000
A103,45,25000,0
A104,47,15000,5000
A105,88,40000,10000
A106,120,61000,0
A107,5,3000,3000
"""

def bucket(dpd):
    if dpd == 0: return "Current"
    if dpd <= 30: return "1-30"
    if dpd <= 60: return "31-60"
    if dpd <= 90: return "61-90"
    return "90+"

def build_report(text):
    rows = list(csv.DictReader(io.StringIO(text)))
    return {}

report = build_report(DATA)
for key, value in report.items():
    print(f"{key:>10}: {value}")
`,
        tests: [
          { name: 'Totals: 7 accounts, balance 164000, collected 32000', code: py`
r = build_report(DATA)
got = (r.get("accounts"), r.get("balance"), r.get("collected"))
assert got == (7, 164000, 32000), f"got {got}"
` },
          { name: 'rate == 0.195', code: py`
r = build_report(DATA)
assert r.get("rate") == 0.195, f"got {r.get('rate')!r}"
` },
          { name: 'by_bucket counts', code: py`
r = build_report(DATA)
expected = {"Current": 1, "1-30": 2, "31-60": 2, "61-90": 1, "90+": 1}
assert r.get("by_bucket") == expected, f"got {r.get('by_bucket')}"
` },
          { name: 'top_risk == ["A106", "A105"]', code: py`
r = build_report(DATA)
assert r.get("top_risk") == ["A106", "A105"], f"got {r.get('top_risk')}"
` },
          { name: 'Works on other data', code: py`
other = "account,dpd,balance,collected\nX1,95,100,50\nX2,70,300,0\n"
r = build_report(other)
assert r.get("accounts") == 2 and r.get("rate") == 0.125, f"got {r}"
assert r.get("top_risk") == ["X2", "X1"], f"top_risk {r.get('top_risk')}"
assert r.get("by_bucket") == {"61-90": 1, "90+": 1}, f"by_bucket {r.get('by_bucket')}"
` },
        ],
        hint:
          'Convert each row first: dpd = int(row["dpd"]), balance = float(row["balance"]) etc. Count buckets with a dict and .get. For top_risk: sort the risky rows with key=lambda r: r["balance"], reverse=True, then take the account ids.',
        solution: py`
import csv, io

DATA = """account,dpd,balance,collected
A101,0,12000,12000
A102,12,8000,2000
A103,45,25000,0
A104,47,15000,5000
A105,88,40000,10000
A106,120,61000,0
A107,5,3000,3000
"""

def bucket(dpd):
    if dpd == 0: return "Current"
    if dpd <= 30: return "1-30"
    if dpd <= 60: return "31-60"
    if dpd <= 90: return "61-90"
    return "90+"

def build_report(text):
    rows = [
        {"account": r["account"], "dpd": int(r["dpd"]), "balance": float(r["balance"]), "collected": float(r["collected"])}
        for r in csv.DictReader(io.StringIO(text))
    ]
    balance = sum(r["balance"] for r in rows)
    collected = sum(r["collected"] for r in rows)
    by_bucket = {}
    for r in rows:
        b = bucket(r["dpd"])
        by_bucket[b] = by_bucket.get(b, 0) + 1
    risky = sorted((r for r in rows if r["dpd"] > 60), key=lambda r: r["balance"], reverse=True)
    return {
        "accounts": len(rows),
        "balance": balance,
        "collected": collected,
        "rate": round(collected / balance, 3) if balance else 0.0,
        "by_bucket": by_bucket,
        "top_risk": [r["account"] for r in risky],
    }

report = build_report(DATA)
for key, value in report.items():
    print(f"{key:>10}: {value}")
`,
      },
    ],
    quiz: [
      { q: 'Why split the report into small functions?', options: ['Python requires it', 'Each piece can be understood, reused and tested on its own', 'It runs faster', 'To use more memory'], answer: 1, why: 'Small, focused functions are the backbone of maintainable code.' },
      { q: 'What does io.StringIO(text) let csv.DictReader do?', options: ['Read from a URL', 'Read text in memory as if it were a file', 'Write a file', 'Nothing'], answer: 1, why: 'StringIO wraps a string in a file-like object.' },
    ],
  },
];
