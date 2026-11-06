import { B, Callout, F, H, P, Term } from '../ui';
import PyRunner from './PyRunner';

// Python course, modules 1–3 (beginner). Each lesson: explanation, runnable examples, exercises with
// tests, and a quiz. Code is written with String.raw so backslashes (\n) reach Python unchanged.
export const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '');

export const beginnerModules = [
  { id: 'start', title: 'Getting started', level: 'Beginner', blurb: 'Printing, variables, numbers and text: the building blocks of every program.' },
  { id: 'flow', title: 'Decisions and loops', level: 'Beginner', blurb: 'Make programs choose with if, repeat with for and while, and talk to the user.' },
  { id: 'collections', title: 'Collections', level: 'Beginner', blurb: 'Lists, tuples, sets and dictionaries: storing many values and finding things fast.' },
];

export const beginnerLessons = [
  // ---------------------------------------------------------------- Getting started
  {
    id: 'hello',
    module: 'start',
    title: 'Hello, Python',
    minutes: 8,
    goals: ['Run your first program', 'Use print() to show text and numbers', 'Write comments and read error messages calmly'],
    body: () => (
      <>
        <P>
          Python is a programming language known for reading almost like English. It is used for data analysis, automation, websites and AI. Everything in this course runs
          right here in your browser: press <B>Run</B> (or Ctrl/⌘ + Enter) and the result appears below the code. Change anything and run it again; you cannot break it, and{' '}
          <B>Reset</B> brings back the original.
        </P>
        <PyRunner
          code={py`
print("Hello, Python!")
print("2 + 3 =", 2 + 3)
print("Collections", "Strategy", "Python", sep=" | ")
`}
        />
        <H>What just happened</H>
        <P>
          <F>print()</F> is a <Term id="pyfunction">function</Term>: a named action. You give it values inside the brackets and it shows them. Text goes inside quotes ("…"
          or '…'); numbers do not. Several values separated by commas are printed with a space between them, or with whatever you pass as <F>sep</F>.
        </P>
        <H>Comments</H>
        <P>
          Anything after a <F>#</F> is a comment: a note for humans that Python ignores. Use comments to explain <i>why</i> code does something.
        </P>
        <PyRunner
          code={py`
# This line is a comment, so Python skips it.
print("Comments are ignored")  # a comment can also follow code
print("one", end=" ")          # end=" " keeps the next print on the same line
print("line")
`}
        />
        <H>Errors are normal</H>
        <P>
          Every programmer sees errors all day. Python tells you the <B>line</B>, the <B>type</B> of error and a message. Run this, read the error, then fix the typo.
        </P>
        <PyRunner code={py`
prnt("Fix me: the function is called print")
`} />
        <Callout title="Tip">
          Below every error there is a plain-English hint. A <F>NameError</F> almost always means a misspelt name. Python is case-sensitive: <F>Print</F> is not{' '}
          <F>print</F>.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'two-lines',
        title: 'Your first program',
        prompt: 'Print exactly two lines: Hello, Python! and then I am learning to code.',
        starter: py`
# Print the two lines here
`,
        tests: [
          { name: 'First line is "Hello, Python!"', code: py`assert OUTPUT.splitlines()[:1] == ["Hello, Python!"], f"first line was {OUTPUT.splitlines()[:1]}"` },
          { name: 'Second line is "I am learning to code."', code: py`assert OUTPUT.splitlines()[1:2] == ["I am learning to code."], f"second line was {OUTPUT.splitlines()[1:2]}"` },
          { name: 'Nothing else is printed', code: py`assert len(OUTPUT.splitlines()) == 2, f"printed {len(OUTPUT.splitlines())} lines"` },
        ],
        hint: 'Use print() twice, with the text in quotes. Watch the full stop and capital letters.',
        solution: py`
print("Hello, Python!")
print("I am learning to code.")
`,
      },
    ],
    quiz: [
      { q: 'What does print("4 + 4") show?', options: ['8', '4 + 4', 'An error', 'Nothing'], answer: 1, why: 'The quotes make it text, so it is printed exactly as written.' },
      { q: 'What does Python do with a line that starts with #?', options: ['Prints it', 'Ignores it: it is a comment', 'Raises an error', 'Runs it twice'], answer: 1, why: 'Comments are notes for people.' },
    ],
  },
  {
    id: 'variables',
    module: 'start',
    title: 'Variables and types',
    minutes: 10,
    goals: ['Store values in variables', 'Know the four basic types: int, float, str, bool', 'Check a value\'s type with type()'],
    body: () => (
      <>
        <P>
          A <Term id="variable">variable</Term> is a name that points to a value. You create one with <F>=</F>, which means "store", not "equals". After that, using the name
          gives you the value.
        </P>
        <PyRunner
          code={py`
customer = "Asha"          # str: text
balance = 25000            # int: whole number
rate = 0.18                # float: decimal number
is_overdue = True          # bool: True or False

print(customer, "owes", balance)
print(type(customer), type(balance), type(rate), type(is_overdue))
`}
        />
        <H>Variables can change</H>
        <P>The newest value wins. A variable can even be updated using its own old value.</P>
        <PyRunner
          code={py`
balance = 25000
print("Before:", balance)
balance = balance - 5000   # take the old value, subtract, store it back
print("After a payment:", balance)
balance -= 2000            # shorthand for balance = balance - 2000
print("After another:", balance)
`}
        />
        <H>Naming rules</H>
        <P>
          Names use letters, digits and underscores, and cannot start with a digit. By convention Python uses <F>snake_case</F>: lowercase words joined by underscores, like{' '}
          <F>days_past_due</F>. Choose names that say what the value means.
        </P>
        <H>Converting between types</H>
        <PyRunner
          code={py`
text = "1500"
number = int(text)        # "1500" -> 1500
print(number + 500)
print(float("2.5") * 2)   # "2.5" -> 2.5
print(str(42) + " accounts")  # 42 -> "42" so it can join other text
x, y = 10, 20             # assign two variables at once
print(x, y)
`}
        />
        <Callout tone="warn" title="Common mistake">
          <F>"5" + 5</F> is a <F>TypeError</F>: Python will not guess whether you meant text or maths. Convert one side first.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'profile',
        title: 'Describe yourself in variables',
        prompt: 'Create four variables: name (text), age (whole number), height (decimal number, in metres) and is_learning (True).',
        starter: py`
name = None
age = None
height = None
is_learning = None
print(name, age, height, is_learning)
`,
        tests: [
          { name: 'name is text and not empty', code: py`assert isinstance(name, str) and name.strip(), f"name is {name!r}"` },
          { name: 'age is a whole number (int)', code: py`assert type(age) is int, f"age is {type(age).__name__}"` },
          { name: 'height is a decimal number (float)', code: py`assert type(height) is float, f"height is {type(height).__name__}"` },
          { name: 'is_learning is True', code: py`assert is_learning is True, f"is_learning is {is_learning!r}"` },
        ],
        hint: 'Text needs quotes: name = "Shivam". Numbers do not: age = 31. A decimal has a point: height = 1.75. True has a capital T and no quotes.',
        solution: py`
name = "Shivam"
age = 31
height = 1.75
is_learning = True
print(name, age, height, is_learning)
`,
      },
    ],
    quiz: [
      { q: 'What is the type of 3.0?', options: ['int', 'float', 'str', 'bool'], answer: 1, why: 'It has a decimal point, so it is a float, even though it is a whole value.' },
      { q: 'After x = 5 then x = x + 2, what is x?', options: ['5', '2', '7', 'Error'], answer: 2, why: 'The right side is worked out first (5 + 2), then stored back in x.' },
      { q: 'Which is a valid variable name?', options: ['2nd_bucket', 'second-bucket', 'second_bucket', 'second bucket'], answer: 2, why: 'Letters, digits and underscores only, not starting with a digit.' },
    ],
  },
  {
    id: 'numbers',
    module: 'start',
    title: 'Numbers and maths',
    minutes: 10,
    goals: ['Use the arithmetic operators, including //, % and **', 'Round results and format them for people', 'Use f-strings to build readable output'],
    body: () => (
      <>
        <PyRunner
          code={py`
print(7 + 2, 7 - 2, 7 * 2)   # add, subtract, multiply
print(7 / 2)                  # divide: always gives a float
print(7 // 2)                 # floor division: whole part only
print(7 % 2)                  # remainder ("modulo")
print(2 ** 10)                # power: 2 to the 10th
print(2 + 3 * 4, (2 + 3) * 4) # * before +, unless brackets say otherwise
`}
        />
        <P>
          <F>%</F> is more useful than it looks: <F>n % 2 == 0</F> tells you a number is even, and <F>days % 7</F> gives the day of the week offset. <F>//</F> and{' '}
          <F>%</F> together split a total into whole groups and the rest.
        </P>
        <PyRunner
          code={py`
days_past_due = 47
weeks = days_past_due // 7
days = days_past_due % 7
print(days_past_due, "days =", weeks, "weeks and", days, "days")
`}
        />
        <H>f-strings: putting values into text</H>
        <P>
          Put an <F>f</F> before the quotes and any <F>{'{expression}'}</F> inside is replaced by its value. After a colon you can add a format: <F>:.2f</F> means two
          decimals, <F>:,</F> adds thousands separators, <F>:%</F> shows a percentage.
        </P>
        <PyRunner
          code={py`
collected = 64500.5
due = 100000
rate = collected / due
print(f"Collected ₹{collected:,.2f} of ₹{due:,}")
print(f"Collection rate: {rate:.1%}")
print(f"Rounded: {round(rate, 3)}, absolute of -4 is {abs(-4)}")
`}
        />
        <Callout title="Why 0.1 + 0.2 is not exactly 0.3">
          Computers store decimals in binary, so <F>0.1 + 0.2</F> gives <F>0.30000000000000004</F>. Round when you display money, or use the <F>decimal</F> module for
          exact accounting.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'interest',
        title: 'Monthly interest',
        prompt: 'A card balance of ₹1,25,000 has an 18% annual interest rate. Store the monthly interest (balance × rate ÷ 12, rounded to 2 decimals) in monthly_interest and print it as: Monthly interest: ₹1,875.00',
        starter: py`
balance = 125000
annual_rate = 0.18

monthly_interest = 0  # work this out
print(f"Monthly interest: ₹{monthly_interest}")
`,
        tests: [
          { name: 'monthly_interest is 1875.0', code: py`assert monthly_interest == 1875.0, f"got {monthly_interest!r}"` },
          { name: 'Prints "Monthly interest: ₹1,875.00"', code: py`assert "Monthly interest: ₹1,875.00" in OUTPUT, f"printed {OUTPUT!r}"` },
        ],
        hint: 'monthly_interest = round(balance * annual_rate / 12, 2). In the f-string use {monthly_interest:,.2f}.',
        solution: py`
balance = 125000
annual_rate = 0.18

monthly_interest = round(balance * annual_rate / 12, 2)
print(f"Monthly interest: ₹{monthly_interest:,.2f}")
`,
      },
    ],
    quiz: [
      { q: 'What is 17 % 5?', options: ['3.4', '3', '2', '12'], answer: 2, why: '17 = 3 × 5 + 2, so the remainder is 2.' },
      { q: 'What does f"{0.256:.1%}" produce?', options: ['0.3', '25.6%', '0.256%', '26%'], answer: 1, why: ':.1% multiplies by 100 and shows one decimal place.' },
    ],
  },
  {
    id: 'strings',
    module: 'start',
    title: 'Working with text',
    minutes: 12,
    goals: ['Index and slice strings', 'Clean and change text with string methods', 'Split text into parts and join parts back'],
    body: () => (
      <>
        <P>
          A string is a sequence of characters, and each has a position (an <B>index</B>) starting at <B>0</B>. Negative indexes count from the end.
        </P>
        <PyRunner
          code={py`
code = "DPD-30-60"
print(len(code))      # number of characters
print(code[0])        # first character
print(code[-1])       # last character
print(code[0:3])      # slice: positions 0, 1, 2 (stops BEFORE 3)
print(code[4:])       # from position 4 to the end
print(code[::-1])     # step -1: reversed
`}
        />
        <H>String methods</H>
        <P>
          Methods are functions that belong to a value; you call them with a dot. Strings never change in place: methods return a <B>new</B> string.
        </P>
        <PyRunner
          code={py`
raw = "   asha VERMA  "
clean = raw.strip().title()        # remove outer spaces, Capitalise Each Word
print(repr(raw), "->", repr(clean))
print(clean.upper(), clean.lower())
print(clean.replace("Verma", "Rao"))
print("Asha" in clean, clean.startswith("A"), clean.count("a"))
`}
        />
        <H>Split and join</H>
        <PyRunner
          code={py`
row = "ACC102,47,25000"
parts = row.split(",")          # -> a list of strings
print(parts)
account, dpd, balance = parts   # unpack into three variables
print(account, int(dpd) + 1, int(balance) * 2)
print(" | ".join(parts))        # glue a list back together
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'initials',
        title: 'Tidy a name',
        prompt: 'full_name holds messy text. Make clean = "Shivam Soni" (no outer spaces, each word capitalised) and initials = "SS".',
        starter: py`
full_name = "   shivam SONI  "

clean = ""
initials = ""
print(clean, initials)
`,
        tests: [
          { name: 'clean == "Shivam Soni"', code: py`assert clean == "Shivam Soni", f"got {clean!r}"` },
          { name: 'initials == "SS"', code: py`assert initials == "SS", f"got {initials!r}"` },
        ],
        hint: 'clean = full_name.strip().title(). For initials, split clean into words and take [0] of each: first, last = clean.split()',
        solution: py`
full_name = "   shivam SONI  "

clean = full_name.strip().title()
first, last = clean.split()
initials = first[0] + last[0]
print(clean, initials)
`,
      },
    ],
    quiz: [
      { q: 'If s = "Python", what is s[1:4]?', options: ['Pyt', 'yth', 'ytho', 'ython'], answer: 1, why: 'Start at index 1 (y) and stop before index 4, giving y, t, h.' },
      { q: 'What does "a,b,c".split(",") return?', options: ['"abc"', "['a', 'b', 'c']", "('a', 'b', 'c')", '3'], answer: 1, why: 'split() returns a list of the pieces.' },
    ],
  },

  // ---------------------------------------------------------------- Decisions and loops
  {
    id: 'conditions',
    module: 'flow',
    title: 'Making decisions with if',
    minutes: 10,
    goals: ['Compare values with ==, !=, <, >, <=, >=', 'Branch with if, elif and else', 'Combine conditions with and, or, not'],
    body: () => (
      <>
        <P>
          Comparisons produce a <B>bool</B>: True or False. An <F>if</F> runs its block only when its condition is True. The block is the indented lines below the colon.
        </P>
        <PyRunner
          code={py`
dpd = 45

if dpd == 0:
    print("Current: no action needed")
elif dpd <= 30:
    print("Early bucket: send a reminder SMS")
elif dpd <= 90:
    print("Mid bucket: assign to tele-calling")
else:
    print("Late bucket: field visit")

print("Checked account with", dpd, "days past due")
`}
        />
        <P>
          Python checks from the top and runs the <B>first</B> branch that is True, then skips the rest. Change <F>dpd</F> to 0, 12 or 120 and run again.
        </P>
        <H>Combining conditions</H>
        <PyRunner
          code={py`
balance = 40000
dpd = 65
has_promise = False

if dpd > 60 and balance > 25000:
    print("High risk: escalate")
if has_promise or dpd < 30:
    print("Wait for the promised payment")
if not has_promise:
    print("No promise to pay recorded")
`}
        />
        <Callout tone="warn" title="= versus ==">
          <F>=</F> stores a value; <F>==</F> asks "are these equal?". Writing <F>if dpd = 0:</F> is a SyntaxError.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'bucket',
        title: 'Find the DPD bucket',
        prompt: 'Set bucket to "Current" when dpd is 0, "1-30" up to 30, "31-60" up to 60, "61-90" up to 90, otherwise "90+". With dpd = 45 the answer is "31-60".',
        starter: py`
dpd = 45

bucket = None
# write if / elif / else here

print(bucket)
`,
        tests: [
          { name: 'With dpd = 45, bucket is "31-60"', code: py`assert bucket == "31-60", f"got {bucket!r}"` },
          {
            name: 'Also right for dpd 0, 30, 60, 61 and 120',
            code: py`
import contextlib, io, re
def bucket_for(value):
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(re.sub(r"(?m)^dpd\s*=.*$", f"dpd = {value}", SOURCE, count=1), ns)
    return ns.get("bucket")
expected = {0: "Current", 30: "1-30", 60: "31-60", 61: "61-90", 120: "90+"}
got = {v: bucket_for(v) for v in expected}
assert got == expected, f"got {got}"
`,
          },
        ],
        hint: 'Start with if dpd == 0: bucket = "Current", then elif dpd <= 30: …, and finish with else: bucket = "90+".',
        solution: py`
dpd = 45

if dpd == 0:
    bucket = "Current"
elif dpd <= 30:
    bucket = "1-30"
elif dpd <= 60:
    bucket = "31-60"
elif dpd <= 90:
    bucket = "61-90"
else:
    bucket = "90+"

print(bucket)
`,
      },
    ],
    quiz: [
      { q: 'With x = 10, which branch runs?\nif x > 5: A\nelif x > 8: B\nelse: C', options: ['A', 'B', 'A and B', 'C'], answer: 0, why: 'The first True branch wins; the rest are skipped.' },
      { q: 'What is True and not False?', options: ['True', 'False', 'Error', 'None'], answer: 0, why: 'not False is True, and True and True is True.' },
    ],
  },
  {
    id: 'loops',
    module: 'flow',
    title: 'Repeating with loops',
    minutes: 12,
    goals: ['Loop over items with for and over numbers with range()', 'Keep a running total (the accumulator pattern)', 'Use while, break and continue'],
    body: () => (
      <>
        <PyRunner
          code={py`
payments = [1200, 450, 3000, 800]

total = 0                      # start the running total at zero
for amount in payments:        # amount takes each value in turn
    total = total + amount
    print("Added", amount, "-> total", total)

print("Total collected:", total)
`}
        />
        <P>
          <F>range(n)</F> gives the numbers 0 to n − 1, which is handy for counting. <F>range(1, 6)</F> gives 1 to 5, and <F>range(0, 20, 5)</F> counts in fives.
        </P>
        <PyRunner
          code={py`
for day in range(1, 6):
    print("Reminder day", day)

for n in range(0, 20, 5):
    print(n, end=" ")
print()
`}
        />
        <H>while, break and continue</H>
        <P>
          A <F>while</F> loop repeats as long as its condition is True. <F>break</F> leaves a loop early; <F>continue</F> skips to the next round.
        </P>
        <PyRunner
          code={py`
balance = 10000
month = 0
while balance > 0:
    month += 1
    balance -= 3000
    print(f"Month {month}: {max(balance, 0)} left")

for amount in [500, -20, 900, 0, 1500]:
    if amount <= 0:
        continue          # skip bad rows
    if amount > 1000:
        print("Large payment found:", amount)
        break             # stop searching
    print("Checked", amount)
`}
        />
        <Callout tone="warn" title="Loops that never end">
          If a while condition never becomes False, the loop runs forever. Here it is stopped automatically after 15 seconds, or press <B>Stop</B>.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'totals',
        title: 'Total and count',
        prompt: 'Using a for loop (not sum()), set total to the sum of payments and big to how many payments are over 1000.',
        starter: py`
payments = [1200, 450, 3000, 800, 1500, 999]

total = 0
big = 0
# loop here

print(total, big)
`,
        tests: [
          { name: 'total is 7949', code: py`assert total == 7949, f"got {total!r}"` },
          { name: 'big is 3', code: py`assert big == 3, f"got {big!r}"` },
        ],
        hint: 'Inside "for amount in payments:", add to total, and use "if amount > 1000: big += 1".',
        solution: py`
payments = [1200, 450, 3000, 800, 1500, 999]

total = 0
big = 0
for amount in payments:
    total += amount
    if amount > 1000:
        big += 1

print(total, big)
`,
      },
      {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        prompt: 'The classic interview warm-up. Print the numbers 1 to 15, but print Fizz for multiples of 3, Buzz for multiples of 5, and FizzBuzz for multiples of both.',
        starter: py`
for n in range(1, 16):
    print(n)
`,
        tests: [
          {
            name: 'Prints the 15 correct lines',
            code: py`
expected = ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
got = OUTPUT.split()
assert got == expected, f"got {got}"
`,
          },
        ],
        hint: 'Check the "both" case first: if n % 15 == 0. Then n % 3 == 0, then n % 5 == 0, else print(n).',
        solution: py`
for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`,
      },
    ],
    quiz: [
      { q: 'What does list(range(2, 8, 2)) give?', options: ['[2, 4, 6, 8]', '[2, 4, 6]', '[2, 8]', '[4, 6, 8]'], answer: 1, why: 'Start at 2, step 2, stop before 8.' },
      { q: 'What does break do?', options: ['Skips one round', 'Leaves the loop completely', 'Restarts the loop', 'Raises an error'], answer: 1, why: 'continue skips a round; break ends the loop.' },
    ],
  },
  {
    id: 'input',
    module: 'flow',
    title: 'Talking to the user',
    minutes: 8,
    goals: ['Read typed text with input()', 'Convert input to numbers safely', 'Build a small interactive program'],
    body: () => (
      <>
        <P>
          <F>input()</F> pauses the program and returns what the user typed, <B>always as text</B>. In this course, typing happens in the <B>Input</B> box under the code:
          one line for each <F>input()</F>.
        </P>
        <PyRunner
          stdin={'Asha\n12000\n3'}
          code={py`
name = input("Customer name: ")
amount = float(input("Overdue amount: "))   # text -> number
months = int(input("Months to repay: "))

instalment = amount / months
print(f"{name} can repay in {months} instalments of ₹{instalment:,.2f}")
`}
        />
        <P>Change the Input box and run again. Try typing letters for the amount to see the ValueError you get when text cannot become a number.</P>
        <H>A small menu program</H>
        <PyRunner
          stdin={'2\n50000'}
          code={py`
print("1) Convert rupees to lakh")
print("2) Convert rupees to crore")
choice = input("Choose 1 or 2: ")
rupees = float(input("Amount in rupees: "))

if choice == "1":
    print(f"{rupees / 100_000:.2f} lakh")
elif choice == "2":
    print(f"{rupees / 10_000_000:.4f} crore")
else:
    print("Unknown choice")
`}
        />
        <Callout title="Underscores in numbers">
          <F>100_000</F> is the same as <F>100000</F>; the underscores just make big numbers readable.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'emi-message',
        title: 'Greeting with a number',
        prompt: 'Read a name, then an amount. Store the amount as a float in amount, and print: Hi <name>, your EMI is ₹<amount with commas and 2 decimals>',
        stdin: 'Asha\n4500',
        starter: py`
name = input("Name: ")
amount = input("EMI: ")
print("Hi", name)
`,
        tests: [
          { name: 'amount is a float', code: py`assert isinstance(amount, float), f"amount is {type(amount).__name__}"` },
          { name: 'Prints the message', code: py`
expected = f"Hi {name}, your EMI is ₹{amount:,.2f}"
assert expected in OUTPUT, f"expected {expected!r}"
` },
        ],
        hint: 'Wrap the second input in float(...). Then print(f"Hi {name}, your EMI is ₹{amount:,.2f}").',
        solution: py`
name = input("Name: ")
amount = float(input("EMI: "))
print(f"Hi {name}, your EMI is ₹{amount:,.2f}")
`,
      },
    ],
    quiz: [
      { q: 'What type does input() return?', options: ['int', 'float', 'str', 'It depends on what was typed'], answer: 2, why: 'Always text. Convert with int() or float().' },
      { q: 'int("12.5") gives…', options: ['12', '12.5', '13', 'a ValueError'], answer: 3, why: 'int() needs whole-number text. Use int(float("12.5")) to get 12.' },
    ],
  },

  // ---------------------------------------------------------------- Collections
  {
    id: 'lists',
    module: 'collections',
    title: 'Lists',
    minutes: 12,
    goals: ['Create, index and slice lists', 'Add, remove and sort items', 'Use len, sum, min, max and in'],
    body: () => (
      <>
        <P>
          A <Term id="list">list</Term> holds many values in order, inside square brackets. Lists can grow, shrink and change: they are <B>mutable</B>.
        </P>
        <PyRunner
          code={py`
balances = [25000, 4000, 61000, 12500]

print(balances[0], balances[-1])    # first and last
print(balances[1:3])                # a slice is a new list
print(len(balances), sum(balances), min(balances), max(balances))
print(61000 in balances)

balances.append(8000)               # add to the end
balances.insert(0, 99000)           # add at position 0
balances.remove(4000)               # remove a value
last = balances.pop()               # remove and return the last item
print(balances, "popped", last)
`}
        />
        <H>Sorting</H>
        <PyRunner
          code={py`
balances = [25000, 4000, 61000, 12500]
print(sorted(balances))                 # new sorted list
print(sorted(balances, reverse=True))   # largest first
balances.sort()                         # sorts this list in place
print(balances)
print(sum(balances) / len(balances))    # average
`}
        />
        <Callout tone="warn" title="Two names, one list">
          <F>b = a</F> does not copy a list: both names point to the same one, so changing <F>b</F> changes <F>a</F>. Use <F>b = a.copy()</F> for a real copy.
        </Callout>
        <PyRunner
          code={py`
a = [1, 2, 3]
b = a
b.append(4)
print("a is", a)       # surprise: a changed too
c = a.copy()
c.append(5)
print("a is still", a, "and c is", c)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'top-balances',
        title: 'Top balances',
        prompt: 'Add 15000 to balances, then remove the smallest value. Set top3 to the three largest (largest first) and average to the mean of the remaining balances.',
        starter: py`
balances = [25000, 4000, 61000, 12500, 33000]

# change balances here

top3 = []
average = 0
print(top3, average)
`,
        tests: [
          { name: 'balances has 15000 and no 4000', code: py`assert 15000 in balances and 4000 not in balances, f"balances is {balances}"` },
          { name: 'top3 is [61000, 33000, 25000]', code: py`assert top3 == [61000, 33000, 25000], f"got {top3}"` },
          { name: 'average is 29300.0', code: py`assert average == 29300.0, f"got {average!r}"` },
        ],
        hint: 'balances.append(15000); balances.remove(min(balances)); top3 = sorted(balances, reverse=True)[:3]; average = sum(balances) / len(balances)',
        solution: py`
balances = [25000, 4000, 61000, 12500, 33000]

balances.append(15000)
balances.remove(min(balances))

top3 = sorted(balances, reverse=True)[:3]
average = sum(balances) / len(balances)
print(top3, average)
`,
      },
    ],
    quiz: [
      { q: 'x = [10, 20, 30]. What is x[-1]?', options: ['10', '30', 'Error', '-1'], answer: 1, why: 'Negative indexes count from the end; -1 is the last item.' },
      { q: 'Which keeps the original list unchanged?', options: ['x.sort()', 'sorted(x)', 'x.append(1)', 'x.pop()'], answer: 1, why: 'sorted() returns a new list; .sort() changes the list itself.' },
    ],
  },
  {
    id: 'tuples-sets',
    module: 'collections',
    title: 'Tuples and sets',
    minutes: 10,
    goals: ['Use tuples for fixed groups of values and unpack them', 'Use sets for unique values and fast membership', 'Combine sets with union, intersection and difference'],
    body: () => (
      <>
        <P>
          A <B>tuple</B> is like a list that cannot change, written with round brackets. Use one for a fixed record, like a coordinate or a (name, amount) pair.
        </P>
        <PyRunner
          code={py`
payment = ("ACC102", 4500, "UPI")
account, amount, channel = payment       # unpacking
print(account, "paid", amount, "by", channel)

pairs = [("Asha", 4500), ("Ravi", 1200)]
for name, paid in pairs:                 # unpack inside a loop
    print(f"{name:<6}{paid:>6}")
`}
        />
        <H>Sets: unique values</H>
        <P>
          A <B>set</B> keeps each value once and has no order. Checking <F>x in some_set</F> is very fast, even with millions of items.
        </P>
        <PyRunner
          code={py`
called = {"A1", "A2", "A3", "A4"}
paid = {"A2", "A4", "A9"}

print("Called and paid:", called & paid)     # intersection
print("Called, not paid:", called - paid)    # difference
print("Either:", called | paid)              # union
print("Unique channels:", set(["SMS", "IVR", "SMS", "Call"]))
`}
        />
        <Callout title="Order">
          Sets have no order, so they print in whatever order Python chooses. Use <F>sorted(my_set)</F> when you need a stable order.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'called-paid',
        title: 'Who paid after a call?',
        prompt: 'From the two lists, set paid_after_call to the set of accounts in both, not_paid to a sorted list of called accounts that did not pay, and unique_called to how many different accounts were called.',
        starter: py`
called_today = ["A1", "A2", "A3", "A2", "A5", "A1"]
paid_today = ["A2", "A5", "A7"]

paid_after_call = set()
not_paid = []
unique_called = 0
print(paid_after_call, not_paid, unique_called)
`,
        tests: [
          { name: 'paid_after_call == {"A2", "A5"}', code: py`assert paid_after_call == {"A2", "A5"}, f"got {paid_after_call}"` },
          { name: 'not_paid == ["A1", "A3"]', code: py`assert not_paid == ["A1", "A3"], f"got {not_paid}"` },
          { name: 'unique_called == 4', code: py`assert unique_called == 4, f"got {unique_called}"` },
        ],
        hint: 'Turn both lists into sets first: called = set(called_today). Then use &, - and len().',
        solution: py`
called_today = ["A1", "A2", "A3", "A2", "A5", "A1"]
paid_today = ["A2", "A5", "A7"]

called = set(called_today)
paid = set(paid_today)
paid_after_call = called & paid
not_paid = sorted(called - paid)
unique_called = len(called)
print(paid_after_call, not_paid, unique_called)
`,
      },
    ],
    quiz: [
      { q: 'What is len({1, 1, 2, 2, 3})?', options: ['5', '3', '2', 'Error'], answer: 1, why: 'Sets drop duplicates, leaving {1, 2, 3}.' },
      { q: 'Why use a tuple instead of a list?', options: ['Tuples are mutable', 'For a fixed group of values that should not change', 'Tuples can hold more items', 'Lists cannot be unpacked'], answer: 1, why: 'Tuples are immutable records; that also lets them be dictionary keys.' },
    ],
  },
  {
    id: 'dicts',
    module: 'collections',
    title: 'Dictionaries',
    minutes: 12,
    goals: ['Store and look up values by key', 'Loop over keys and values with .items()', 'Count things with a dictionary'],
    body: () => (
      <>
        <P>
          A <Term id="dict">dictionary</Term> maps <B>keys</B> to <B>values</B>, like a contact list maps names to numbers. Look-ups by key are instant.
        </P>
        <PyRunner
          code={py`
account = {"id": "ACC102", "dpd": 47, "balance": 25000}

print(account["balance"])
account["balance"] -= 5000          # change a value
account["channel"] = "SMS"          # add a new key
print(account)
print(account.get("agent"))          # missing key -> None instead of an error
print(account.get("agent", "unassigned"))

for key, value in account.items():
    print(f"{key:>8}: {value}")
`}
        />
        <H>The counting pattern</H>
        <P>One of the most useful patterns in data work: walk through items and keep a count per key.</P>
        <PyRunner
          code={py`
buckets = ["1-30", "31-60", "1-30", "90+", "1-30", "31-60"]

counts = {}
for b in buckets:
    counts[b] = counts.get(b, 0) + 1   # 0 the first time we see b
print(counts)

# The largest bucket
biggest = max(counts, key=counts.get)
print("Most accounts are in", biggest)
`}
        />
        <H>Nested data</H>
        <PyRunner
          code={py`
portfolio = {
    "ACC1": {"dpd": 12, "balance": 8000},
    "ACC2": {"dpd": 95, "balance": 41000},
}
for acc, info in portfolio.items():
    flag = "late" if info["dpd"] > 90 else "ok"
    print(acc, info["balance"], flag)
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'count-channels',
        title: 'Collections by channel',
        prompt: 'Each payment is a (channel, amount) tuple. Build totals: a dict of channel → total amount. Then set best to the channel with the highest total.',
        starter: py`
payments = [("UPI", 1200), ("NACH", 5000), ("UPI", 800), ("Cash", 300), ("NACH", 2500)]

totals = {}
best = None
print(totals, best)
`,
        tests: [
          { name: 'totals is correct', code: py`assert totals == {"UPI": 2000, "NACH": 7500, "Cash": 300}, f"got {totals}"` },
          { name: 'best == "NACH"', code: py`assert best == "NACH", f"got {best!r}"` },
        ],
        hint: 'for channel, amount in payments: totals[channel] = totals.get(channel, 0) + amount. Then best = max(totals, key=totals.get).',
        solution: py`
payments = [("UPI", 1200), ("NACH", 5000), ("UPI", 800), ("Cash", 300), ("NACH", 2500)]

totals = {}
for channel, amount in payments:
    totals[channel] = totals.get(channel, 0) + amount
best = max(totals, key=totals.get)
print(totals, best)
`,
      },
    ],
    quiz: [
      { q: 'd = {"a": 1}. What does d.get("b", 0) return?', options: ['None', '0', 'KeyError', '1'], answer: 1, why: '.get returns the default when the key is missing.' },
      { q: 'What does d.items() give you in a for loop?', options: ['Only keys', 'Only values', '(key, value) pairs', 'The length'], answer: 2, why: 'Unpack them with for key, value in d.items().' },
    ],
  },
  {
    id: 'comprehensions',
    module: 'collections',
    title: 'Comprehensions',
    minutes: 10,
    goals: ['Build lists in one line with a list comprehension', 'Filter with an if inside', 'Write dict and set comprehensions'],
    body: () => (
      <>
        <P>A comprehension builds a new collection from an old one in a single readable line. These two do the same thing:</P>
        <PyRunner
          code={py`
amounts = [1200, 450, 3000, 800]

# the long way
with_gst = []
for a in amounts:
    with_gst.append(round(a * 1.18))
print(with_gst)

# the comprehension way: [expression for item in collection]
print([round(a * 1.18) for a in amounts])
`}
        />
        <H>Filtering</H>
        <PyRunner
          code={py`
amounts = [1200, 450, 3000, 800, 15000]
large = [a for a in amounts if a >= 1000]
print(large)

names = ["  asha", "RAVI ", "meena"]
print([n.strip().title() for n in names])

print(sum(a for a in amounts if a < 1000))   # no brackets needed inside sum()
`}
        />
        <H>Dict and set comprehensions</H>
        <PyRunner
          code={py`
accounts = ["A1", "A2", "A3"]
balances = [5000, 0, 1200]

lookup = {acc: bal for acc, bal in zip(accounts, balances)}   # zip pairs items up
print(lookup)
print({acc for acc, bal in lookup.items() if bal == 0})       # set of settled accounts
`}
        />
        <Callout title="Keep it readable">
          If a comprehension needs more than one if, or nested loops, a normal for loop is often clearer. Readability counts.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'comp',
        title: 'Three comprehensions',
        prompt: 'Using comprehensions: settled = accounts with balance 0 (list, same order); owed = dict of account → balance for balances over 0; total_owed = sum of those balances.',
        starter: py`
data = [("A1", 5000), ("A2", 0), ("A3", 1200), ("A4", 0), ("A5", 300)]

settled = []
owed = {}
total_owed = 0
print(settled, owed, total_owed)
`,
        tests: [
          { name: 'settled == ["A2", "A4"]', code: py`assert settled == ["A2", "A4"], f"got {settled}"` },
          { name: 'owed has the three accounts with money due', code: py`assert owed == {"A1": 5000, "A3": 1200, "A5": 300}, f"got {owed}"` },
          { name: 'total_owed == 6500', code: py`assert total_owed == 6500, f"got {total_owed}"` },
        ],
        hint: 'settled = [acc for acc, bal in data if bal == 0]; owed = {acc: bal for acc, bal in data if bal > 0}; total_owed = sum(owed.values())',
        solution: py`
data = [("A1", 5000), ("A2", 0), ("A3", 1200), ("A4", 0), ("A5", 300)]

settled = [acc for acc, bal in data if bal == 0]
owed = {acc: bal for acc, bal in data if bal > 0}
total_owed = sum(owed.values())
print(settled, owed, total_owed)
`,
      },
    ],
    quiz: [
      { q: 'What is [x * 2 for x in range(3)]?', options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2, 0, 1, 2]', '6'], answer: 0, why: 'range(3) is 0, 1, 2; each is doubled.' },
      { q: 'What does zip(["a", "b"], [1, 2]) pair up?', options: ['("a", "b") and (1, 2)', '("a", 1) and ("b", 2)', '"a1" and "b2"', 'Nothing'], answer: 1, why: 'zip walks both lists together, item by item.' },
    ],
  },
];
