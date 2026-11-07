import { code } from './util';

export const pythonKb = {
  intro: 'Everything you need to know about Python, from your first print() to how professionals write fast, tested, production code. Every example runs in your browser.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'what-is-python',
      level: 'beginner',
      title: 'What programming is, and why Python',
      summary: 'A program is a list of instructions the computer follows from top to bottom. Python is a language that reads almost like English.',
      body: [
        'A computer only does exactly what it is told. A **program** is a set of written instructions, and a **programming language** is the set of words and rules you write them in. Python runs your instructions one line at a time, from the top of the file to the bottom.',
        'Python is popular because it is easy to read and has a huge library of ready-made tools: it is used for data analysis, websites, automation, science and AI. Lines starting with `#` are **comments**: notes for humans that Python ignores.',
      ],
      code: code`
        # This is a comment. Python skips it.
        print("Hello!")            # print() shows text on the screen
        print("2 + 3 =", 2 + 3)    # Python can do maths
        print("Done")              # runs last, because it is the last line
      `,
      lang: 'python',
      run: true,
      points: ['Programs run top to bottom, one line at a time.', 'print() shows a value so you can see what your program is doing.', '# starts a comment for humans.'],
      realWorld: 'A weather service runs Python every hour to download readings from thousands of stations and print a summary for forecasters.',
      check: { q: 'In what order does Python run the lines of a simple program?', options: ['Random order', 'Bottom to top', 'Top to bottom', 'Alphabetical order'], answer: 2, why: 'Python follows the instructions in the order they are written.' },
      lesson: 'hello',
    },
    {
      id: 'variables-types',
      level: 'beginner',
      title: 'Variables and data types',
      summary: 'A variable is a labelled box that stores a value. The type says what kind of value it is: a whole number, a decimal, text or True/False.',
      body: [
        'You create a variable with `=`: `price = 250` puts 250 in a box labelled price. Later you can use the name instead of the value, and change it whenever you like.',
        'The four basic types are `int` (whole numbers like 3), `float` (decimals like 2.5), `str` (text in quotes like "apple") and `bool` (`True` or `False`). `type()` tells you a value\'s type. Types matter: `"5" + "5"` joins text into "55", while `5 + 5` is 10.',
      ],
      code: code`
        item = "Notebook"     # str  (text)
        price = 45.5          # float (decimal)
        quantity = 3          # int  (whole number)
        in_stock = True       # bool (True/False)

        total = price * quantity
        print(item, "total:", total)
        print(type(item), type(price), type(quantity), type(in_stock))
        print("5" + "5", "vs", 5 + 5)
      `,
      lang: 'python',
      run: true,
      points: ['= stores a value in a variable (it does not mean "equals").', 'int, float, str and bool are the basic types.', 'Convert between types with int(), float() and str().'],
      realWorld: 'A shop\'s billing app stores each product\'s name (str), price (float), quantity (int) and whether it is taxable (bool).',
      check: { q: 'What does "7" + "3" give in Python?', options: ['10', '"73"', 'An error', '7.3'], answer: 1, why: 'Both are text (str), so + joins them.' },
      lesson: 'variables',
    },
    {
      id: 'strings',
      level: 'beginner',
      title: 'Working with text (strings)',
      summary: 'Strings hold text. You can join them, change their case, cut out pieces and build sentences with f-strings.',
      body: [
        'A string is text inside quotes. Each character has a position called an **index**, starting at 0, so `name[0]` is the first letter. Methods like `.upper()`, `.strip()` (removes spaces at the ends) and `.replace()` return a changed copy.',
        'An **f-string** (a string with `f` before the quote) lets you put variables and calculations inside `{ }`. Add a format after a colon: `{price:,.2f}` shows commas and 2 decimals.',
      ],
      code: code`
        name = "  priya sharma  "
        clean = name.strip().title()
        print(clean)                 # Priya Sharma
        print(clean[0], clean[-1])   # first and last letters
        print(clean.split(" "))      # ['Priya', 'Sharma']

        price = 1249.5
        print(f"{clean} paid Rs {price:,.2f}")
      `,
      lang: 'python',
      run: true,
      points: ['Indexes start at 0; -1 is the last character.', 'String methods return a new string; the original does not change.', 'f"{value:,.2f}" formats numbers neatly.'],
      realWorld: 'A hospital system tidies patient names typed in different ways ("  RAHUL ", "rahul") before matching records.',
      check: { q: 'What is "Python"[0]?', options: ['"P"', '"y"', '"n"', 'An error'], answer: 0, why: 'Indexes start at 0, so position 0 is the first character.' },
      lesson: 'strings',
    },
    {
      id: 'if-else',
      level: 'beginner',
      title: 'Making decisions with if, elif and else',
      summary: 'if runs code only when a condition is True. elif checks another condition, and else catches everything else.',
      body: [
        'A condition is a question with a True/False answer, written with comparison operators: `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`. Combine conditions with `and`, `or` and `not`.',
        'Python uses **indentation** (4 spaces) to know which lines belong to the `if`. Only the first branch whose condition is True runs; the rest are skipped.',
      ],
      code: code`
        score = 72

        if score >= 90:
            grade = "A"
        elif score >= 75:
            grade = "B"
        elif score >= 60:
            grade = "C"
        else:
            grade = "Needs support"

        print("Grade:", grade)
        print("Passed?", score >= 60 and score <= 100)
      `,
      lang: 'python',
      run: true,
      points: ['== compares; = assigns.', 'Indentation decides what is inside the if.', 'Only the first True branch runs.'],
      realWorld: 'A school report system turns marks into grades with exactly this kind of if/elif ladder.',
      check: { q: 'With score = 80, which branch runs in the example?', options: ['"A"', '"B"', '"C"', 'Both B and C'], answer: 1, why: '80 is not ≥ 90, but it is ≥ 75; after that branch runs, the others are skipped.' },
      lesson: 'conditions',
    },
    {
      id: 'lists-loops',
      level: 'beginner',
      title: 'Lists and loops',
      summary: 'A list holds many values in order. A for loop repeats code once for each item, so you never copy and paste the same line.',
      body: [
        'Write a list with square brackets: `fruits = ["apple", "mango"]`. Add with `.append()`, count with `len()`, and read items by index like strings.',
        'A `for` loop takes each item in turn: `for f in fruits:`. `range(5)` gives 0 to 4 when you need to count. A `while` loop repeats as long as a condition stays True; make sure it eventually becomes False.',
      ],
      code: code`
        cart = [120, 45, 300, 80]
        cart.append(55)

        total = 0
        for price in cart:
            total = total + price
        print("Items:", len(cart), "Total:", total)

        for i in range(3):
            print("Reminder", i + 1)

        stock = 3
        while stock > 0:
            print("Selling one, left:", stock - 1)
            stock -= 1
      `,
      lang: 'python',
      run: true,
      points: ['Lists keep order and can change.', 'for item in list: repeats for each item.', 'range(n) counts from 0 to n-1.'],
      realWorld: 'A fitness app loops through every workout in your week to add up the minutes and calories.',
      check: { q: 'How many numbers does range(4) produce?', options: ['3', '4', '5', 'It depends'], answer: 1, why: 'range(4) gives 0, 1, 2, 3: four numbers.' },
      lesson: 'loops',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'dicts-sets',
      level: 'intermediate',
      title: 'Dictionaries and sets',
      summary: 'A dictionary looks values up by a key, like a phone book. A set stores unique values and answers "is it in here?" instantly.',
      body: [
        'A dictionary maps keys to values: `ages = {"Asha": 31}`. Read with `ages["Asha"]`, or `ages.get("Ravi", 0)` to get a default instead of an error. Loop over pairs with `.items()`.',
        'A set removes duplicates automatically and supports maths like union (`|`), intersection (`&`) and difference (`-`). Both dictionaries and sets find items in roughly constant time, however big they are.',
      ],
      code: code`
        text = "the cat sat on the mat the end"
        counts = {}
        for word in text.split():
            counts[word] = counts.get(word, 0) + 1
        print(counts)
        print("Most common:", max(counts, key=counts.get))

        monday = {"Asha", "Ravi", "Meera"}
        tuesday = {"Ravi", "John"}
        print("Both days:", monday & tuesday)
        print("Any day:", monday | tuesday)
      `,
      lang: 'python',
      run: true,
      points: ['dict[key] reads; dict.get(key, default) reads safely.', 'Keys must be unique and unchangeable (str, int, tuple).', 'Sets remove duplicates and support &, |, -.'],
      realWorld: 'An online store keeps a dictionary from product code to price so checkout can look up any item instantly.',
      check: { q: 'What does {"a": 1}.get("b", 0) return?', options: ['None', 'An error', '0', '1'], answer: 2, why: '"b" is missing, so .get returns the default you gave, 0.' },
      lesson: 'dicts',
    },
    {
      id: 'functions',
      level: 'intermediate',
      title: 'Functions',
      summary: 'A function is a named, reusable block of code. You give it inputs (parameters) and it gives back a result with return.',
      body: [
        'Define with `def name(parameters):`. Call it by name with arguments. `return` sends a value back; without it, the function returns `None`. Parameters can have defaults, and you can pass arguments by name for clarity.',
        'Variables created inside a function are **local**: they exist only while it runs. Good functions do one job, have a clear name, and include a short docstring explaining what they do.',
      ],
      code: code`
        def bmi(weight_kg, height_m, digits=1):
            """Body-mass index, rounded."""
            return round(weight_kg / height_m ** 2, digits)

        def category(value):
            if value < 18.5:
                return "Underweight"
            if value < 25:
                return "Healthy"
            return "Above healthy range"

        for w in [52, 68, 90]:
            b = bmi(w, height_m=1.72)
            print(w, "kg ->", b, category(b))
      `,
      lang: 'python',
      run: true,
      points: ['def creates a function; return gives back a value.', 'Default parameters make arguments optional.', 'Local variables do not leak out of the function.'],
      realWorld: 'A tax calculator wraps each rule ("standard deduction", "slab rate") in its own small function so each can be tested.',
      check: { q: 'What does a function return if it has no return statement?', options: ['0', 'An empty string', 'None', 'An error'], answer: 2, why: 'Python functions return None by default.' },
      lesson: 'functions',
    },
    {
      id: 'errors',
      level: 'intermediate',
      title: 'Errors and exceptions',
      summary: 'When something goes wrong Python raises an exception. Read the last line of the error first, and use try/except to handle problems you expect.',
      body: [
        'An error message (a **traceback**) ends with the exception type and a description, like `ZeroDivisionError: division by zero`, and lists the line where it happened. Common ones: `NameError` (misspelt variable), `TypeError` (wrong type), `ValueError` (right type, bad value), `KeyError` (missing dictionary key).',
        '`try:` runs risky code; `except SomeError:` runs if that error happens; `else:` runs if none did; `finally:` always runs. Catch specific errors, not everything, so real bugs are not hidden. Use `raise` to signal your own errors.',
      ],
      code: code`
        def parse_age(text):
            age = int(text)              # may raise ValueError
            if age < 0:
                raise ValueError("age cannot be negative")
            return age

        for entry in ["34", "abc", "-5"]:
            try:
                print(entry, "->", parse_age(entry))
            except ValueError as e:
                print(entry, "-> invalid:", e)
      `,
      lang: 'python',
      run: true,
      points: ['Read the last line of a traceback first.', 'Catch the specific exception you expect.', 'raise ValueError("…") reports bad input clearly.'],
      realWorld: 'A flight-booking form catches a ValueError when someone types letters in the passport-number field and asks them to fix it.',
      check: { q: 'int("hello") raises which exception?', options: ['TypeError', 'ValueError', 'NameError', 'KeyError'], answer: 1, why: 'The type (str) is fine for int(), but this value cannot be converted.' },
      lesson: 'errors',
    },
    {
      id: 'files',
      level: 'intermediate',
      title: 'Files, CSV and JSON',
      summary: 'Programs save and load data with files. CSV is for tables, JSON for nested data, and with open(...) closes the file for you.',
      body: [
        '`with open("notes.txt", "w") as f:` opens a file for writing ("w"), reading ("r") or appending ("a") and closes it automatically. The `csv` module reads rows as lists or dictionaries; `json` turns Python dictionaries and lists into text and back.',
        'Always say the encoding (`encoding="utf-8"`) so names with accents or ₹ signs survive. The browser here has its own small file system, so the example really writes files.',
      ],
      code: code`
        import csv, json

        rows = [{"city": "Pune", "temp": 31}, {"city": "Shimla", "temp": 14}]
        with open("weather.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["city", "temp"])
            writer.writeheader()
            writer.writerows(rows)

        with open("weather.csv", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                print(row["city"], int(row["temp"]) + 2)

        settings = {"units": "C", "alerts": ["rain", "heat"]}
        text = json.dumps(settings, indent=2)
        print(text)
        print(json.loads(text)["alerts"][0])
      `,
      lang: 'python',
      run: true,
      points: ['with open(...) closes files automatically.', 'CSV values come back as text: convert them.', 'json.dumps / json.loads convert to and from text.'],
      realWorld: 'Most web APIs (weather, maps, payments) send JSON, which Python turns into dictionaries with json.loads.',
      check: { q: 'Values read with csv.DictReader are…', options: ['Already numbers', 'Always text (str)', 'Booleans', 'Lists'], answer: 1, why: 'CSV is plain text; convert numbers yourself with int() or float().' },
      lesson: 'files',
    },
    {
      id: 'comprehensions',
      level: 'intermediate',
      title: 'Comprehensions and handy built-ins',
      summary: 'Comprehensions build a list or dictionary in one readable line. sorted, zip, enumerate, sum, any and all save you writing loops.',
      body: [
        '`[x * 2 for x in nums if x > 0]` means "for each x in nums that is positive, keep x * 2". Dictionary and set comprehensions use `{ }`.',
        '`sorted(items, key=..., reverse=True)` sorts by any rule. `zip` walks two lists side by side, `enumerate` gives a counter with each item, and `any`/`all` answer "is at least one / is every item True?".',
      ],
      code: code`
        students = ["Asha", "Ravi", "Meera", "John"]
        marks = [88, 54, 92, 67]

        passed = [s for s, m in zip(students, marks) if m >= 60]
        print("Passed:", passed)

        report = {s: m for s, m in zip(students, marks)}
        ranking = sorted(report.items(), key=lambda pair: pair[1], reverse=True)
        for place, (name, mark) in enumerate(ranking, start=1):
            print(place, name, mark)

        print("Anyone above 90?", any(m > 90 for m in marks))
        print("Average:", sum(marks) / len(marks))
      `,
      lang: 'python',
      run: true,
      points: ['[expr for x in items if cond] builds a list.', 'key= tells sorted what to sort by.', 'zip pairs lists; enumerate counts.'],
      realWorld: 'A sports app ranks players by points with sorted(…, key=…, reverse=True) after every match.',
      check: { q: 'What does [n * n for n in range(4)] give?', options: ['[1, 4, 9, 16]', '[0, 1, 4, 9]', '[0, 2, 4, 6]', '16'], answer: 1, why: 'range(4) is 0–3, and each is squared.' },
      lesson: 'comprehensions',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'classes',
      level: 'advanced',
      title: 'Classes and object-oriented programming',
      summary: 'A class is a blueprint that bundles data (attributes) with the functions that work on it (methods). Dataclasses remove the boilerplate.',
      body: [
        '`class Account:` defines a new type; `__init__` sets up each new object, and `self` is the object itself. Methods are functions inside the class. **Inheritance** lets a class reuse and extend another one.',
        'For classes that mostly hold data, `@dataclass` writes `__init__`, a readable printout and comparison for you. Special methods like `__str__` and `__lt__` let your objects work with print() and sorted().',
      ],
      code: code`
        from dataclasses import dataclass, field

        @dataclass
        class Book:
            title: str
            author: str
            copies: int = 1
            borrowed_by: list = field(default_factory=list)

            def borrow(self, member):
                if len(self.borrowed_by) >= self.copies:
                    raise RuntimeError(f"No copies of {self.title} left")
                self.borrowed_by.append(member)

            @property
            def available(self):
                return self.copies - len(self.borrowed_by)

        b = Book("Wings of Fire", "A. P. J. Abdul Kalam", copies=2)
        b.borrow("Asha"); b.borrow("Ravi")
        print(b)
        print("Available:", b.available)
        try:
            b.borrow("Meera")
        except RuntimeError as e:
            print(e)
      `,
      lang: 'python',
      run: true,
      points: ['Classes bundle data with behaviour.', '@dataclass generates __init__ and __repr__.', 'Use field(default_factory=list) for list defaults, never = [].'],
      realWorld: 'A library system models Book, Member and Loan as classes so each knows its own rules.',
      check: { q: 'Why use field(default_factory=list) instead of borrowed_by: list = []?', options: ['It is faster', 'So each object gets its own new list instead of sharing one', 'Lists are not allowed', 'It makes it read-only'], answer: 1, why: 'A mutable default would be shared between all objects; dataclasses refuse it for that reason.' },
      lesson: 'classes',
    },
    {
      id: 'generators',
      level: 'advanced',
      title: 'Iterators and generators',
      summary: 'A generator produces values one at a time with yield, so you can process millions of rows without holding them all in memory.',
      body: [
        'Anything you can loop over is **iterable**. A function with `yield` becomes a generator: each time the loop asks for the next value, the function runs until the next `yield` and pauses there.',
        'Generator expressions look like list comprehensions with round brackets: `sum(x for x in data)`. Chaining generators builds a memory-light pipeline, and `itertools` adds tools like `islice`, `groupby` and `chain`.',
      ],
      code: code`
        import itertools

        def read_log():
            """Pretend this is a 10 GB server log read line by line."""
            for i in range(1, 1_000_001):
                status = 500 if i % 250_000 == 0 else 200
                yield f"request {i} status {status}"

        errors = (line for line in read_log() if line.endswith("500"))
        for line in errors:
            print(line)

        first_three = list(itertools.islice(read_log(), 3))
        print(first_three)
      `,
      lang: 'python',
      run: true,
      points: ['yield pauses a function and hands back one value.', 'Generators are lazy: values are made only when needed.', 'A generator can be looped over only once.'],
      realWorld: 'Log-monitoring tools stream gigabytes of web-server logs through generators to find errors without running out of memory.',
      check: { q: 'What is the main benefit of a generator over building a list?', options: ['It sorts values', 'It uses very little memory because values are produced one at a time', 'It runs on the GPU', 'It can be reused forever'], answer: 1, why: 'Only the current value exists in memory.' },
      lesson: 'generators',
    },
    {
      id: 'decorators',
      level: 'advanced',
      title: 'Closures and decorators',
      summary: 'Functions are values: you can pass them around and return them. A decorator wraps a function to add behaviour like timing, logging or caching.',
      body: [
        'A **closure** is an inner function that remembers variables from the function that created it. A **decorator** is a function that takes a function and returns a new one; `@timer` above a def is shorthand for `f = timer(f)`.',
        'The standard library has useful ones: `functools.lru_cache` remembers results so repeated calls are instant, and `functools.wraps` keeps the original function\'s name and docstring on your wrapper.',
      ],
      code: code`
        import time, functools

        def timer(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start = time.perf_counter()
                result = func(*args, **kwargs)
                print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
                return result
            return wrapper

        @functools.lru_cache(maxsize=None)
        def fib(n):
            return n if n < 2 else fib(n - 1) + fib(n - 2)

        @timer
        def report(n):
            return fib(n)

        print(report(80))
        print(fib.cache_info())
      `,
      lang: 'python',
      run: true,
      points: ['@decorator is shorthand for f = decorator(f).', 'Use *args, **kwargs so wrappers work with any function.', 'lru_cache memoises results of pure functions.'],
      realWorld: 'Web frameworks like Flask and FastAPI use decorators (@app.get("/users")) to connect URLs to functions.',
      check: { q: 'What does @functools.lru_cache do?', options: ['Logs every call', 'Remembers results for arguments it has seen', 'Runs the function in parallel', 'Checks types'], answer: 1, why: 'It caches return values keyed by the arguments.' },
      lesson: 'decorators',
    },
    {
      id: 'modules-packages',
      level: 'advanced',
      title: 'Modules, packages and virtual environments',
      summary: 'Split code into modules (files) and packages (folders), install libraries with pip, and give every project its own virtual environment.',
      body: [
        'Any `.py` file is a **module** you can `import`. A folder of modules is a **package**. Put code that should only run when the file is executed directly under `if __name__ == "__main__":`.',
        'A **virtual environment** is a private folder of installed libraries for one project, so projects never fight over versions. Record dependencies in `requirements.txt` or `pyproject.toml` so anyone can recreate the setup. Tools like `uv` and `poetry` automate all of this.',
      ],
      code: code`
        # Terminal, on your own computer:
        python -m venv .venv               # create the environment
        source .venv/bin/activate          # macOS/Linux  (Windows: .venv\Scripts\activate)
        pip install pandas requests        # install into this project only
        pip freeze > requirements.txt      # record exact versions

        # project layout
        weather_app/
          pyproject.toml
          src/weather/__init__.py
          src/weather/fetch.py             # from weather.fetch import get_forecast
          tests/test_fetch.py
      `,
      lang: 'bash',
      points: ['One virtual environment per project.', 'Pin dependencies so builds are repeatable.', 'if __name__ == "__main__": guards script-only code.'],
      realWorld: 'A data team keeps each client project in its own environment so upgrading pandas for one never breaks another.',
      check: { q: 'Why use a virtual environment?', options: ['It makes Python faster', 'It isolates each project\'s libraries and versions', 'It is required to print', 'It encrypts your code'], answer: 1, why: 'Different projects can need different library versions.' },
      lesson: 'modules',
    },
    {
      id: 'testing',
      level: 'advanced',
      title: 'Testing and type hints',
      summary: 'Tests are small programs that check your code gives the right answers. Type hints document what each function expects and let tools catch mistakes early.',
      body: [
        'A test calls your function with known inputs and **asserts** the expected output. `pytest` finds functions named `test_*` and runs them; the standard library\'s `unittest` works the same way with classes. Test normal cases, edge cases (empty, zero, negative) and errors.',
        '**Type hints** like `def total(prices: list[float]) -> float:` do not change how Python runs, but editors and checkers such as mypy and pyright use them to spot bugs before you run anything.',
      ],
      code: code`
        import unittest

        def discount(price: float, percent: float) -> float:
            if not 0 <= percent <= 100:
                raise ValueError("percent must be 0-100")
            return round(price * (1 - percent / 100), 2)

        class DiscountTests(unittest.TestCase):
            def test_normal(self):
                self.assertEqual(discount(200, 10), 180.0)

            def test_zero(self):
                self.assertEqual(discount(99.99, 0), 99.99)

            def test_invalid(self):
                with self.assertRaises(ValueError):
                    discount(100, 150)

        unittest.main(argv=["tests"], exit=False, verbosity=2)
      `,
      lang: 'python',
      run: true,
      points: ['A test = known input + expected output.', 'Cover edge cases and errors, not just the happy path.', 'Type hints are checked by tools, not at runtime.'],
      realWorld: 'Payment companies run thousands of automated tests on every change so a rounding bug never reaches customers.',
      check: { q: 'Do type hints stop a program running with the wrong type?', options: ['Yes, always', 'No, they are for tools and readers; Python ignores them at runtime', 'Only for strings', 'Only in classes'], answer: 1, why: 'Python does not enforce hints; checkers like mypy do.' },
      lesson: 'typing-testing',
    },
    // ------------------------------------------------------------ expert
    {
      id: 'performance',
      level: 'expert',
      title: 'Performance: Big-O, profiling and the right data structure',
      summary: 'Measure before you optimise. The biggest wins come from better algorithms and data structures, not clever tricks.',
      body: [
        '**Big-O** describes how work grows with input size: checking `x in a_list` is O(n) (it scans every item), while `x in a_set` is O(1) on average (one hash lookup). With a million items that is the difference between seconds and microseconds.',
        'Use `timeit` for small snippets and `cProfile` to find which function is slow in a real program. Then: pick the right structure (set/dict for lookups, deque for queues, heapq for "top N"), move work out of loops, and use vectorised libraries like NumPy for numbers.',
      ],
      code: code`
        import timeit, heapq
        from collections import deque

        ids = list(range(200_000))
        id_set = set(ids)
        print("list lookup:", timeit.timeit(lambda: 199_999 in ids, number=200))
        print("set  lookup:", timeit.timeit(lambda: 199_999 in id_set, number=200))

        scores = [(i * 7919) % 100_003 for i in range(100_000)]
        print("top 3:", heapq.nlargest(3, scores))     # no full sort needed

        queue = deque(["a", "b"]); queue.appendleft("urgent"); print(queue.popleft())
      `,
      lang: 'python',
      run: true,
      points: ['Profile first; guesses about slow code are often wrong.', 'Sets and dicts give O(1) lookups.', 'Algorithmic improvements beat micro-optimisations.'],
      realWorld: 'A ride-hailing service cut matching time from minutes to milliseconds by replacing list scans with spatial indexes and dictionaries.',
      check: { q: 'Checking membership in a list of n items is…', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, why: 'In the worst case every item is compared.' },
    },
    {
      id: 'concurrency',
      level: 'expert',
      title: 'Concurrency: threads, processes and asyncio',
      summary: 'Waiting on networks or disks? Use threads or asyncio. Heavy number-crunching? Use multiple processes. Pick based on what your program waits for.',
      body: [
        'Programs are either **I/O-bound** (waiting for the network, disk or a database) or **CPU-bound** (calculating). In standard CPython, the Global Interpreter Lock (GIL) lets only one thread run Python code at a time, so threads speed up waiting but not calculating. Python 3.13 added an experimental free-threaded build without the GIL.',
        '`asyncio` runs thousands of waiting tasks in one thread using `async def` and `await`. `concurrent.futures` offers a simple `ThreadPoolExecutor` and `ProcessPoolExecutor`. The example uses asyncio to "download" three pages at once: total time is the slowest one, not the sum.',
      ],
      code: code`
        import asyncio, time

        async def fetch(name, seconds):
            await asyncio.sleep(seconds)        # stands in for a network call
            return f"{name} ready after {seconds}s"

        async def main():
            start = time.perf_counter()
            results = await asyncio.gather(fetch("flights", 0.3), fetch("hotels", 0.2), fetch("weather", 0.1))
            for r in results:
                print(r)
            print(f"total {time.perf_counter() - start:.1f}s (not 0.6s)")

        asyncio.run(main())
      `,
      lang: 'python',
      note: 'Shown, not run: the in-browser Python cannot start its own event loop. Run it on your computer to see "total 0.3s".',
      points: ['I/O-bound → threads or asyncio; CPU-bound → processes.', 'await hands control back while waiting.', 'asyncio.gather runs coroutines concurrently.'],
      realWorld: 'A travel-comparison site queries dozens of airline APIs concurrently with asyncio so results arrive in about one second.',
      check: { q: 'You need to resize 10,000 images (heavy CPU work). What helps most in standard CPython?', options: ['Threads', 'asyncio', 'Multiple processes', 'A bigger list'], answer: 2, why: 'Processes each have their own interpreter and GIL, so they use several CPU cores.' },
    },
    {
      id: 'internals',
      level: 'expert',
      title: 'Python\'s object model: names, references and mutability',
      summary: 'Variables are names that point at objects. Understanding references, mutability and copying explains most "why did my list change?" surprises.',
      body: [
        'Assignment never copies: `b = a` makes `b` another name for the same object. `is` checks if two names point at the same object; `==` checks if values are equal. **Mutable** objects (lists, dicts, sets) can change in place; **immutable** ones (int, str, tuple) cannot.',
        'Functions receive references, so a function that appends to a list argument changes the caller\'s list. `copy.copy` makes a shallow copy (new outer container, same inner objects); `copy.deepcopy` copies everything. Everything in Python is an object, including functions and classes.',
      ],
      code: code`
        import copy

        a = [[1, 2], [3]]
        b = a
        b.append([4])
        print("a after b.append:", a, "| same object?", a is b)

        shallow = copy.copy(a)
        deep = copy.deepcopy(a)
        a[0].append(99)
        print("shallow sees inner change:", shallow[0])
        print("deep does not:", deep[0])

        def add_item(basket, item):
            basket.append(item)        # changes the caller's list

        groceries = ["rice"]
        add_item(groceries, "dal")
        print(groceries, "| [1,2] == [1,2]:", [1, 2] == [1, 2], "| is:", [1, 2] is [1, 2])
      `,
      lang: 'python',
      run: true,
      points: ['= binds a name; it never copies.', '== compares values; is compares identity.', 'Use deepcopy for nested structures you must not share.'],
      realWorld: 'A game engine bug where every enemy shared one position list came down to b = a instead of a copy.',
      check: { q: 'After b = a for a list a, then b.append(1)…', options: ['Only b changes', 'Both a and b show the change', 'An error occurs', 'a is copied automatically'], answer: 1, why: 'a and b are two names for the same list.' },
    },
    {
      id: 'typing-advanced',
      level: 'expert',
      title: 'Advanced typing: generics, protocols and static checking',
      summary: 'Large codebases rely on precise types. Generics, Protocols and TypedDict describe flexible code, and mypy or pyright check it on every commit.',
      body: [
        '**Generics** let a function keep type information: `def first[T](items: list[T]) -> T` (Python 3.12 syntax) says "returns the same type the list contains". A **Protocol** describes behaviour ("anything with a .area() method") without inheritance: this is static duck typing.',
        '`TypedDict` types dictionaries with fixed keys, `Literal` restricts values, and `Final` marks constants. Running a checker in CI (for example `mypy --strict`) catches whole classes of bugs before tests even run.',
      ],
      code: code`
        from typing import Protocol, TypedDict, Literal

        class Shape(Protocol):
            def area(self) -> float: ...

        class Square:
            def __init__(self, side: float): self.side = side
            def area(self) -> float: return self.side ** 2

        class Circle:
            def __init__(self, r: float): self.r = r
            def area(self) -> float: return 3.14159 * self.r ** 2

        def total_area(shapes: list[Shape]) -> float:
            return sum(s.area() for s in shapes)

        def first[T](items: list[T]) -> T:
            return items[0]

        class Order(TypedDict):
            id: int
            status: Literal["new", "shipped", "delivered"]

        print(round(total_area([Square(2), Circle(1)]), 2))
        print(first(["a", "b"]))
        o: Order = {"id": 7, "status": "shipped"}
        print(o)
      `,
      lang: 'python',
      run: true,
      points: ['Protocols type behaviour, not ancestry.', 'Generics carry types through functions and classes.', 'Run a type checker in CI, not just locally.'],
      realWorld: 'Companies with millions of lines of Python, such as Instagram and Dropbox, adopted gradual typing to make large refactors safe.',
      check: { q: 'A Protocol in typing is used to…', options: ['Speed up code', 'Describe required methods so any matching class is accepted', 'Encrypt data', 'Define network protocols'], answer: 1, why: 'It is structural typing: if it has the methods, it fits.' },
    },
    {
      id: 'production',
      level: 'expert',
      title: 'Production Python: packaging, logging and CI',
      summary: 'Professional Python is packaged with pyproject.toml, configured from the environment, logs instead of prints, and is checked automatically on every change.',
      body: [
        '`pyproject.toml` is the standard place for a project\'s name, dependencies and tool settings. Use the `logging` module with levels (DEBUG, INFO, WARNING, ERROR) so you can turn detail up or down without editing code. Keep secrets and settings in environment variables, never in the code.',
        'A continuous-integration (CI) pipeline runs formatting (ruff format), linting (ruff), type checks, and tests on every pull request, then builds and deploys. Containers (Docker) make the runtime identical everywhere: see the Kubernetes course.',
      ],
      code: code`
        # pyproject.toml
        [project]
        name = "weather-alerts"
        version = "1.2.0"
        requires-python = ">=3.12"
        dependencies = ["httpx>=0.27", "pydantic>=2"]

        [tool.ruff]
        line-length = 100

        # app.py
        import logging, os
        logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
        log = logging.getLogger("alerts")
        API_KEY = os.environ["WEATHER_API_KEY"]      # never hard-code secrets
        log.info("Starting with %d cities", 42)
      `,
      lang: 'toml',
      points: ['pyproject.toml describes the project and its tools.', 'Log with levels; do not print in production.', 'Automate format, lint, type-check and tests in CI.'],
      realWorld: 'An e-commerce team ships Python services many times a day because every change passes the same automated checks first.',
      check: { q: 'Where should an API key live?', options: ['In the source code', 'In an environment variable or secret store', 'In a comment', 'In the README'], answer: 1, why: 'Code is shared and versioned; secrets must stay out of it.' },
    },
  ],
};
