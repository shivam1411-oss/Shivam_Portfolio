import { code } from './util';

export const reactKb = {
  intro: 'React from your first component to concurrent rendering and Server Components. Examples cover to-do lists, shops, quizzes, weather and chat, and the runnable ones show a live preview as you type.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'what-is-react',
      level: 'beginner',
      title: 'What React is and why people use it',
      summary: 'React is a JavaScript library for building user interfaces from small, reusable pieces called components. You describe what the screen should look like; React keeps it up to date.',
      body: [
        'Without React, you change a web page by finding elements and editing them by hand, which gets messy as apps grow. With React you write **components**: functions that return what the UI should look like for the current data. When the data changes, React works out the smallest set of updates to the page.',
        'This idea, **UI = f(state)**, is why React powers sites like Facebook, Instagram, Netflix and this portfolio. Edit the example and watch the preview update.',
      ],
      code: code`
        function Greeting() {
          return <p>Welcome to the Learning Lab!</p>;
        }

        function App() {
          return (
            <div>
              <h2>My first React app</h2>
              <Greeting />
              <Greeting />
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['A component is a function that returns UI.', 'Components can be reused like custom HTML tags.', 'React updates the page when data changes.'],
      realWorld: 'Netflix builds each row of film posters from the same reusable component with different data.',
      check: { q: 'What does a React component return?', options: ['A database row', 'A description of the UI (JSX)', 'A CSS file', 'Nothing'], answer: 1, why: 'Components return JSX describing what to show.' },
      lesson: 'r-intro',
    },
    {
      id: 'jsx',
      level: 'beginner',
      title: 'JSX: HTML-like syntax in JavaScript',
      summary: 'JSX lets you write tags inside JavaScript. Curly braces { } drop in any JavaScript value or expression.',
      body: [
        'JSX looks like HTML but has a few rules: a component returns **one** parent element (use `<>...</>` fragments to group), every tag must close (`<img />`), `class` becomes `className`, and inline styles are objects: `style={{ color: "red" }}`.',
        'Inside `{ }` you can put variables, maths and function calls, but not statements like `if` (use the ternary `a ? b : c` instead).',
      ],
      code: code`
        function App() {
          const city = "Shimla";
          const temp = 12;
          const date = new Date(2026, 11, 25).toDateString();
          return (
            <>
              <h2 className="title">Weather in {city}</h2>
              <p style={{ fontSize: 28, margin: 0 }}>{temp}°C</p>
              <p>{temp < 15 ? "Bring a jacket 🧥" : "T-shirt weather 👕"}</p>
              <small>{date}</small>
            </>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['One parent element (or a fragment).', 'className, and style={{ … }} objects.', '{ } for any JavaScript expression.'],
      realWorld: 'Weather apps use JSX expressions to switch icons and advice based on the temperature.',
      check: { q: 'How do you add a CSS class in JSX?', options: ['class="x"', 'className="x"', 'css="x"', 'style="x"'], answer: 1, why: 'class is a reserved word in JavaScript.' },
      lesson: 'r-intro',
    },
    {
      id: 'props',
      level: 'beginner',
      title: 'Props: passing data into components',
      summary: 'Props are a component\'s inputs, written like HTML attributes. They let one component show different data each time.',
      body: [
        'Pass props like attributes: `<Product name="Tea" price={40} />`. The component receives them as one object, usually unpacked: `function Product({ name, price })`. Strings use quotes; everything else uses braces.',
        'Props flow **one way**, from parent to child, and are read-only. Whatever you put between opening and closing tags arrives as the special `children` prop, which is great for layout wrappers like cards.',
      ],
      code: code`
        function Card({ title, children }) {
          return (
            <div style={{ border: "1px solid #ccc", borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{title}</strong>
              <div>{children}</div>
            </div>
          );
        }

        function Product({ name, price, onSale = false }) {
          return (
            <Card title={name}>
              Rs {price} {onSale && <b style={{ color: "crimson" }}>SALE</b>}
            </Card>
          );
        }

        function App() {
          return (
            <div>
              <Product name="Masala tea" price={40} />
              <Product name="Cold coffee" price={120} onSale />
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Props are inputs; read-only.', 'Strings in quotes, other values in { }.', 'children is the content between tags.'],
      realWorld: 'Food-delivery apps render hundreds of restaurant cards from one component with different props.',
      check: { q: 'Can a component change its own props?', options: ['Yes, any time', 'No, props are read-only; use state for changing values', 'Only numbers', 'Only children'], answer: 1, why: 'Props belong to the parent.' },
      lesson: 'r-props',
    },
    {
      id: 'state-events',
      level: 'beginner',
      title: 'State and events: making it interactive',
      summary: 'useState gives a component memory. Event handlers like onClick call the setter, and React re-renders with the new value.',
      body: [
        '`const [count, setCount] = useState(0)` creates a state value starting at 0 and a function to change it. Calling `setCount(5)` tells React to redraw the component with 5.',
        'Attach handlers with camelCase props: `onClick`, `onChange`, `onSubmit`. Pass a function (`onClick={() => setCount(count + 1)}`), not a call. When the new value depends on the old one, use the updater form `setCount((c) => c + 1)`.',
      ],
      code: code`
        function App() {
          const [likes, setLikes] = useState(0);
          const [liked, setLiked] = useState(false);

          function toggle() {
            setLiked(!liked);
            setLikes((n) => (liked ? n - 1 : n + 1));
          }

          return (
            <div>
              <p>📷 Sunset at Marine Drive</p>
              <button onClick={toggle}>{liked ? "❤️ Liked" : "🤍 Like"}</button>
              <p>{likes} {likes === 1 ? "like" : "likes"}</p>
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['const [value, setValue] = useState(initial).', 'Setters trigger a re-render.', 'Pass functions to onClick; use updater form for counters.'],
      realWorld: 'Every like button on social media is a piece of state toggled by a click handler.',
      check: { q: 'What is wrong with onClick={setCount(1)}?', options: ['Nothing', 'It calls setCount immediately during render instead of on click', 'onClick needs a string', 'setCount does not exist'], answer: 1, why: 'Wrap it: onClick={() => setCount(1)}.' },
      lesson: 'r-state',
    },
    {
      id: 'lists-conditions',
      level: 'beginner',
      title: 'Lists and conditional rendering',
      summary: 'Render arrays with map and give each item a stable key. Show or hide parts with && and the ternary operator.',
      body: [
        '`items.map((item) => <li key={item.id}>{item.name}</li>)` turns data into elements. The **key** must be unique among siblings and stable (an id, not the array index if the list can be reordered), so React can track each item.',
        '`{loggedIn && <Menu />}` renders Menu only when true; `{loading ? <Spinner /> : <List />}` picks one of two. Filter or sort the array before mapping.',
      ],
      code: code`
        const TODOS = [
          { id: 1, text: "Buy vegetables", done: true },
          { id: 2, text: "Pay electricity bill", done: false },
          { id: 3, text: "Call grandma", done: false },
        ];

        function App() {
          const [showDone, setShowDone] = useState(true);
          const visible = showDone ? TODOS : TODOS.filter((t) => !t.done);
          const left = TODOS.filter((t) => !t.done).length;
          return (
            <div>
              <label>
                <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed
              </label>
              <ul>
                {visible.map((t) => (
                  <li key={t.id} style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</li>
                ))}
              </ul>
              {left > 0 ? <p>{left} left to do</p> : <p>All done! 🎉</p>}
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['map turns arrays into elements.', 'Keys must be unique and stable.', '&& and ? : for conditional UI.'],
      realWorld: 'To-do and shopping-list apps render every item with map and a key from the database id.',
      check: { q: 'Why do list items need a key?', options: ['For CSS', 'So React can match items between renders', 'For SEO', 'Keys are optional decoration'], answer: 1, why: 'Keys identify items when the list changes.' },
      lesson: 'r-lists',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'forms',
      level: 'intermediate',
      title: 'Forms and controlled inputs',
      summary: 'A controlled input keeps its value in state: value comes from state and onChange updates it. Then validation and derived UI are easy.',
      body: [
        'Connect inputs with `value={text}` and `onChange={(e) => setText(e.target.value)}`. Checkboxes use `checked` and `e.target.checked`. Handle submit on the form with `onSubmit` and call `e.preventDefault()` to stop a page reload.',
        'Validation is just code: compute error messages from state and disable the button while the form is invalid.',
      ],
      code: code`
        function App() {
          const [email, setEmail] = useState("");
          const [guests, setGuests] = useState(2);
          const [sent, setSent] = useState(null);
          const emailOk = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email);

          function submit(e) {
            e.preventDefault();
            setSent({ email, guests });
          }

          return (
            <form onSubmit={submit}>
              <h3>Book a table</h3>
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {!emailOk && email && <p style={{ color: "crimson" }}>Enter a valid email</p>}
              <p>
                Guests: <input type="number" min="1" max="10" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
              </p>
              <button disabled={!emailOk}>Reserve</button>
              {sent && <p>✅ Table for {sent.guests} booked for {sent.email}</p>}
            </form>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['value + onChange = controlled input.', 'e.preventDefault() on submit.', 'Derive validation from state.'],
      realWorld: 'Restaurant booking sites validate emails and party sizes live as you type.',
      check: { q: 'An input with value={x} but no onChange…', options: ['Works normally', 'Becomes read-only', 'Crashes the app', 'Submits the form'], answer: 1, why: 'React keeps showing x because nothing updates it.' },
      lesson: 'r-forms',
    },
    {
      id: 'effects',
      level: 'intermediate',
      title: 'Effects and loading data',
      summary: 'useEffect runs code after rendering to sync with things outside React: fetching data, timers, subscriptions. Track loading and errors in state.',
      body: [
        '`useEffect(() => { ... }, [deps])` runs after render, and again whenever a dependency changes. `[]` means once after the first render. Return a **cleanup** function to stop timers or ignore stale responses.',
        'A fetch pattern: state for data, loading and error; start the request in an effect; set a flag in cleanup so a slow, outdated response cannot overwrite a newer one. In this playground, `fakeFetch(data, ms)` simulates a network call.',
      ],
      code: code`
        const QUOTES = {
          motivation: "The secret of getting ahead is getting started.",
          science: "Somewhere, something incredible is waiting to be known.",
          humour: "I am on a seafood diet. I see food and I eat it.",
        };

        function App() {
          const [topic, setTopic] = useState("motivation");
          const [quote, setQuote] = useState(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            let cancelled = false;
            setLoading(true);
            fakeFetch(QUOTES[topic], 600).then((q) => {
              if (!cancelled) { setQuote(q); setLoading(false); }
            });
            return () => { cancelled = true; };      // cleanup: ignore stale answers
          }, [topic]);

          return (
            <div>
              {Object.keys(QUOTES).map((t) => (
                <button key={t} onClick={() => setTopic(t)} disabled={t === topic}>{t}</button>
              ))}
              <p>{loading ? "Loading…" : "“" + quote + "”"}</p>
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Effects sync React with the outside world.', 'Dependency array controls when it re-runs.', 'Cleanup prevents leaks and stale updates.'],
      realWorld: 'News apps fetch articles when you switch categories and discard responses for the category you left.',
      check: { q: 'useEffect(fn, []) runs…', options: ['On every render', 'Once after the first render', 'Never', 'Before the first render'], answer: 1, why: 'An empty dependency list never changes.' },
      lesson: 'r-effects',
    },
    {
      id: 'lifting-state',
      level: 'intermediate',
      title: 'Lifting state up and one source of truth',
      summary: 'When two components need the same data, keep the state in their closest common parent and pass it down with props and callbacks.',
      body: [
        'Sibling components cannot read each other\'s state. Move the state up to the parent, pass the value down as props, and pass a function down so children can request changes. This keeps a **single source of truth**.',
        'Do not store values you can calculate (totals, filtered lists) in state; **derive** them during render so they can never be out of sync.',
      ],
      code: code`
        const MENU = [{ id: "dosa", name: "Masala dosa", price: 90 }, { id: "idli", name: "Idli (2)", price: 50 }, { id: "coffee", name: "Filter coffee", price: 30 }];

        function Menu({ onAdd }) {
          return MENU.map((m) => (
            <div key={m.id}>{m.name} - Rs {m.price} <button onClick={() => onAdd(m.id)}>Add</button></div>
          ));
        }

        function Cart({ cart }) {
          const lines = MENU.filter((m) => cart[m.id]);
          const total = lines.reduce((s, m) => s + m.price * cart[m.id], 0);   // derived, not stored
          return (
            <div style={{ marginTop: 12 }}>
              <b>Cart</b>
              {lines.map((m) => <div key={m.id}>{cart[m.id]} × {m.name}</div>)}
              <div>Total: Rs {total}</div>
            </div>
          );
        }

        function App() {
          const [cart, setCart] = useState({});      // lifted to the common parent
          const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
          return (<div><Menu onAdd={add} /><Cart cart={cart} /></div>);
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Shared state lives in the closest common parent.', 'Pass values down, callbacks for changes.', 'Derive totals instead of storing them.'],
      realWorld: 'Restaurant ordering screens keep the cart in a parent so the menu and the bill always agree.',
      check: { q: 'Two siblings need the same state. Where should it live?', options: ['In both', 'In their closest common parent', 'In a global variable', 'In localStorage'], answer: 1, why: 'Then both receive it as props.' },
      lesson: 'r-project',
    },
    {
      id: 'reducer',
      level: 'intermediate',
      title: 'useReducer for complex state',
      summary: 'When many events change related state, describe the changes as actions handled in one reducer function.',
      body: [
        'A **reducer** is a pure function `(state, action) => newState`. Components `dispatch({ type: "add", ... })` instead of calling several setters. All update logic lives in one testable place.',
        'Always return new objects and arrays (spread `...`), never mutate the old state.',
      ],
      code: code`
        function reducer(state, action) {
          switch (action.type) {
            case "answer":
              return { ...state, score: state.score + (action.correct ? 1 : 0), step: state.step + 1 };
            case "restart":
              return { score: 0, step: 0 };
            default:
              return state;
          }
        }

        const QUESTIONS = [
          { q: "Largest planet?", options: ["Earth", "Jupiter", "Mars"], answer: 1 },
          { q: "H2O is…", options: ["Salt", "Water", "Oxygen"], answer: 1 },
          { q: "Fastest land animal?", options: ["Cheetah", "Horse", "Lion"], answer: 0 },
        ];

        function App() {
          const [state, dispatch] = useReducer(reducer, { score: 0, step: 0 });
          if (state.step === QUESTIONS.length) {
            return (<div><h3>Score: {state.score}/{QUESTIONS.length}</h3><button onClick={() => dispatch({ type: "restart" })}>Play again</button></div>);
          }
          const item = QUESTIONS[state.step];
          return (
            <div>
              <p>Question {state.step + 1}: {item.q}</p>
              {item.options.map((o, i) => (
                <button key={o} onClick={() => dispatch({ type: "answer", correct: i === item.answer })}>{o}</button>
              ))}
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['reducer(state, action) returns new state.', 'dispatch({ type, ... }) describes what happened.', 'Never mutate state; copy with spread.'],
      realWorld: 'Quiz and checkout flows use reducers because many buttons change several related values at once.',
      check: { q: 'A reducer must…', options: ['Fetch data', 'Return new state without mutating the old one', 'Render JSX', 'Use setTimeout'], answer: 1, why: 'Reducers are pure functions.' },
    },
    {
      id: 'context',
      level: 'intermediate',
      title: 'Context: sharing data without prop drilling',
      summary: 'Context passes a value to every component below a Provider, so you do not have to thread props through every level.',
      body: [
        'Create with `React.createContext(defaultValue)`, wrap part of the tree in `<ThemeContext.Provider value={...}>`, and read it anywhere below with `React.useContext(ThemeContext)`. In React 19 you can also render `<ThemeContext value={...}>` directly.',
        'Use context for app-wide values like the theme, signed-in user or language. Every consumer re-renders when the value changes, so do not put rapidly changing data in one giant context.',
      ],
      code: code`
        const LangContext = React.createContext("en");
        const WORDS = { en: { hi: "Hello", bye: "Goodbye" }, hi: { hi: "नमस्ते", bye: "अलविदा" }, ta: { hi: "வணக்கம்", bye: "போய் வருகிறேன்" } };

        function Greeting() {
          const lang = React.useContext(LangContext);
          return <p>{WORDS[lang].hi}! / {WORDS[lang].bye}!</p>;
        }

        function Page() {
          return (<div><h3>Deep inside the page</h3><Greeting /></div>);   // no lang prop needed
        }

        function App() {
          const [lang, setLang] = useState("en");
          return (
            <LangContext.Provider value={lang}>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option>
              </select>
              <Page />
            </LangContext.Provider>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['createContext, Provider, useContext.', 'Good for theme, user, language.', 'Consumers re-render when the value changes.'],
      realWorld: 'Multilingual sites keep the chosen language in context so every label updates at once.',
      check: { q: 'Context mainly solves…', options: ['Slow networks', 'Prop drilling through many levels', 'CSS conflicts', 'Testing'], answer: 1, why: 'Any descendant can read the value directly.' },
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'custom-hooks',
      level: 'advanced',
      title: 'Custom hooks: reusable logic',
      summary: 'A custom hook is a function starting with "use" that calls other hooks. It shares stateful logic between components without sharing UI.',
      body: [
        'Extract repeated logic (fetching, timers, form fields, window size) into `useSomething()`. Each component that calls it gets its **own** state.',
        'Hooks have two rules: call them only at the top level of a component or hook (never in loops or conditions), and only from React functions. Linters enforce this.',
      ],
      code: code`
        function useCountdown(seconds) {
          const [left, setLeft] = useState(seconds);
          useEffect(() => {
            if (left <= 0) return;
            const id = setTimeout(() => setLeft((s) => s - 1), 1000);
            return () => clearTimeout(id);
          }, [left]);
          return [left, () => setLeft(seconds)];
        }

        function Timer({ label, seconds }) {
          const [left, reset] = useCountdown(seconds);
          return (
            <p>{label}: <b>{left > 0 ? left + "s" : "Done!"}</b> <button onClick={reset}>Reset</button></p>
          );
        }

        function App() {
          return (<div><Timer label="🍝 Pasta" seconds={8} /><Timer label="🥚 Egg" seconds={5} /></div>);
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Custom hooks start with "use".', 'Each caller gets independent state.', 'Call hooks only at the top level.'],
      realWorld: 'Teams share hooks like useAuth, useCart and useMediaQuery across dozens of screens.',
      check: { q: 'Two components call the same custom hook. Do they share state?', options: ['Yes', 'No, each call has its own state', 'Only if named the same', 'Only in production'], answer: 1, why: 'Hooks share logic, not state.' },
    },
    {
      id: 'performance',
      level: 'advanced',
      title: 'Rendering and performance: memo, useMemo, useCallback',
      summary: 'Re-renders are normally cheap. When they are not, skip work with React.memo, useMemo and useCallback, after measuring.',
      body: [
        'A component re-renders when its state changes or its parent re-renders. `React.memo(Component)` skips re-rendering when props are unchanged. `useMemo(() => calc, [deps])` caches an expensive calculation; `useCallback(fn, [deps])` keeps the same function identity so memoised children do not re-render.',
        'Measure first with React DevTools Profiler. Often the better fix is moving state down, or virtualising long lists (rendering only visible rows). The new React Compiler can add memoisation automatically.',
      ],
      code: code`
        function slowPrimes(limit) {
          const out = [];
          for (let n = 2; out.length < limit; n++) {
            let prime = true;
            for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
            if (prime) out.push(n);
          }
          return out;
        }

        const PrimeList = React.memo(function PrimeList({ primes }) {
          return <p>Last of {primes.length} primes: {primes[primes.length - 1]}</p>;
        });

        function App() {
          const [count, setCount] = useState(3000);
          const [text, setText] = useState("");
          const primes = useMemo(() => slowPrimes(count), [count]);   // not recomputed while typing
          return (
            <div>
              <input placeholder="Type freely…" value={text} onChange={(e) => setText(e.target.value)} />
              <button onClick={() => setCount((c) => c + 1000)}>More primes</button>
              <PrimeList primes={primes} />
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Measure before optimising.', 'useMemo caches values; useCallback caches functions.', 'React.memo skips renders with unchanged props.'],
      realWorld: 'Trading apps memoise heavy chart calculations so typing in an order box stays smooth.',
      check: { q: 'useMemo is for…', options: ['Running effects', 'Caching the result of an expensive calculation between renders', 'Storing state', 'Fetching data'], answer: 1, why: 'It recomputes only when dependencies change.' },
    },
    {
      id: 'refs',
      level: 'advanced',
      title: 'Refs: DOM access and values that do not re-render',
      summary: 'useRef holds a value that survives renders without causing them, and gives direct access to DOM elements for focus, scrolling or measuring.',
      body: [
        '`const ref = useRef(null)` then `<input ref={ref} />` gives you `ref.current`, the real DOM element: call `ref.current.focus()` or `scrollIntoView()`. Changing `ref.current` does not re-render.',
        'Refs also store things like timer IDs or previous values. Use them sparingly: if a value should appear on screen, it belongs in state.',
      ],
      code: code`
        function App() {
          const inputRef = useRef(null);
          const endRef = useRef(null);
          const [messages, setMessages] = useState(["Hi! 👋", "How can I help?"]);

          function send(e) {
            e.preventDefault();
            const text = inputRef.current.value.trim();
            if (!text) return;
            setMessages((m) => [...m, text]);
            inputRef.current.value = "";
            inputRef.current.focus();
          }
          useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [messages]);

          return (
            <div>
              <div style={{ height: 110, overflowY: "auto", border: "1px solid #ccc", borderRadius: 8, padding: 6 }}>
                {messages.map((m, i) => <div key={i}>💬 {m}</div>)}
                <div ref={endRef} />
              </div>
              <form onSubmit={send}><input ref={inputRef} placeholder="Message" /> <button>Send</button></form>
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['ref.current points at a DOM node or any value.', 'Changing a ref does not re-render.', 'Prefer state for anything shown on screen.'],
      realWorld: 'Chat apps use refs to keep the newest message scrolled into view and the input focused.',
      check: { q: 'Updating ref.current…', options: ['Re-renders the component', 'Does not re-render', 'Throws an error', 'Resets state'], answer: 1, why: 'Refs are a mutable box React does not watch.' },
    },
    {
      id: 'routing-structure',
      level: 'advanced',
      title: 'Routing and project structure',
      summary: 'Real apps have many pages. A router maps URLs to components, and a clear folder structure keeps a growing codebase manageable.',
      body: [
        '**React Router** (or a framework like Next.js) maps paths like `/products/42` to components and reads parameters with hooks such as `useParams`. Links change the URL without reloading the page. This Learning Lab uses a tiny hash router (`#/c/react`).',
        'Organise by feature (`features/cart/`, `features/search/`) rather than by file type once the app grows. Keep components small, put API calls in one place, and colocate tests with code.',
      ],
      code: code`
        // React Router v7
        import { BrowserRouter, Routes, Route, Link, useParams } from "react-router";

        function Product() {
          const { id } = useParams();
          return <h2>Product {id}</h2>;
        }

        export default function App() {
          return (
            <BrowserRouter>
              <nav><Link to="/">Home</Link> <Link to="/products/42">Phone</Link></nav>
              <Routes>
                <Route path="/" element={<h2>Home</h2>} />
                <Route path="/products/:id" element={<Product />} />
              </Routes>
            </BrowserRouter>
          );
        }

        // src/
        //   features/cart/{Cart.jsx, useCart.js, cart.test.jsx}
        //   features/products/{ProductPage.jsx, api.js}
        //   components/{Button.jsx, Modal.jsx}
      `,
      lang: 'jsx',
      note: 'Shown, not run: routing needs a real URL bar.',
      points: ['A router maps URLs to components.', 'useParams reads path parameters.', 'Organise folders by feature.'],
      realWorld: 'E-commerce sites route /category/:slug and /product/:id to two components that serve thousands of pages.',
      check: { q: 'In /products/:id, what does useParams() return for /products/7?', options: ['7 as a number', '{ id: "7" }', '"products"', 'Nothing'], answer: 1, why: 'Path parameters arrive as strings in an object.' },
    },
    {
      id: 'testing',
      level: 'advanced',
      title: 'Testing React components',
      summary: 'Test what users see and do: render the component, find elements by role or text, click and type, then check the result.',
      body: [
        '**React Testing Library** with Vitest or Jest renders components into a fake DOM. Query like a user would (`getByRole("button", { name: "Add" })`), interact with `userEvent`, and assert on visible output. Avoid testing internal state.',
        'Add end-to-end tests with **Playwright** or Cypress for critical journeys like checkout. The exercises in the React course work the same way: they click and type in your app and check what appears.',
      ],
      code: code`
        // Counter.test.jsx (Vitest + React Testing Library)
        import { render, screen } from "@testing-library/react";
        import userEvent from "@testing-library/user-event";
        import { expect, test } from "vitest";
        import Counter from "./Counter";

        test("adds one on click", async () => {
          render(<Counter />);
          await userEvent.click(screen.getByRole("button", { name: /add/i }));
          expect(screen.getByText("Count: 1")).toBeInTheDocument();
        });
      `,
      lang: 'jsx',
      note: 'Shown, not run: tests run in a terminal with npm test.',
      points: ['Test behaviour, not implementation.', 'Query by role and accessible name.', 'E2E tests for critical journeys.'],
      realWorld: 'Banking apps run E2E tests of login and transfers on every release.',
      check: { q: 'Best way to find a button in a test?', options: ['By its CSS class', 'By role and accessible name', 'By its position', 'By component state'], answer: 1, why: 'That is how users and screen readers find it.' },
    },
    // ------------------------------------------------------------ expert
    {
      id: 'rendering-model',
      level: 'expert',
      title: 'How React renders: reconciliation, batching and Strict Mode',
      summary: 'React renders by calling components to get a new tree, compares it with the old one (reconciliation), and commits only the differences to the DOM.',
      body: [
        'Rendering happens in two phases: **render** (call components, build the new element tree; must be pure) and **commit** (apply DOM changes, run effects). React\'s Fiber architecture splits render work into units so it can be paused and prioritised.',
        'Reconciliation assumes elements of different types produce different trees, and uses **keys** to match list items. State updates are **batched**: several setState calls in one event cause one render. In development, **Strict Mode** renders twice and runs effects twice on mount to expose impure code and missing cleanups.',
      ],
      code: code`
        let renders = 0;

        function App() {
          const [a, setA] = useState(0);
          const [b, setB] = useState(0);
          renders++;     // a side effect in render: only for this demo!

          function bump() {
            setA((x) => x + 1);
            setB((x) => x + 1);     // batched with the line above: one render
          }

          return (
            <div>
              <p>a = {a}, b = {b}</p>
              <button onClick={bump}>Update both</button>
              <p>Render calls so far: {renders}</p>
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Render must be pure; commit applies changes.', 'Updates in one event are batched.', 'Strict Mode double-invokes in development to find bugs.'],
      realWorld: 'Large apps like Facebook rely on batching and Fiber scheduling to keep typing responsive while feeds update.',
      check: { q: 'Two setState calls in one click handler cause…', options: ['Two renders', 'One batched render', 'No render', 'An error'], answer: 1, why: 'React batches updates within an event.' },
    },
    {
      id: 'concurrent',
      level: 'expert',
      title: 'Concurrent features: useTransition, useDeferredValue, Suspense',
      summary: 'React can keep urgent updates (typing) fast while slower updates (filtering a big list) happen in the background.',
      body: [
        'Wrap a non-urgent update in `startTransition` from `useTransition()`: React renders it at lower priority and can interrupt it if you keep typing; `isPending` shows a hint. `useDeferredValue(value)` gives a lagging copy of a value to render heavy UI from.',
        '**Suspense** shows a fallback while part of the tree waits for code or data, and keeps the rest interactive. Combined with lazy loading (`React.lazy`) it splits big apps into chunks, as this Learning Lab does for the editor and Python runtime.',
      ],
      code: code`
        const CITIES = Array.from({ length: 8000 }, (_, i) => "City " + i + " " + ["Pune", "Agra", "Leh", "Ooty", "Puri"][i % 5]);

        function Results({ query }) {
          const items = CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 300);
          return <ul style={{ maxHeight: 110, overflow: "auto" }}>{items.map((c) => <li key={c}>{c}</li>)}</ul>;
        }

        function App() {
          const [text, setText] = useState("");
          const [query, setQuery] = useState("");
          const [isPending, startTransition] = React.useTransition();
          return (
            <div>
              <input value={text} placeholder="Search 8,000 cities"
                onChange={(e) => { setText(e.target.value); startTransition(() => setQuery(e.target.value)); }} />
              {isPending && <span> updating…</span>}
              <Results query={query} />
            </div>
          );
        }
      `,
      lang: 'jsx',
      run: true,
      points: ['Transitions mark updates as non-urgent.', 'useDeferredValue lags a value for heavy rendering.', 'Suspense shows fallbacks while waiting.'],
      realWorld: 'Search boxes on large catalogues use transitions so typing never stutters while results update.',
      check: { q: 'What does startTransition do?', options: ['Animates elements', 'Marks a state update as lower priority and interruptible', 'Fetches data', 'Changes routes'], answer: 1, why: 'Urgent updates like typing go first.' },
    },
    {
      id: 'react-19',
      level: 'expert',
      title: 'React 19: Actions, useActionState, useOptimistic and use',
      summary: 'React 19 adds built-in support for async form submissions, optimistic UI and reading promises during render.',
      body: [
        '**Actions**: pass an async function to `<form action={fn}>`; React handles pending state and resets. `useActionState(action, initial)` returns the latest result, a wrapped action and an `isPending` flag. `useFormStatus` lets a submit button know if its form is pending.',
        '`useOptimistic` shows the expected result immediately (a message appears as "sending…") and reverts if the request fails. `use(promise)` reads a promise or context during render, suspending until it resolves. Refs can now be passed as normal props.',
      ],
      code: code`
        import { useActionState, useOptimistic } from "react";

        function Comments({ comments, addComment }) {
          const [optimistic, addOptimistic] = useOptimistic(comments, (list, text) => [...list, { text, sending: true }]);

          const [error, submit, isPending] = useActionState(async (prev, formData) => {
            const text = formData.get("text");
            addOptimistic(text);                         // shows instantly
            try { await addComment(text); return null; }
            catch { return "Could not post. Try again."; }
          }, null);

          return (
            <form action={submit}>
              {optimistic.map((c, i) => <p key={i} style={{ opacity: c.sending ? 0.5 : 1 }}>{c.text}</p>)}
              <input name="text" />
              <button disabled={isPending}>Post</button>
              {error && <p role="alert">{error}</p>}
            </form>
          );
        }
      `,
      lang: 'jsx',
      note: 'Shown, not run: it needs a real server function to post to.',
      points: ['<form action={asyncFn}> handles async submits.', 'useActionState gives result + pending.', 'useOptimistic shows expected results instantly.'],
      realWorld: 'Messaging apps show your message immediately with a "sending" state, then confirm or roll back.',
      check: { q: 'useOptimistic is used to…', options: ['Cache data', 'Show the expected result before the server confirms', 'Retry failed requests', 'Measure performance'], answer: 1, why: 'It makes the UI feel instant.' },
    },
    {
      id: 'server-components',
      level: 'expert',
      title: 'Server rendering and React Server Components',
      summary: 'React can run on the server: SSR sends ready HTML for fast first paint, and Server Components run only on the server so their code never reaches the browser.',
      body: [
        '**Client-side rendering (CSR)** ships JavaScript that builds the page in the browser (this portfolio). **Server-side rendering (SSR)** and **static generation (SSG)** send HTML first, then **hydrate** it to make it interactive; this helps load speed and SEO.',
        '**React Server Components** (used by frameworks like Next.js App Router) can read databases directly and send rendered results, not code. Interactive parts are marked `"use client"`. Server Functions (`"use server"`) let forms call server code directly.',
      ],
      code: code`
        // app/products/page.jsx  (Next.js App Router: a Server Component by default)
        import { db } from "@/lib/db";
        import AddToCart from "./AddToCart";

        export default async function ProductsPage() {
          const products = await db.product.findMany();      // runs on the server only
          return products.map((p) => (
            <article key={p.id}>
              <h2>{p.name}</h2>
              <AddToCart id={p.id} />                         {/* interactive island */}
            </article>
          ));
        }

        // app/products/AddToCart.jsx
        "use client";
        import { useState } from "react";
        export default function AddToCart({ id }) {
          const [added, setAdded] = useState(false);
          return <button onClick={() => setAdded(true)}>{added ? "Added ✓" : "Add to cart"}</button>;
        }
      `,
      lang: 'jsx',
      note: 'Shown, not run: Server Components need a server framework.',
      points: ['CSR, SSR, SSG and hydration trade speed and complexity.', 'Server Components send results, not code.', '"use client" marks interactive components.'],
      realWorld: 'Online stores render product pages on the server for fast loading and search ranking, with small interactive islands.',
      check: { q: 'Where does a React Server Component\'s code run?', options: ['In the browser', 'Only on the server', 'In a web worker', 'In the database'], answer: 1, why: 'Its output is sent to the client, not its code.' },
    },
    {
      id: 'state-at-scale',
      level: 'expert',
      title: 'State management at scale',
      summary: 'Separate server state (data from APIs), client state (UI), URL state and form state, and pick a tool for each instead of one giant store.',
      body: [
        '**Server state** (lists, profiles) needs caching, refetching and deduplication: use TanStack Query, SWR or your framework\'s data layer. **Client state** (modals, selections) stays local or in a small store like Zustand, Jotai or Redux Toolkit. **URL state** (filters, tabs) belongs in the address bar so links can be shared.',
        'Keep state as local as possible, normalise large collections by ID, and avoid duplicating server data in client stores.',
      ],
      code: code`
        // Server state with TanStack Query
        import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

        function Orders() {
          const qc = useQueryClient();
          const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => fetch("/api/orders").then((r) => r.json()) });
          const cancel = useMutation({
            mutationFn: (id) => fetch("/api/orders/" + id, { method: "DELETE" }),
            onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),   // refetch fresh data
          });
          if (isLoading) return <p>Loading…</p>;
          return data.map((o) => <p key={o.id}>{o.item} <button onClick={() => cancel.mutate(o.id)}>Cancel</button></p>);
        }

        // Small client store with Zustand
        import { create } from "zustand";
        export const useUi = create((set) => ({ sidebarOpen: false, toggle: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })) }));
      `,
      lang: 'jsx',
      note: 'Shown, not run: these libraries are not loaded here.',
      points: ['Server state ≠ client state.', 'TanStack Query/SWR cache server data.', 'Keep shareable filters in the URL.'],
      realWorld: 'Large dashboards cut bugs by moving API data from a global Redux store into a query cache.',
      check: { q: 'A product filter should survive sharing the link. Store it in…', options: ['useRef', 'The URL', 'A global variable', 'Component state only'], answer: 1, why: 'The URL travels with the link.' },
    },
  ],
};
