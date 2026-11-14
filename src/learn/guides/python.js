// Beginner guide for each Python lesson: the big idea, words to know (glossary ids), common
// mistakes [mistake, fix], questions beginners ask [question, answer], and a recap.

export const pythonGuide = {
  hello: {
    idea: 'A program is a list of instructions that Python follows from top to bottom; print() is how a program shows you something.',
    terms: ['python', 'print', 'string', 'comment'],
    mistakes: [
      ['Forgetting the quotes: print(Hello)', 'Text needs quotes: print("Hello"). Without them Python looks for a variable called Hello and raises NameError.'],
      ['Mixing quote types: print("Hello\')', 'Start and end with the same kind of quote, "…" or \'…\'.'],
      ['Writing Print or PRINT', 'Python is case-sensitive: it must be print in lower case.'],
    ],
    faq: [
      ['Where does my code actually run?', 'In your browser, using a real Python interpreter (Pyodide). Nothing is sent to a server, so you can experiment freely.'],
      ['Is an error bad?', 'No. Errors are Python telling you exactly what it did not understand and on which line. Read the last line of the error first; the hint underneath explains it in plain English.'],
      ['Should I use single or double quotes?', 'Either works. Pick one and be consistent. Use the other kind when your text contains a quote: "Shivam\'s portfolio".'],
    ],
    recap: ['Python runs your lines in order, top to bottom.', 'print() shows values; text goes in quotes, numbers do not.', 'Comments start with # and are ignored by Python.'],
  },
  variables: {
    idea: 'A variable is a label stuck on a value so you can use it later by name; every value has a type that decides what you can do with it.',
    terms: ['variable', 'number', 'string', 'boolean'],
    mistakes: [
      ['Reading = as "equals"', 'In Python, = means "store this value under this name". Comparing is ==.'],
      ['Adding text to a number: "5" + 5', 'Convert first: int("5") + 5 gives 10, "5" + str(5) gives "55".'],
      ['Spaces or dashes in names: days past due = 47', 'Use snake_case: days_past_due = 47.'],
    ],
    faq: [
      ['Do I have to say what type a variable is?', 'No. Python works it out from the value. type(x) tells you what it decided.'],
      ['Why is 3.0 a float but 3 an int?', 'The decimal point makes it a float. They are equal in value (3 == 3.0 is True) but stored differently.'],
      ['Can a variable change its type?', 'Yes: x = 5 then x = "five" is allowed. It is usually clearer not to do it.'],
    ],
    recap: ['name = value stores a value; the newest value wins.', 'The four basic types are int, float, str and bool.', 'Convert between types with int(), float() and str().'],
  },
  numbers: {
    idea: 'Python is a precise calculator: it follows maths rules for order, and f-strings turn the results into readable text.',
    terms: ['operator', 'number', 'fstring'],
    mistakes: [
      ['Expecting 7 / 2 to be 3', '/ always gives a float (3.5). Use // for whole-number division (3) and % for the remainder (1).'],
      ['Forgetting brackets: 2 + 3 * 4 expected 20', '* happens before +, so it is 14. Use brackets: (2 + 3) * 4 is 20.'],
      ['Comparing money floats exactly: 0.1 + 0.2 == 0.3', 'It is False because of binary rounding. Round first, or compare with a small tolerance.'],
    ],
    faq: [
      ['What does % mean if not percent?', 'Remainder. 17 % 5 is 2. Useful for "every 3rd item" checks or splitting days into weeks.'],
      ['How do I show ₹1,25,000 with commas?', 'f"{x:,}" gives Western grouping (125,000). Indian lakh grouping needs a small custom function; the course uses Western grouping for simplicity.'],
      ['What does :.1% do?', 'It multiplies by 100, shows 1 decimal and adds a % sign: f"{0.256:.1%}" is "25.6%".'],
    ],
    recap: ['+ - * / work as expected; // is whole division, % the remainder, ** a power.', 'Brackets control the order of operations.', 'f-strings format numbers: {x:,.2f} for money, {r:.1%} for rates.'],
  },
  strings: {
    idea: 'A string is a row of characters with numbered positions, and string methods return new, cleaned-up versions of it.',
    terms: ['string', 'index', 'slice', 'method'],
    mistakes: [
      ['Counting positions from 1', 'Python counts from 0: the first character is text[0].'],
      ['Expecting a slice to include its end: text[0:3] to give 4 characters', 'The end is excluded; [0:3] gives positions 0, 1 and 2.'],
      ['Calling name.strip() and expecting name to change', 'Strings never change in place. Store the result: name = name.strip().'],
    ],
    faq: [
      ['What is the difference between a method and a function?', 'A method belongs to a value and is called with a dot (name.upper()). A function stands alone (len(name)).'],
      ['How do I check if text contains a word?', 'Use in: "loan" in "Personal loan" is True. Add .lower() on both sides to ignore case.'],
      ['What does split() do without arguments?', 'It splits on any run of spaces and ignores extra spaces at the ends.'],
    ],
    recap: ['Positions start at 0; negative positions count from the end.', 'Slices [start:end] stop before end.', 'strip, title, upper, replace, split and join clean and reshape text.'],
  },
  conditions: {
    idea: 'An if statement lets a program choose: it checks conditions from the top and runs the first block whose condition is True.',
    terms: ['condition', 'boolean', 'indentation', 'operator'],
    mistakes: [
      ['Forgetting the colon: if dpd > 30', 'Every if, elif and else line ends with a colon.'],
      ['Not indenting the block underneath', 'Lines that belong to the if must be indented by 4 spaces.'],
      ['Ordering checks badly: if dpd <= 90 before if dpd <= 30', 'Python stops at the first True branch. Put the narrowest condition first.'],
    ],
    faq: [
      ['When do I use elif instead of another if?', 'Use elif when only one branch should run. Separate ifs are all checked, so several can run.'],
      ['What counts as True?', 'True, non-zero numbers and non-empty text or lists. False, 0, "", [] and None count as False.'],
      ['Can I write a one-line if?', 'Yes, for simple choices: label = "late" if dpd > 90 else "ok".'],
    ],
    recap: ['if / elif / else run the first block whose condition is True.', 'Comparisons: == != < > <= >=; combine with and, or, not.', 'Indentation shows which lines belong to which branch.'],
  },
  loops: {
    idea: 'A loop repeats code for every item (for) or while something stays true (while), so you never copy and paste the same line.',
    terms: ['loop', 'indentation', 'condition'],
    mistakes: [
      ['A while loop whose condition never becomes False', 'Make sure something inside the loop changes towards stopping, like balance -= payment.'],
      ['Starting a running total inside the loop', 'Set total = 0 before the loop, otherwise it resets on every round.'],
      ['Expecting range(5) to include 5', 'range(5) is 0, 1, 2, 3, 4. Use range(1, 6) for 1 to 5.'],
    ],
    faq: [
      ['for or while?', 'Use for when you know what you are going through (a list, a range). Use while when you repeat until something happens.'],
      ['How do I get the position as well as the item?', 'for i, amount in enumerate(payments): gives 0, 1, 2… alongside each value.'],
      ['Is a loop slow?', 'For a few thousand items it is fine. For big data, pandas and NumPy do the looping for you, much faster.'],
    ],
    recap: ['for item in collection: runs once per item.', 'The accumulator pattern: start a total before the loop, add inside it.', 'break leaves a loop; continue skips to the next round.'],
  },
  input: {
    idea: 'input() pauses the program to ask a question, and always returns the answer as text that you convert when you need a number.',
    terms: ['input', 'string', 'number'],
    mistakes: [
      ['Doing maths on input directly: input("Amount") * 2', 'input returns text, so this repeats the text. Use float(input("Amount")) * 2.'],
      ['Not giving one Input line per input() call', 'Each input() reads the next line of the Input box. Running out raises EOFError.'],
    ],
    faq: [
      ['Where do I type the answers here?', 'In the Input box under the code: one line per input() call, in order.'],
      ['What if the user types letters instead of a number?', 'float("abc") raises ValueError. The Handling errors lesson shows how to catch it and ask again.'],
    ],
    recap: ['input("Question: ") shows the question and returns the typed text.', 'Wrap it in int() or float() to get a number.', 'Programs combine input, calculation and print.'],
  },
  lists: {
    idea: 'A list keeps many values in order in one variable, and you can add, remove, sort and summarise them.',
    terms: ['list', 'index', 'method'],
    mistakes: [
      ['Using a position that does not exist: balances[10] on a 5-item list', 'Valid positions are 0 to len(list) - 1; anything else raises IndexError.'],
      ['Writing sorted_list = my_list.sort()', '.sort() sorts in place and returns None. Use sorted(my_list) to get a new sorted list.'],
      ['Copying with b = a', 'Both names point to the same list. Use b = a.copy().'],
    ],
    faq: [
      ['Can a list hold different types?', 'Yes, but lists of one kind of thing (all balances, all names) are much easier to work with.'],
      ['append or insert?', 'append adds at the end and is the usual choice; insert puts an item at a given position.'],
      ['How do I remove by position rather than value?', 'pop(i) removes and returns the item at position i; remove(x) removes the first item equal to x.'],
    ],
    recap: ['Lists are ordered and changeable: [a, b, c].', 'append, insert, remove, pop and sort change a list.', 'len, sum, min, max and in summarise and search it.'],
  },
  'tuples-sets': {
    idea: 'Tuples are fixed records you can unpack; sets hold unique values and answer "is it in here?" instantly.',
    terms: ['tuple', 'set'],
    mistakes: [
      ['Expecting a set to keep its order', 'Sets have no order. Use sorted(my_set) when you need one.'],
      ['Writing {} for an empty set', '{} is an empty dictionary. An empty set is set().'],
    ],
    faq: [
      ['Why would I want something that cannot change?', 'It protects data that should stay fixed and lets it be used as a dictionary key.'],
      ['How do I remove duplicates from a list?', 'list(set(items)) removes them (order is lost), or list(dict.fromkeys(items)) keeps the first order.'],
    ],
    recap: ['Tuples: (a, b) — fixed; unpack with x, y = pair.', 'Sets: {a, b} — unique values, fast membership.', '& (both), | (either) and - (only in the first) compare sets.'],
  },
  dicts: {
    idea: 'A dictionary looks values up by a key, like finding a balance by account id instead of by position.',
    terms: ['dict', 'loop'],
    mistakes: [
      ['Reading a missing key with d["agent"]', 'It raises KeyError. Use d.get("agent") or d.get("agent", "unassigned").'],
      ['Looping for k in d and expecting values', 'Looping a dict gives keys. Use d.items() for (key, value) pairs or d.values() for values.'],
    ],
    faq: [
      ['Can keys repeat?', 'No. Assigning to an existing key replaces its value. That is what makes counting with d[k] = d.get(k, 0) + 1 work.'],
      ['What can be a key?', 'Anything that cannot change: strings, numbers, tuples. Lists cannot be keys.'],
      ['Are dictionaries ordered?', 'Yes, since Python 3.7 they keep the order in which keys were added.'],
    ],
    recap: ['{key: value} maps keys to values; look up with d[key] or d.get(key).', 'Loop with for key, value in d.items().', 'Count things with d[k] = d.get(k, 0) + 1.'],
  },
  comprehensions: {
    idea: 'A comprehension builds a new list, dict or set from an existing one in one readable line: what to keep, and what to turn it into.',
    terms: ['comprehension', 'list', 'dict'],
    mistakes: [
      ['Putting the if in the wrong place: [x if x > 0 for x in xs]', 'A filter goes at the end: [x for x in xs if x > 0]. An if-else that changes values goes at the front: [x if x > 0 else 0 for x in xs].'],
      ['Cramming too much into one line', 'If it needs two ifs or two loops, a normal for loop is clearer.'],
    ],
    faq: [
      ['Is a comprehension faster than a loop?', 'Slightly, but the main win is readability. Use whichever is clearer.'],
      ['What is zip?', 'zip(a, b) walks two lists side by side, giving pairs: handy for building a dict from two lists.'],
    ],
    recap: ['[expression for item in collection if condition]', '{key: value for …} builds a dict; {value for …} a set.', 'sum(x for x in …) works without building a list.'],
  },
  functions: {
    idea: 'A function packages steps under a name so you can reuse them: values go in as parameters and the answer comes out with return.',
    terms: ['pyfunction', 'parameter', 'return'],
    mistakes: [
      ['Printing the result instead of returning it', 'print only shows it. return hands it back so other code can use it.'],
      ['Forgetting the brackets when calling: emi instead of emi(…)', 'Without brackets you refer to the function itself; with them you run it.'],
      ['Code after return expecting to run', 'return ends the function immediately.'],
    ],
    faq: [
      ['Why write functions at all?', 'Write the logic once, give it a clear name, and test it. When the rule changes, you change one place.'],
      ['What is a docstring?', 'The text in triple quotes right under def. It explains what the function does and shows up in help(function).'],
      ['How many parameters is too many?', 'If you need more than about five, group them (a dict or a class) or split the function.'],
    ],
    recap: ['def name(parameters): … return result', 'Defaults (channel="SMS") make parameters optional.', 'return gives a value back; print only shows it.'],
  },
  'more-functions': {
    idea: 'Functions have their own private variables, can accept any number of arguments, and can be passed around like any other value.',
    terms: ['scope', 'parameter', 'pyfunction'],
    mistakes: [
      ['Changing a global variable inside a function and expecting it to stick', 'Return the new value instead and assign it outside. (global exists but makes code hard to follow.)'],
      ['Recursion without a base case', 'Every recursive function needs a simple case that returns without calling itself.'],
    ],
    faq: [
      ['When would I use *args?', 'When the number of inputs varies, like total(100, 250, 75) or total(5).'],
      ['What is a lambda for?', 'Short one-off functions, mostly as the key= of sorted, min or max.'],
      ['Is recursion common in data work?', 'Not very. Loops are usually simpler; recursion shines for tree-like data such as folders or org charts.'],
    ],
    recap: ['Variables inside a function are local to it.', '*args collects extra positional arguments, **kwargs keyword arguments.', 'sorted(items, key=lambda x: x[1]) sorts by any rule.'],
  },
  errors: {
    idea: 'When something goes wrong Python raises an exception; try/except lets your program deal with it instead of crashing.',
    terms: ['exception'],
    mistakes: [
      ['Catching everything with a bare except:', 'It also hides typos and real bugs. Catch the error you expect, like except ValueError.'],
      ['Silently ignoring an error with pass', 'At least count or log what was skipped, so bad data does not disappear unnoticed.'],
    ],
    faq: [
      ['Should my functions raise errors?', 'Yes, when given input they cannot handle. A clear ValueError is far better than a silently wrong answer.'],
      ['What is finally for?', 'Clean-up that must always happen, like closing a file or connection, whether or not there was an error.'],
    ],
    recap: ['try: risky code, except SomeError: what to do instead.', 'else runs when no error happened; finally always runs.', 'raise ValueError("clear message") rejects bad input.'],
  },
  modules: {
    idea: 'A module is ready-made code you import; Python\'s standard library already solves dates, statistics, randomness and much more.',
    terms: ['module'],
    mistakes: [
      ['Naming your own file random.py or csv.py', 'It hides the real module and imports break. Use names that do not clash.'],
      ['import math then calling sqrt(9)', 'With import math you write math.sqrt(9). Use from math import sqrt to write sqrt(9).'],
    ],
    faq: [
      ['What is the difference between a module and a package?', 'A module is one .py file; a package is a folder of modules. You import both the same way.'],
      ['What is pip?', 'The tool that installs extra packages (like pandas) on your own computer: pip install pandas.'],
    ],
    recap: ['import module, or from module import name.', 'datetime for dates, statistics for averages, collections.Counter for counting.', 'random.seed(…) makes "random" results repeatable.'],
  },
  files: {
    idea: 'Programs read and write files to keep data: open a file inside a with block, and use the csv and json modules for structured data.',
    terms: ['csv', 'json'],
    mistakes: [
      ['Opening with "w" when you meant to add', '"w" empties the file first. Use "a" to append.'],
      ['Forgetting that CSV values are text', 'csv.DictReader gives strings; convert with float() or int() before maths.'],
    ],
    faq: [
      ['Why use with open(…)?', 'It closes the file automatically, even if an error happens.'],
      ['Where do these files go here?', 'Into a small virtual disk inside your browser tab. They disappear when you reload.'],
      ['CSV or JSON?', 'CSV for flat tables (rows and columns); JSON for nested data like settings or API responses.'],
    ],
    recap: ['with open(path, mode) as f: — "r" read, "w" write, "a" append.', 'csv.DictReader turns each row into a dict.', 'json.dumps / json.loads convert between Python and JSON text.'],
  },
  classes: {
    idea: 'A class is a blueprint that bundles data with the actions on that data; each object made from it has its own copy of the data.',
    terms: ['class', 'object', 'method'],
    mistakes: [
      ['Forgetting self in a method: def pay(amount)', 'Every method takes self first: def pay(self, amount).'],
      ['Setting attributes on the class when each object needs its own', 'Set per-object data in __init__ with self.name = …'],
    ],
    faq: [
      ['When should I write a class instead of functions?', 'When some data and the actions on it always travel together, like an account and its payments.'],
      ['What is __repr__?', 'The text Python shows when you print an object. Making it readable helps a lot when debugging.'],
    ],
    recap: ['class Name: with __init__(self, …) to set up each object.', 'Methods are functions inside the class that use self.', 'Each object keeps its own attribute values.'],
  },
  inheritance: {
    idea: 'Inheritance builds a specialised class on top of a general one; dataclasses write the boring parts of a class for you.',
    terms: ['inheritance', 'class', 'decorator'],
    mistakes: [
      ['Copying the parent\'s __init__ code into the child', 'Call super().__init__(…) and only add what is new.'],
      ['Using a mutable default in a dataclass: tags: list = []', 'Use field(default_factory=list) so each object gets its own list.'],
    ],
    faq: [
      ['When is inheritance the wrong tool?', 'When the child is not truly a kind of the parent. Often it is simpler to put one object inside another.'],
      ['What does @property do?', 'It lets you read a calculated value like an attribute (loan.emi), always up to date.'],
    ],
    recap: ['class Child(Parent): inherits everything; super() calls the parent.', '@dataclass writes __init__, __repr__ and __eq__ from fields.', '@property makes a calculated attribute.'],
  },
  generators: {
    idea: 'A generator produces values one at a time, only when asked, so it can handle huge or endless sequences without filling memory.',
    terms: ['generator', 'iterator'],
    mistakes: [
      ['Looping over the same generator twice', 'A generator is used up after one pass. Call the function again for a fresh one.'],
      ['Calling list() on an endless generator', 'It never finishes. Use itertools.islice to take a few values.'],
    ],
    faq: [
      ['What is the difference between return and yield?', 'return ends a function and gives one value; yield gives a value and pauses, ready to give the next.'],
      ['Where are generators used in real work?', 'Reading big files line by line, streaming data, batching records for an API or SMS gateway.'],
    ],
    recap: ['A function with yield is a generator.', 'Values are produced lazily, one per next() or loop round.', '(x for x in …) is a generator expression.'],
  },
  decorators: {
    idea: 'Functions are values, so a decorator can wrap a function to add behaviour like timing, logging or caching without changing its code.',
    terms: ['decorator', 'pyfunction'],
    mistakes: [
      ['Forgetting to return the wrapper from the decorator', 'The decorator must return the new function, or the name becomes None.'],
      ['Losing the original name and docstring', 'Put @functools.wraps(func) on the wrapper.'],
    ],
    faq: [
      ['Where have I already seen decorators?', '@dataclass and @property in the previous lessons, and @lru_cache here.'],
      ['What is a closure?', 'An inner function that remembers variables from the function that created it, like a fee rate.'],
    ],
    recap: ['@decorator above def f is f = decorator(f).', 'A wrapper(*args, **kwargs) can run code before and after the original.', '@lru_cache remembers results so repeated calls are instant.'],
  },
  'typing-testing': {
    idea: 'Type hints describe what a function expects, and tests prove it works; together they make code safe to change.',
    terms: ['typehint', 'test'],
    mistakes: [
      ['Expecting type hints to stop wrong types', 'Python ignores them while running; use an editor or mypy to check them.'],
      ['Testing only the happy path', 'Test edge cases too: zero, empty input, the biggest and smallest values, bad text.'],
    ],
    faq: [
      ['assert or unittest?', 'assert is perfect for quick checks; unittest (or pytest on your computer) organises many tests and reports results.'],
      ['How do I make code easy to test?', 'Write functions that take inputs and return outputs without printing or reading global variables.'],
    ],
    recap: ['def f(x: int) -> str: documents types.', 'assert condition, "message" fails loudly when something is wrong.', 'unittest.TestCase groups tests; run them with unittest.main().'],
  },
  project: {
    idea: 'Real programs are small, clear functions combined: parse the data, label it, then summarise it.',
    terms: ['csv', 'dict', 'pyfunction'],
    mistakes: [
      ['Doing everything in one long block', 'Split into parse, bucket and report functions you can test separately.'],
      ['Forgetting to convert CSV text to numbers', 'Convert once, when parsing, so every later step can trust the types.'],
    ],
    faq: [
      ['What should I learn next?', 'The pandas course: it does this kind of report in a few lines, on files of any size.'],
      ['How do I run Python on my own computer?', 'Install it from python.org, then run files with python my_script.py, or use VS Code or Jupyter.'],
    ],
    recap: ['Break a problem into small functions.', 'Convert data types once, at the start.', 'Return results as a dict so they are easy to print, test or save.'],
  },
};
