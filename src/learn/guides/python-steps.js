// Step-by-step material for each Python lesson, merged into guides/python.js:
//   terms    every keyword the lesson uses (glossary ids), shown with its definition and an everyday comparison
//   process  what happens, in order: { title, stages: [[name, what happens], …] }
//   steps    a hands-on walkthrough done in the practice box: { do, code?, see? }
//            `fresh: true` steps start from an empty box; the others add to what is already there.
// Every step's code is run by scripts/check-python-steps.mjs, so "You should see" stays true.

const ADD = 'Add this line under what you have, then press Run.';
const ADD_LINES = 'Add these lines under what you have, then press Run.';
const FRESH = 'Delete everything in the practice box. Type this, then press Run.';

export const pythonSteps = {
  // ---------------------------------------------------------------- Getting started
  hello: {
    terms: ['program', 'code', 'run', 'output', 'print', 'string', 'pyfunction', 'argument', 'comment', 'error', 'syntax'],
    process: {
      title: 'What happens when you press Run',
      stages: [
        ['You type code', 'The code box is a small text editor. Nothing happens while you type; the code is only text until you run it.'],
        ['You press Run', 'The whole box is handed to Python. The first time, Python itself takes a few seconds to load.'],
        ['Python reads line 1', 'It carries out that one instruction completely before it looks at the next line.'],
        ['Then line 2, line 3…', 'Always top to bottom, one line at a time. It never skips ahead or guesses what you meant.'],
        ['Output appears', 'Everything print() showed is listed in the dark panel under the box, in the order it happened.'],
        ['Or an error stops it', 'If a line cannot be carried out, Python stops there and tells you which line and why. Lines above it have already run.'],
      ],
    },
    practice: '',
    steps: [
      { do: 'Find the practice box just above these steps and click inside it once. A blinking line (the cursor) shows where your typing will go.', see: 'A blinking cursor on line 1 of the empty box.' },
      { do: 'Type this exactly. The word print is in lower case, the brackets are round, and the text sits inside double quotes.', code: 'print("Hello")', see: 'The text you typed, with print in one colour and "Hello" in another. Nothing has run yet.' },
      { do: 'Press the Run button under the box (or hold Ctrl, or ⌘ on a Mac, and press Enter).', see: 'Hello in the dark output panel, without the quotes. The first run can take a few seconds while Python loads.' },
      { do: 'Press Enter at the end of line 1 to start line 2. Type a second instruction, then press Run.', code: 'print("I am learning to code.")', see: 'Two lines of output: Hello, then I am learning to code. Python ran line 1 first, then line 2.' },
      { do: 'Numbers need no quotes, and Python can do maths. Add a third line, then press Run.', code: 'print(2 + 3)', see: 'A third line of output: 5. Python worked out 2 + 3 before showing it.' },
      { do: 'Now put the same sum inside quotes on a fourth line, then press Run.', code: 'print("2 + 3")', see: '2 + 3 exactly as typed. Quotes turn it into text, so no maths happens.' },
      { do: 'Make a mistake on purpose: on a fifth line, misspell print. Press Run.', code: 'prnt("oops")', see: 'The first four lines of output as before, then a red NameError mentioning prnt and line 5. Python stopped at the line it could not understand.', error: true },
      { do: 'Fix it: change prnt to print on line 5 and press Run.', code: 'print("oops")', see: 'The error is gone and oops appears as the last line. You just found and fixed your first bug.', replaceLast: true },
      { do: 'Add a note for yourself above line 1: click at the very start of line 1, type the line below, and press Enter. Then press Run.', code: '# My first program', see: 'Exactly the same output as before. Lines that start with # are comments, and Python ignores them.', prepend: true },
    ],
  },
  variables: {
    terms: ['value', 'variable', 'assignment', 'datatype', 'number', 'string', 'boolean', 'error'],
    process: {
      title: 'What happens on a line like balance = 25000',
      stages: [
        ['Python looks at the right-hand side first', 'It works out the value to the right of the = sign. Here that is simply the number 25000.'],
        ['It stores that value', 'The value is kept in the computer\'s memory.'],
        ['It attaches the name on the left', 'The name balance now points to 25000. If balance already existed, the old value is replaced.'],
        ['Later, the name stands for the value', 'Wherever you write balance, Python swaps in 25000 before carrying out the line.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'customer = "Asha"\nprint(customer)', see: 'Asha. The name customer has no quotes in print(), so Python shows the value stored under it.', fresh: true },
      { do: ADD_LINES, code: 'balance = 25000\nprint(customer, "owes", balance)', see: 'A second line: Asha owes 25000.' },
      { do: 'Change a variable using its own old value. ' + ADD_LINES, code: 'balance = balance - 5000\nprint(balance)', see: '20000. Python worked out 25000 - 5000 first, then stored the answer back under balance.' },
      { do: 'Ask Python what type each value is. ' + ADD, code: 'print(type(customer), type(balance))', see: "<class 'str'> <class 'int'>: text and a whole number." },
      { do: 'Try to add text to a number. ' + ADD, code: 'print("5" + 5)', see: 'A red TypeError on that line. Python will not guess whether you meant text or maths.', error: true },
      { do: 'Fix it by converting the text to a number: change that last line to this, then press Run.', code: 'print(int("5") + 5)', see: '10. int() turned the text "5" into the number 5.', replaceLast: true },
    ],
  },
  numbers: {
    terms: ['number', 'operator', 'expression', 'fstring', 'variable'],
    process: {
      title: 'How Python works out 2 + 3 * 4',
      stages: [
        ['Brackets first', 'Anything inside ( ) is worked out before the rest.'],
        ['Then powers', '** comes next: 2 ** 3 is 8.'],
        ['Then multiply and divide', '*, /, // and % are done left to right. So 3 * 4 becomes 12.'],
        ['Then add and subtract', '+ and - are done last, left to right. 2 + 12 is 14.'],
        ['One value is left', 'The whole expression has become a single value, which print() shows or = stores.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)', see: '3.5, then 3, then 1: normal division, whole-number division, and the remainder.', fresh: true },
      { do: 'See the order of operations. ' + ADD, code: 'print(2 + 3 * 4, (2 + 3) * 4)', see: '14 20. Without brackets the multiplying happens first.' },
      { do: 'Store two numbers and divide them. ' + ADD_LINES, code: 'collected = 64500\ndue = 100000\nrate = collected / due\nprint(rate)', see: '0.645' },
      { do: 'Show it as a percentage with an f-string. Note the f before the quotes. ' + ADD, code: 'print(f"Collection rate: {rate:.1%}")', see: 'Collection rate: 64.5%' },
      { do: 'Add thousands separators. ' + ADD, code: 'print(f"Collected {collected:,} of {due:,}")', see: 'Collected 64,500 of 100,000' },
      { do: 'Split days into weeks and days. ' + ADD_LINES, code: 'days = 47\nprint(days // 7, "weeks and", days % 7, "days")', see: '6 weeks and 5 days' },
    ],
  },
  strings: {
    terms: ['string', 'index', 'slice', 'method', 'mutable', 'list'],
    process: {
      title: 'How Python numbers the characters in "DPD-30"',
      stages: [
        ['Each character gets a position', 'D is 0, P is 1, D is 2, - is 3, 3 is 4, 0 is 5. Counting starts at 0, not 1.'],
        ['One position picks one character', 'code[0] is "D". code[-1] counts from the end, so it is "0".'],
        ['Two positions pick a slice', 'code[0:3] starts at position 0 and stops before position 3, giving "DPD".'],
        ['The original never changes', 'Slices and methods build a new string. To keep the result, store it in a variable.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'code = "DPD-30-60"\nprint(len(code))', see: '9: the number of characters, counting the dashes.', fresh: true },
      { do: 'Pick single characters. ' + ADD, code: 'print(code[0], code[-1])', see: 'D 0: the first and the last character.' },
      { do: 'Cut out a slice. ' + ADD, code: 'print(code[0:3], code[4:])', see: 'DPD 30-60. The slice stops before position 3; leaving the end blank runs to the end.' },
      { do: 'Clean up messy text with methods. ' + ADD_LINES, code: 'raw = "   asha VERMA  "\nclean = raw.strip().title()\nprint(clean)', see: 'Asha Verma: outer spaces removed, each word capitalised.' },
      { do: 'Check the original is untouched. ' + ADD, code: 'print(repr(raw))', see: "'   asha VERMA  ' with its spaces still there. Methods return a new string." },
      { do: 'Split one piece of text into parts. ' + ADD_LINES, code: 'row = "ACC102,47,25000"\nparts = row.split(",")\nprint(parts)', see: "['ACC102', '47', '25000']: a list of three strings." },
      { do: 'Join them back with a different separator. ' + ADD, code: 'print(" | ".join(parts))', see: 'ACC102 | 47 | 25000' },
    ],
  },

  // ---------------------------------------------------------------- Decisions and loops
  conditions: {
    terms: ['condition', 'boolean', 'operator', 'block', 'indentation', 'syntax'],
    process: {
      title: 'How Python runs an if / elif / else',
      stages: [
        ['It works out the first condition', 'The expression after if becomes True or False.'],
        ['True: run that block', 'The indented lines under the if run, and every elif and else below is skipped.'],
        ['False: try the next elif', 'Conditions are tried in order from the top. The first True one wins.'],
        ['Nothing was True: run else', 'If there is an else, its block runs. With no else, nothing runs.'],
        ['Carry on below', 'Python continues with the first line that is not indented under the if.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'dpd = 45\nprint(dpd > 30)', see: 'True. A comparison is an expression that works out to True or False.', fresh: true },
      { do: 'Add an if. End the line with a colon, press Enter, and indent the next line with 4 spaces (the editor does it for you).', code: 'if dpd > 30:\n    print("Overdue: send a reminder")', see: 'A second line: Overdue: send a reminder.' },
      { do: 'Add an else at the same level as the if, with its own indented line.', code: 'else:\n    print("On time")', see: 'The same output as before, because dpd is 45.' },
      { do: 'Change the first line to dpd = 10 and press Run.', see: 'False, then On time. The else block ran this time.', edit: ['dpd = 45', 'dpd = 10'] },
      { do: 'Combine two conditions with and. ' + ADD_LINES, code: 'balance = 40000\nif dpd < 30 and balance > 25000:\n    print("Large but recent")', see: 'A third line: Large but recent. Both sides were True.' },
      { do: 'Make the classic mistake: use = instead of == in a condition. ' + ADD_LINES, code: 'if dpd = 10:\n    print("ten")', see: 'A red SyntaxError, and none of the lines above ran. A syntax error is found before the program starts.', error: true },
      { do: 'Fix it: change = to == on that line and press Run.', code: 'if dpd == 10:\n    print("ten")', see: 'All the earlier output returns, followed by ten.', replaceLast: 2 },
    ],
  },
  loops: {
    terms: ['loop', 'list', 'block', 'indentation', 'range', 'accumulator', 'condition'],
    process: {
      title: 'How a for loop runs',
      stages: [
        ['Take the first item', 'The loop variable (amount in "for amount in payments") is set to the first item of the list.'],
        ['Run the block once', 'Every indented line under the for runs, using that item.'],
        ['Go back up for the next item', 'The loop variable is set to the next item and the block runs again.'],
        ['Stop when the items run out', 'After the last item, Python leaves the loop.'],
        ['Carry on below', 'The first line that is not indented runs once, after the loop has finished.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'payments = [1200, 450, 3000]\nfor amount in payments:\n    print(amount)', see: '1200, 450 and 3000 on three lines. The block ran once for each item.', fresh: true },
      { do: 'Start a running total before the loop: click at the start of line 2 (the for line), type the line below, and press Enter.', code: 'total = 0', see: 'The same output. The total exists but is not used yet.', insertAt: 1 },
      { do: 'Inside the loop, add each amount to the total. Add this as a new indented line under print(amount).', code: '    total = total + amount', see: 'The same three lines. The total is growing silently.' },
      { do: 'Show the total after the loop. This line has no indentation, so it runs once at the end.', code: 'print("Total:", total)', see: 'A fourth line: Total: 4650.' },
      { do: 'Count with range(). ' + ADD_LINES, code: 'for day in range(1, 4):\n    print("Reminder day", day)', see: 'Reminder day 1, 2 and 3. range(1, 4) stops before 4.' },
      { do: 'Use a while loop that repeats until a condition turns False. ' + ADD_LINES, code: 'balance = 10000\nwhile balance > 0:\n    balance = balance - 4000\n    print("Left:", max(balance, 0))', see: 'Left: 6000, Left: 2000, Left: 0. The loop stopped when balance was no longer above 0.' },
    ],
  },
  input: {
    terms: ['input', 'string', 'number', 'variable', 'error', 'fstring'],
    process: {
      title: 'What happens on name = input("Your name: ")',
      stages: [
        ['The question is shown', 'The text inside the brackets appears as a prompt.'],
        ['Python takes one line of typing', 'In this Lab it reads the next line from the Input box under the code: one line for each input().'],
        ['The typing comes back as text', 'Even if you typed 12000, Python receives the string "12000".'],
        ['The text is stored', 'The = stores it under the name on the left.'],
        ['Convert before doing maths', 'Wrap it in int() or float() to turn the text into a number.'],
      ],
    },
    steps: [
      { do: FRESH + ' An Input box appears under the code: type Asha in it before you press Run.', code: 'name = input("Customer name: ")\nprint("Hello,", name)', see: 'Customer name: followed by Hello, Asha.', fresh: true, stdin: 'Asha' },
      { do: 'Ask for a number. Add these lines, then put 12000 on the second line of the Input box and press Run.', code: 'amount = input("Overdue amount: ")\nprint(type(amount))', see: "<class 'str'>. The number arrived as text.", stdin: 'Asha\n12000' },
      { do: 'Convert it: change the amount line so input() is wrapped in float(), then press Run.', code: 'amount = float(input("Overdue amount: "))\nprint(type(amount))', see: "<class 'float'>. Now it is a number.", replaceLast: 2, stdin: 'Asha\n12000' },
      { do: 'Use it in a calculation. ' + ADD, code: 'print(f"{name} can pay ₹{amount / 3:,.2f} a month for 3 months")', see: 'Asha can pay ₹4,000.00 a month for 3 months', stdin: 'Asha\n12000' },
      { do: 'See what bad input does: change 12000 in the Input box to the word lots and press Run.', see: 'A red ValueError: could not convert string to float. Text that is not a number cannot become one.', stdin: 'Asha\nlots', error: true },
      { do: 'Put 12000 back in the Input box and press Run.', see: 'The program works again. The lesson "Handling errors" shows how to catch this instead of crashing.', stdin: 'Asha\n12000' },
    ],
  },

  // ---------------------------------------------------------------- Collections
  lists: {
    terms: ['list', 'index', 'slice', 'method', 'mutable', 'variable'],
    process: {
      title: 'What happens when you change a list',
      stages: [
        ['A list is one object holding many values', 'balances = [25000, 4000] creates one list and points the name balances at it.'],
        ['Methods change that same list', 'balances.append(8000) adds to the existing list. No new list is made, and nothing needs storing back.'],
        ['A second name is not a copy', 'other = balances makes both names point at the same list, so a change through one shows through the other.'],
        ['copy() makes a separate list', 'other = balances.copy() builds a new list with the same items, which can then change on its own.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'balances = [25000, 4000, 61000]\nprint(balances[0], balances[-1], len(balances))', see: '25000 61000 3: the first item, the last item, and how many there are.', fresh: true },
      { do: 'Add an item to the end. ' + ADD_LINES, code: 'balances.append(8000)\nprint(balances)', see: '[25000, 4000, 61000, 8000]' },
      { do: 'Remove an item by value. ' + ADD_LINES, code: 'balances.remove(4000)\nprint(balances)', see: '[25000, 61000, 8000]' },
      { do: 'Use the built-in helpers. ' + ADD, code: 'print(sum(balances), min(balances), max(balances))', see: '94000 8000 61000' },
      { do: 'Get a sorted copy without changing the list. ' + ADD_LINES, code: 'print(sorted(balances))\nprint(balances)', see: '[8000, 25000, 61000] then [25000, 61000, 8000]: the original keeps its order.' },
      { do: 'See the two-names trap. ' + ADD_LINES, code: 'other = balances\nother.append(1)\nprint(balances)', see: '[25000, 61000, 8000, 1]. Changing other changed balances, because they are the same list.' },
    ],
  },
  'tuples-sets': {
    terms: ['tuple', 'unpack', 'set', 'mutable', 'list'],
    process: {
      title: 'Choosing between a list, a tuple and a set',
      stages: [
        ['Will the items change?', 'Yes: use a list. No, it is one fixed record such as (account, amount): use a tuple.'],
        ['Does order matter?', 'Lists and tuples keep their order. A set has none.'],
        ['Should duplicates disappear?', 'Yes: use a set. Each value is kept only once.'],
        ['Do you need to compare two groups?', 'Sets answer "in both", "in one but not the other" and "in either" with &, - and |.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'payment = ("ACC102", 4500, "UPI")\nprint(payment[1])', see: '4500. A tuple is indexed just like a list.', fresh: true },
      { do: 'Unpack it into three variables. ' + ADD_LINES, code: 'account, amount, channel = payment\nprint(account, "paid", amount, "by", channel)', see: 'ACC102 paid 4500 by UPI' },
      { do: 'Try to change it. ' + ADD, code: 'payment[1] = 9999', see: 'A red TypeError: tuples cannot be changed after they are made.', error: true },
      { do: 'Delete that last line. Then make a set from a list with repeats.', code: 'channels = set(["SMS", "IVR", "SMS", "Call"])\nprint(len(channels))', see: '3. The second SMS disappeared.', replaceLast: true },
      { do: 'Compare two groups. ' + ADD_LINES, code: 'called = {"A1", "A2", "A3"}\npaid = {"A2", "A9"}\nprint(called & paid)\nprint(sorted(called - paid))', see: "{'A2'} then ['A1', 'A3']: called and paid, then called but not paid." },
    ],
  },
  dicts: {
    terms: ['dict', 'key', 'value', 'loop', 'accumulator', 'error'],
    process: {
      title: 'How the counting pattern works',
      stages: [
        ['Start with an empty dictionary', 'counts = {} has no keys yet.'],
        ['Take the next item', 'The loop hands you one bucket name, such as "1-30".'],
        ['Look up its count so far', 'counts.get(b, 0) gives the stored count, or 0 if this key has never been seen.'],
        ['Add 1 and store it back', 'counts[b] = that number + 1 creates the key the first time and updates it afterwards.'],
        ['Repeat for every item', 'When the loop ends, each key holds how many times it appeared.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'account = {"id": "ACC102", "dpd": 47}\nprint(account["dpd"])', see: '47: the value stored under the key "dpd".', fresh: true },
      { do: 'Add a new key and change an existing one. ' + ADD_LINES, code: 'account["balance"] = 25000\naccount["dpd"] = 48\nprint(account)', see: "{'id': 'ACC102', 'dpd': 48, 'balance': 25000}" },
      { do: 'Ask for a key that does not exist. ' + ADD, code: 'print(account["agent"])', see: "A red KeyError: 'agent'.", error: true },
      { do: 'Use .get() instead, which never fails: change that last line to this.', code: 'print(account.get("agent", "unassigned"))', see: 'unassigned: the fallback you gave.', replaceLast: true },
      { do: 'Loop over keys and values together. ' + ADD_LINES, code: 'for key, value in account.items():\n    print(key, "=", value)', see: 'Three lines: id = ACC102, dpd = 48, balance = 25000.' },
      { do: 'Count things with a dictionary. ' + ADD_LINES, code: 'buckets = ["1-30", "31-60", "1-30"]\ncounts = {}\nfor b in buckets:\n    counts[b] = counts.get(b, 0) + 1\nprint(counts)', see: "{'1-30': 2, '31-60': 1}" },
    ],
  },
  comprehensions: {
    terms: ['comprehension', 'list', 'loop', 'expression', 'condition', 'dict'],
    process: {
      title: 'How to read [a * 2 for a in amounts if a > 500]',
      stages: [
        ['Start in the middle: for a in amounts', 'Take each item of amounts in turn and call it a.'],
        ['Then the end: if a > 500', 'Keep this item only if the condition is True. With no if, every item is kept.'],
        ['Then the start: a * 2', 'For each item kept, work out this expression.'],
        ['Collect the results', 'The square brackets gather every result into a new list. The original list is untouched.'],
      ],
    },
    steps: [
      { do: 'First the long way. ' + FRESH, code: 'amounts = [1200, 450, 3000]\ndoubled = []\nfor a in amounts:\n    doubled.append(a * 2)\nprint(doubled)', see: '[2400, 900, 6000]', fresh: true },
      { do: 'Now the same thing as a comprehension. ' + ADD, code: 'print([a * 2 for a in amounts])', see: '[2400, 900, 6000] again, from one line.' },
      { do: 'Keep only some items by adding an if at the end. ' + ADD, code: 'print([a for a in amounts if a >= 1000])', see: '[1200, 3000]' },
      { do: 'Transform and filter together. ' + ADD, code: 'print([a * 2 for a in amounts if a >= 1000])', see: '[2400, 6000]' },
      { do: 'Build a dictionary the same way, with curly brackets and key: value. ' + ADD_LINES, code: 'names = ["A1", "A2", "A3"]\nprint({n: a for n, a in zip(names, amounts)})', see: "{'A1': 1200, 'A2': 450, 'A3': 3000}" },
    ],
  },

  // ---------------------------------------------------------------- Functions
  functions: {
    terms: ['pyfunction', 'call', 'parameter', 'argument', 'return', 'print', 'block'],
    process: {
      title: 'What happens when you call a function',
      stages: [
        ['def only saves the recipe', 'Python remembers the function under its name. The indented block does not run yet.'],
        ['The call hands over arguments', 'Writing instalment(12000, 3) sends those values in. Each lands in the parameter at the same position.'],
        ['The block runs', 'The indented lines run top to bottom, using the parameters like ordinary variables.'],
        ['return sends a value back', 'The function stops, and the call itself is replaced by the returned value.'],
        ['The caller carries on', 'That value can be stored, printed or used in a calculation. Without a return, the value is None.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'def instalment(amount, months):\n    return amount / months', see: 'No output at all. Defining a function does not run it.', fresh: true },
      { do: 'Call it. This line starts at the left edge, with no indentation. ' + ADD, code: 'print(instalment(12000, 3))', see: '4000.0' },
      { do: 'Store the result and use it. ' + ADD_LINES, code: 'monthly = instalment(9000, 6)\nprint("Pay", monthly, "a month")', see: 'Pay 1500.0 a month' },
      { do: 'Name the arguments so the order does not matter. ' + ADD, code: 'print(instalment(months=4, amount=8000))', see: '2000.0' },
      { do: 'See what happens without return. ' + ADD_LINES, code: 'def shout(text):\n    print(text.upper())\n\nresult = shout("hello")\nprint(result)', see: 'HELLO, then None. shout() printed, but handed nothing back, so result is None.' },
      { do: 'Give a parameter a default value: change the first line to the one below, then add the call.', code: 'print(instalment(12000))', see: '1000.0: with no months given, the default of 12 was used.', edit: ['def instalment(amount, months):', 'def instalment(amount, months=12):'] },
    ],
  },
  'more-functions': {
    terms: ['scope', 'variable', 'parameter', 'argument', 'lambda', 'recursion'],
    process: {
      title: 'How Python finds a name inside a function',
      stages: [
        ['Look inside the function first', 'Names created in the function (including its parameters) are local to it.'],
        ['Then look outside', 'If the name is not local, Python uses the one defined at the top level of the program.'],
        ['Still not found: NameError', 'Python stops and reports the name it could not find.'],
        ['When the function ends, locals vanish', 'A local variable cannot be read from outside. Send values out with return.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'rate = 0.18\n\ndef interest(amount):\n    result = amount * rate\n    return result\n\nprint(interest(1000))', see: '180.0. The function could read rate from outside.', fresh: true },
      { do: 'Try to read a local variable from outside. ' + ADD, code: 'print(result)', see: 'A red NameError: result only existed while the function was running.', error: true },
      { do: 'Delete that last line. Then accept any number of arguments with *args.', code: 'def total(*amounts):\n    return sum(amounts)\n\nprint(total(100, 200, 300))', see: '600. All three arguments arrived together as amounts.', replaceLast: true },
      { do: 'Sort by a rule using lambda, a one-line function. ' + ADD_LINES, code: 'accounts = [("A1", 900), ("A2", 100), ("A3", 500)]\nprint(sorted(accounts, key=lambda acc: acc[1]))', see: "[('A2', 100), ('A3', 500), ('A1', 900)]: sorted by the second item of each pair." },
      { do: 'Write a function that calls itself. ' + ADD_LINES, code: 'def countdown(n):\n    if n == 0:\n        print("Done")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)', see: '3, 2, 1, Done. Each call handled one number and passed the rest on.' },
    ],
  },
  errors: {
    terms: ['error', 'exception', 'traceback', 'block', 'bug'],
    process: {
      title: 'How try / except runs',
      stages: [
        ['The try block starts', 'Python runs its lines one by one as normal.'],
        ['No error: except is skipped', 'The else block (if any) runs, then finally.'],
        ['An error: the rest of try is skipped', 'Python jumps straight out of the try block at the failing line.'],
        ['A matching except runs', 'If an except names that kind of error, its block runs and the program carries on.'],
        ['No match: the program stops', 'The error is reported as usual, with a traceback.'],
        ['finally always runs', 'Whatever happened, the finally block runs last. It is used for tidying up.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'text = "12x"\nnumber = int(text)\nprint(number)', see: 'A red ValueError and a traceback. Read the last line first: it names the error and the bad value.', fresh: true, error: true },
      { do: 'Catch it. Replace lines 2 and 3 with these.', code: 'try:\n    number = int(text)\n    print(number)\nexcept ValueError:\n    print("Not a number:", text)', see: 'Not a number: 12x. The program no longer crashes.', replaceLast: 2 },
      { do: 'Change line 1 to text = "12" and press Run.', see: '12. No error happened, so the except block was skipped.', edit: ['text = "12x"', 'text = "12"'] },
      { do: 'Add a finally block at the end, at the same level as try and except.', code: 'finally:\n    print("Checked")', see: '12, then Checked. finally runs whether or not there was an error.' },
      { do: 'Raise your own error with a clear message. ' + ADD_LINES, code: 'def pay(amount):\n    if amount <= 0:\n        raise ValueError("amount must be positive")\n    return amount\n\ntry:\n    pay(-5)\nexcept ValueError as e:\n    print("Rejected:", e)', see: 'A new last line: Rejected: amount must be positive.' },
    ],
  },

  // ---------------------------------------------------------------- Organising code
  modules: {
    terms: ['module', 'import', 'stdlib', 'pyfunction', 'method'],
    process: {
      title: 'What happens on import math',
      stages: [
        ['Python finds the module', 'It looks for a module called math: first among the ones that come with Python.'],
        ['It runs the module once', 'The module\'s code runs and its functions are created. Importing again reuses this.'],
        ['The name math now exists', 'It points at the whole module, like a toolbox on your workbench.'],
        ['Reach inside with a dot', 'math.sqrt(16) means "the sqrt function inside math".'],
        ['Or bring one name out', 'from math import sqrt lets you write sqrt(16) directly.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'import math\nprint(math.sqrt(16), math.ceil(4.2))', see: '4.0 5: a square root, and 4.2 rounded up.', fresh: true },
      { do: 'Import a single name from a module. ' + ADD_LINES, code: 'from statistics import mean\nprint(mean([1200, 450, 3000]))', see: '1550' },
      { do: 'Count items with Counter. ' + ADD_LINES, code: 'from collections import Counter\nprint(Counter(["SMS", "Call", "SMS"]))', see: "Counter({'SMS': 2, 'Call': 1})" },
      { do: 'Work with dates. ' + ADD_LINES, code: 'from datetime import date\ndue = date(2026, 11, 1)\npaid = date(2026, 11, 14)\nprint((paid - due).days, "days late")', see: '13 days late. Subtracting two dates gives the gap between them.' },
      { do: 'Use a module before importing it. ' + ADD, code: 'print(random.randint(1, 6))', see: 'A red NameError: random has not been imported.', error: true },
      { do: 'Fix it: replace that last line with these three, so random is imported before it is used. Then press Run.', code: 'import random\nrandom.seed(1)\nprint(random.randint(1, 6))', see: 'A number from 1 to 6. With the seed set, it is the same number every run.', replaceLast: true },
    ],
  },
  files: {
    terms: ['file', 'csv', 'json', 'string', 'dict', 'list'],
    process: {
      title: 'How "with open(...)" works',
      stages: [
        ['The file is opened', 'open("notes.txt", "w") opens it for writing ("r" for reading, "a" to add to the end).'],
        ['You get a file object', 'The name after as (often f) is your handle on the open file.'],
        ['The indented block uses it', 'f.write(...) or f.read() happen inside the block.'],
        ['The file closes by itself', 'When the block ends, even because of an error, the file is closed and saved.'],
        ['Files hold text', 'Numbers read from a file arrive as strings. Convert them before doing maths.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'with open("notes.txt", "w") as f:\n    f.write("ACC1,5000\\n")\n    f.write("ACC2,1200\\n")\nprint("saved")', see: 'saved. The file now exists (inside this browser tab only).', fresh: true },
      { do: 'Read it back. ' + ADD_LINES, code: 'with open("notes.txt") as f:\n    text = f.read()\nprint(text)', see: 'ACC1,5000 and ACC2,1200 on two lines.' },
      { do: 'Read it as a table with the csv module. ' + ADD_LINES, code: 'import csv\nwith open("notes.txt") as f:\n    rows = list(csv.reader(f))\nprint(rows)', see: "[['ACC1', '5000'], ['ACC2', '1200']]: a list of rows, each a list of strings." },
      { do: 'Add up the second column. The values are text, so convert them. ' + ADD, code: 'print(sum(int(row[1]) for row in rows))', see: '6200' },
      { do: 'Turn Python data into JSON text and back. ' + ADD_LINES, code: 'import json\ntext = json.dumps({"id": "ACC1", "paid": True})\nprint(text)\nprint(json.loads(text)["id"])', see: '{"id": "ACC1", "paid": true} then ACC1. JSON writes true in lower case.' },
    ],
  },
  classes: {
    terms: ['class', 'object', 'attribute', 'method', 'self', 'pyfunction'],
    process: {
      title: 'What happens on acc = Account("ACC1", 5000)',
      stages: [
        ['Python makes a new, empty object', 'It is an Account, but it has no data yet.'],
        ['__init__ runs', 'The new object is passed in as self, followed by your arguments.'],
        ['__init__ stores the data on self', 'self.balance = balance attaches the value to this particular object as an attribute.'],
        ['The finished object comes back', 'It is stored under the name acc.'],
        ['Methods work on that object', 'acc.pay(1000) calls pay with self set to acc, so it changes acc\'s own balance.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'class Account:\n    def __init__(self, id, balance):\n        self.id = id\n        self.balance = balance\n\nacc = Account("ACC1", 5000)\nprint(acc.id, acc.balance)', see: 'ACC1 5000: the two attributes stored on the object.', fresh: true },
      { do: 'Add a method. Put it inside the class, under __init__, indented to match it (click at the end of the self.balance line and press Enter).', code: '\n    def pay(self, amount):\n        self.balance = self.balance - amount', see: 'The same output. The method exists but has not been called.', insertAt: 4 },
      { do: 'Call the method. ' + ADD_LINES, code: 'acc.pay(1000)\nprint(acc.balance)', see: '4000' },
      { do: 'Make a second object and check they are separate. ' + ADD_LINES, code: 'other = Account("ACC2", 900)\nother.pay(100)\nprint(acc.balance, other.balance)', see: '4000 800. Each object keeps its own balance.' },
      { do: 'Print the object itself. ' + ADD, code: 'print(type(acc).__name__)', see: 'Account: the class this object was made from.' },
    ],
  },

  // ---------------------------------------------------------------- Advanced
  inheritance: {
    terms: ['class', 'inheritance', 'object', 'method', 'attribute', 'decorator'],
    process: {
      title: 'How Python finds a method on a child object',
      stages: [
        ['Look on the object\'s own class', 'If the child class defines the method, that version is used.'],
        ['Not there: look on the parent', 'The parent\'s version is used instead. This is what "inherits" means.'],
        ['super() reaches the parent on purpose', 'Inside the child, super().method() runs the parent\'s version so you can add to it.'],
        ['Not found anywhere: AttributeError', 'Python reports that the object has no such attribute.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'class Account:\n    def __init__(self, balance):\n        self.balance = balance\n\n    def describe(self):\n        return f"Account with {self.balance}"\n\nprint(Account(500).describe())', see: 'Account with 500', fresh: true },
      { do: 'Make a child class that adds nothing yet. ' + ADD_LINES, code: 'class LoanAccount(Account):\n    pass\n\nprint(LoanAccount(900).describe())', see: 'Account with 900. LoanAccount inherited describe() from Account.' },
      { do: 'Replace pass with the child\'s own version of describe that builds on the parent\'s.', code: 'class LoanAccount(Account):\n    def describe(self):\n        return "Loan: " + super().describe()\n\nprint(LoanAccount(900).describe())', see: 'Loan: Account with 900', replaceLast: 4 },
      { do: 'Let Python write __init__ for you with @dataclass. ' + ADD_LINES, code: 'from dataclasses import dataclass\n\n@dataclass\nclass Payment:\n    account: str\n    amount: float\n\nprint(Payment("ACC1", 450.0))', see: "Payment(account='ACC1', amount=450.0): a readable print-out for free." },
    ],
  },
  generators: {
    terms: ['iterator', 'generator', 'yield', 'loop', 'list'],
    process: {
      title: 'How a generator runs',
      stages: [
        ['Calling it runs nothing', 'You get a generator object back. The function body has not started.'],
        ['The first next() starts it', 'The body runs until it reaches a yield.'],
        ['yield hands out a value and pauses', 'The function freezes right there, remembering all its variables.'],
        ['The next next() resumes', 'It continues from the line after the yield until the next yield.'],
        ['The end stops the loop', 'When the body finishes, a for loop over the generator simply ends.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'def reminders(days):\n    for day in range(1, days + 1):\n        print("  working out day", day)\n        yield f"Reminder {day}"\n\ngen = reminders(3)\nprint("nothing has run yet")', see: 'Only: nothing has run yet. Calling a generator function does not start it.', fresh: true },
      { do: 'Ask for one value. ' + ADD, code: 'print(next(gen))', see: 'working out day 1, then Reminder 1. It ran up to the first yield and paused.' },
      { do: 'Ask again. ' + ADD, code: 'print(next(gen))', see: 'working out day 2, then Reminder 2. It carried on from where it paused.' },
      { do: 'Let a for loop collect the rest. ' + ADD_LINES, code: 'for r in gen:\n    print(r)', see: 'working out day 3, then Reminder 3. Only the one remaining value was left.' },
      { do: 'Use a generator expression: like a list comprehension, with round brackets. ' + ADD, code: 'print(sum(n * n for n in range(4)))', see: '14 (0 + 1 + 4 + 9), worked out one number at a time without building a list.' },
    ],
  },
  decorators: {
    terms: ['pyfunction', 'closure', 'decorator', 'call', 'return', 'argument'],
    process: {
      title: 'What happens when Python sees @log above a def',
      stages: [
        ['The function is defined as usual', 'Python builds the function written under the @ line.'],
        ['It is passed to the decorator', 'log(your_function) is called immediately.'],
        ['The decorator returns a wrapper', 'The wrapper is a new function that remembers the original (a closure).'],
        ['The name now points at the wrapper', 'From here on, calling your function really calls the wrapper.'],
        ['The wrapper calls the original', 'It can do something before, call the original, do something after, and return the result.'],
      ],
    },
    steps: [
      { do: 'A function is a value: you can store it under another name. ' + FRESH, code: 'def greet(name):\n    return "Hello " + name\n\nsay = greet\nprint(say("Asha"))', see: 'Hello Asha. say and greet are the same function.', fresh: true },
      { do: 'Write a function that builds and returns another function. ' + ADD_LINES, code: 'def multiplier(factor):\n    def multiply(x):\n        return x * factor\n    return multiply\n\ndouble = multiplier(2)\nprint(double(21))', see: '42. double remembered factor = 2: that memory is a closure.' },
      { do: 'Write a decorator. ' + ADD_LINES, code: 'def log(func):\n    def wrapper(*args):\n        print("calling", func.__name__)\n        return func(*args)\n    return wrapper', see: 'No new output. The decorator is defined but not used yet.' },
      { do: 'Apply it with @. ' + ADD_LINES, code: '@log\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))', see: 'calling add, then 5. The wrapper ran first, then the real add.' },
    ],
  },
  'typing-testing': {
    terms: ['typehint', 'test', 'assert', 'pyfunction', 'bug', 'error'],
    process: {
      title: 'How a test catches a bug',
      stages: [
        ['Pick an input with a known answer', 'For example: 47 days past due must land in the "31-60" bucket.'],
        ['Call your function with it', 'result = bucket(47)'],
        ['Compare with the expected answer', 'assert result == "31-60"'],
        ['Match: nothing happens', 'A passing assert is silent. That silence means "correct".'],
        ['No match: AssertionError', 'The test stops and points at the check that failed, before a user ever sees the bug.'],
      ],
    },
    steps: [
      { do: FRESH, code: 'def bucket(dpd: int) -> str:\n    if dpd <= 30:\n        return "1-30"\n    return "31+"\n\nprint(bucket(12))', see: '1-30. The hints (: int and -> str) describe the types; Python does not enforce them.', fresh: true },
      { do: 'Write a test with assert. ' + ADD_LINES, code: 'assert bucket(12) == "1-30"\nprint("test 1 passed")', see: 'test 1 passed. A passing assert prints nothing by itself.' },
      { do: 'Write a test that fails. ' + ADD, code: 'assert bucket(30) == "31+", "30 days should be 31+"', see: 'A red AssertionError with your message. The test found a disagreement.', error: true },
      { do: 'Decide which is wrong: here the test is. 30 days belongs in "1-30". Change that last line to this.', code: 'assert bucket(30) == "1-30"\nassert bucket(31) == "31+"\nprint("all tests passed")', see: 'all tests passed. The edges (30 and 31) are now checked.', replaceLast: true },
    ],
  },
  project: {
    terms: ['program', 'pyfunction', 'csv', 'dict', 'accumulator', 'test'],
    process: {
      title: 'How to build a program from a blank page',
      stages: [
        ['Say what goes in and what comes out', 'In: rows of text like "ACC1,45,5000". Out: the total balance per bucket.'],
        ['Split the job into small steps', 'Parse a row. Decide its bucket. Add its balance to that bucket\'s total. Print the report.'],
        ['Write one function per step', 'Each function does one thing and returns its result.'],
        ['Test each function alone', 'Call it with one known input and check the answer before moving on.'],
        ['Join them together', 'A final loop calls the small functions for every row.'],
      ],
    },
    steps: [
      { do: 'Step one of the plan: parse one row. ' + FRESH, code: 'def parse(row):\n    account, dpd, balance = row.split(",")\n    return {"account": account, "dpd": int(dpd), "balance": int(balance)}\n\nprint(parse("ACC1,45,5000"))', see: "{'account': 'ACC1', 'dpd': 45, 'balance': 5000}: text turned into typed data.", fresh: true },
      { do: 'Step two: decide the bucket. ' + ADD_LINES, code: 'def bucket(dpd):\n    if dpd <= 30:\n        return "1-30"\n    if dpd <= 60:\n        return "31-60"\n    return "60+"\n\nprint(bucket(45))', see: '31-60' },
      { do: 'Step three: add up balances per bucket. ' + ADD_LINES, code: 'def summarise(rows):\n    totals = {}\n    for row in rows:\n        acc = parse(row)\n        b = bucket(acc["dpd"])\n        totals[b] = totals.get(b, 0) + acc["balance"]\n    return totals', see: 'No new output: the function is defined, not called.' },
      { do: 'Step four: run it on real-looking data. ' + ADD_LINES, code: 'rows = ["ACC1,45,5000", "ACC2,10,1200", "ACC3,50,800", "ACC4,95,7000"]\nreport = summarise(rows)\nprint(report)', see: "{'31-60': 5800, '1-30': 1200, '60+': 7000}" },
      { do: 'Step five: print it for people. ' + ADD_LINES, code: 'for name, total in report.items():\n    print(f"{name:>6}: {total:>7,}")', see: 'Three neat lines, such as  31-60:   5,800.' },
    ],
  },
};
