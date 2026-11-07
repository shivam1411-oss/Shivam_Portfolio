import { B, Callout, F, H, P, Term } from '../ui';
import ReactRunner from './LazyReactRunner';

// "React": build interfaces from components, live in the browser. Learners' code defines App;
// React and its hooks (useState, useEffect, useMemo, useRef…) are already in scope.

// Code samples are written with String.raw; they avoid ${…} so the template literal leaves them alone.
const jsx = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '');

const modules = [
  { id: 'react-basics', title: 'Components', level: 'Beginner', blurb: 'What React is, JSX, and building a page from small components with props.' },
  { id: 'react-interactive', title: 'Making it interactive', level: 'Beginner', blurb: 'State and events, lists and conditions, and forms that react as you type.' },
  { id: 'react-real', title: 'Real apps', level: 'Intermediate', blurb: 'Effects and loading data, then a complete mini dashboard.' },
];

const lessons = [
  {
    id: 'r-intro',
    module: 'react-basics',
    title: 'Your first component',
    minutes: 10,
    goals: ['Know what React is and why sites like this portfolio use it', 'Write a component that returns JSX', 'Put JavaScript values into JSX with curly braces'],
    body: () => (
      <>
        <P>
          <Term id="react">React</Term> is a JavaScript library for building user interfaces out of <Term id="component">components</Term>: small functions that
          return what should appear on screen. Your portfolio is built with it. Below, the code on the left is real React; the preview on the right updates a moment after
          you type. Change the text and watch.
        </P>
        <ReactRunner
          code={jsx`
function App() {
  const name = "Shivam";
  const accounts = 20;
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are tracking {accounts} accounts.</p>
      <p>Twice that is {accounts * 2}.</p>
    </div>
  );
}
`}
        />
        <H>JSX in four rules</H>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            A component is a function whose name starts with a <B>capital letter</B> and returns JSX.
          </li>
          <li>
            JSX looks like HTML, but <F>class</F> is written <F>className</F> and styles are objects: <F>{'style={{ color: "teal" }}'}</F>.
          </li>
          <li>
            <F>{'{ }'}</F> switches back to JavaScript: variables, maths, function calls.
          </li>
          <li>
            Return <B>one</B> outer element (wrap siblings in a <F>{'<div>'}</F> or <F>{'<>…</>'}</F>).
          </li>
        </ul>
        <ReactRunner
          code={jsx`
function App() {
  const balances = [37700, 106400, 17700, 54100];
  const total = balances.reduce((sum, b) => sum + b, 0);   // add them up
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#0f8a7e" }}>Portfolio</h2>
      <p>Accounts: {balances.length}</p>
      <p>Total balance: ₹{total.toLocaleString("en-IN")}</p>
    </div>
  );
}
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'r-first',
        kind: 'react',
        title: 'A dashboard heading',
        prompt:
          'Make App show an <h1> with the text "Collections dashboard" and a <p> that shows the total of the payments array formatted with toLocaleString("en-IN"), e.g. Total collected: ₹12,400.',
        starter: jsx`
function App() {
  const payments = [4860, 12810, 3800, 6970, 2920];
  return (
    <div>
      <h1>Change me</h1>
    </div>
  );
}
`,
        tests: [
          { name: 'Shows the heading "Collections dashboard"', code: `const h1 = h.$("h1"); h.assert(h1 && h1.textContent.trim() === "Collections dashboard", "h1 is: " + (h1 ? h1.textContent : "missing"));` },
          { name: 'Shows the total ₹31,360', code: `const p = h.$("p"); h.assert(p, "no <p> found"); h.assert(p.textContent.includes("31,360"), "the <p> says: " + p.textContent);` },
        ],
        hint: 'const total = payments.reduce((sum, p) => sum + p, 0); then <p>Total collected: ₹{total.toLocaleString("en-IN")}</p>',
        solution: jsx`
function App() {
  const payments = [4860, 12810, 3800, 6970, 2920];
  const total = payments.reduce((sum, p) => sum + p, 0);
  return (
    <div>
      <h1>Collections dashboard</h1>
      <p>Total collected: ₹{total.toLocaleString("en-IN")}</p>
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'How do you show a variable called total inside JSX?', options: ['total', '"total"', '{total}', '$total'], answer: 2, why: 'Curly braces switch from markup to JavaScript.' },
      { q: 'Why must component names start with a capital letter?', options: ['Style rule only', 'React treats lower-case tags as plain HTML elements', 'It is faster', 'They do not'], answer: 1, why: '<card> would be an HTML tag; <Card> is your component.' },
    ],
  },
  {
    id: 'r-props',
    module: 'react-basics',
    title: 'Components and props',
    minutes: 12,
    goals: ['Split a page into reusable components', 'Pass data in with props', 'Use the special children prop'],
    body: () => (
      <>
        <P>
          Write a component once and use it many times with different <Term id="props">props</Term>, the component's inputs. This is exactly how your portfolio's stat cards
          and course cards work.
        </P>
        <ReactRunner
          code={jsx`
function StatCard({ label, value, good }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: good ? "#0f8a7e" : "#b45309" }}>{value}</div>
    </div>
  );
}

function App() {
  return (
    <div>
      <StatCard label="Collection efficiency" value="65%" good={true} />
      <StatCard label="Forward roll rate" value="22%" good={false} />
      <StatCard label="DSO" value="48 days" good={true} />
    </div>
  );
}
`}
          height="h-72"
        />
        <H>children: what goes between the tags</H>
        <ReactRunner
          code={jsx`
function Panel({ title, children }) {
  return (
    <section style={{ border: "1px solid #ccc", borderRadius: 12, padding: 12 }}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function App() {
  return (
    <Panel title="Today">
      <p>12 promises to pay are due.</p>
      <p>3 accounts moved to 90+.</p>
    </Panel>
  );
}
`}
        />
        <Callout title="Props are read-only">
          A component never changes its own props. If something needs to change, the parent passes a new value, or the component keeps its own <B>state</B> (next
          lesson).
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'r-badges',
        kind: 'react',
        title: 'A reusable Badge',
        prompt:
          'Write a Badge component that takes text and tone props and renders <span className="badge">{text}</span>, with a green background when tone is "good" and amber otherwise. In App render three badges: "Paid" (good), "PTP" (good) and "Broken promise" (bad).',
        starter: jsx`
function Badge() {
  return <span>?</span>;
}

function App() {
  return (
    <div>
      <Badge />
    </div>
  );
}
`,
        tests: [
          { name: 'Three .badge elements', code: `h.assert(h.$$(".badge").length === 3, "found " + h.$$(".badge").length + " elements with className badge");` },
          { name: 'Their texts are Paid, PTP, Broken promise', code: `const t = h.$$(".badge").map((b) => b.textContent.trim()); h.assert(JSON.stringify(t) === JSON.stringify(["Paid", "PTP", "Broken promise"]), "texts: " + JSON.stringify(t));` },
          { name: 'Good and bad badges look different', code: `const bg = h.$$(".badge").map((b) => b.style.background || b.style.backgroundColor); h.assert(bg[0] && bg[0] === bg[1] && bg[0] !== bg[2], "backgrounds: " + JSON.stringify(bg));` },
        ],
        hint: 'function Badge({ text, tone }) { const bg = tone === "good" ? "#bbf7d0" : "#fde68a"; return <span className="badge" style={{ background: bg, padding: "2px 8px", borderRadius: 999 }}>{text}</span>; }',
        solution: jsx`
function Badge({ text, tone }) {
  const bg = tone === "good" ? "#bbf7d0" : "#fde68a";
  return (
    <span className="badge" style={{ background: bg, padding: "2px 8px", borderRadius: 999, marginRight: 6 }}>
      {text}
    </span>
  );
}

function App() {
  return (
    <div>
      <Badge text="Paid" tone="good" />
      <Badge text="PTP" tone="good" />
      <Badge text="Broken promise" tone="bad" />
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'How does a parent give data to a child component?', options: ['A global variable', 'Props, written like attributes: <StatCard label="DSO" />', 'localStorage', 'CSS'], answer: 1, why: 'Props are the inputs of a component.' },
      { q: 'What is the children prop?', options: ['A list of child components in a folder', 'Whatever is placed between the component\'s opening and closing tags', 'The component\'s state', 'A CSS class'], answer: 1, why: '<Panel>…here…</Panel> arrives as children.' },
    ],
  },
  {
    id: 'r-state',
    module: 'react-interactive',
    title: 'State and events',
    minutes: 12,
    goals: ['Remember values between renders with useState', 'Respond to clicks with onClick', 'Understand why changing state redraws the component'],
    body: () => (
      <>
        <P>
          <Term id="state">State</Term> is a component's memory. <F>useState</F> gives you the current value and a function to change it. When you call that function,
          React runs your component again and updates the screen.
        </P>
        <ReactRunner
          code={jsx`
function App() {
  const [calls, setCalls] = useState(0);
  return (
    <div>
      <p>Calls made today: <b>{calls}</b></p>
      <button onClick={() => setCalls(calls + 1)}>Log a call</button>
      <button onClick={() => setCalls(0)}>Reset</button>
    </div>
  );
}
`}
        />
        <H>Toggles and several pieces of state</H>
        <ReactRunner
          code={jsx`
function App() {
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState(0);
  return (
    <div>
      <p>Status: <b style={{ color: paid ? "green" : "crimson" }}>{paid ? "Paid" : "Unpaid"}</b></p>
      <button onClick={() => setPaid(!paid)}>{paid ? "Undo" : "Mark as paid"}</button>
      <button onClick={() => setNotes((n) => n + 1)}>Add note ({notes})</button>
    </div>
  );
}
`}
        />
        <Callout tone="warn" title="Never change state directly">
          <F>calls = calls + 1</F> does nothing visible: React does not know it changed. Always use the setter. When the new value depends on the old one,{' '}
          <F>setNotes((n) =&gt; n + 1)</F> is the safest form.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'r-promise',
        kind: 'react',
        title: 'Promise tracker',
        prompt:
          'Build App with a count of promises to pay (start at 0) shown in <p id="count">, a button "Add promise" that adds 1, and a button "Clear" that sets it back to 0. When the count is 5 or more, also show <p id="alert">Follow up today</p>.',
        starter: jsx`
function App() {
  return (
    <div>
      <p id="count">0</p>
    </div>
  );
}
`,
        tests: [
          { name: 'Starts at 0', code: `h.assert(h.$("#count") && h.$("#count").textContent.includes("0"), "count shows: " + (h.$("#count") || {}).textContent);` },
          { name: '"Add promise" adds 1', code: `await h.click(h.button("Add promise")); await h.click(h.button("Add promise")); h.assert(h.$("#count").textContent.includes("2"), "after two clicks: " + h.$("#count").textContent);` },
          { name: 'Alert appears at 5 and not before', code: `for (let i = 0; i < 4; i++) await h.click(h.button("Add promise")); h.assert(!h.$("#alert"), "alert shown at 4"); await h.click(h.button("Add promise")); h.assert(h.$("#alert") && h.$("#alert").textContent.includes("Follow up today"), "no alert at 5");` },
          { name: '"Clear" resets to 0', code: `await h.click(h.button("Add promise")); await h.click(h.button("Clear")); h.assert(h.$("#count").textContent.includes("0") && !h.$("#count").textContent.includes("1"), "after clear: " + h.$("#count").textContent);` },
        ],
        hint: 'const [count, setCount] = useState(0); … <button onClick={() => setCount(count + 1)}>Add promise</button> and {count >= 5 && <p id="alert">Follow up today</p>}',
        solution: jsx`
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button onClick={() => setCount(count + 1)}>Add promise</button>
      <button onClick={() => setCount(0)}>Clear</button>
      {count >= 5 && <p id="alert">Follow up today</p>}
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'What does const [n, setN] = useState(0) give you?', options: ['Two copies of 0', 'The current value and a function that changes it', 'A loop', 'A CSS rule'], answer: 1, why: 'useState returns [value, setter].' },
      { q: 'What happens when you call setN(5)?', options: ['Nothing until reload', 'React stores 5 and re-renders the component', 'The page reloads', 'An error'], answer: 1, why: 'Setting state schedules a re-render with the new value.' },
    ],
  },
  {
    id: 'r-lists',
    module: 'react-interactive',
    title: 'Lists, keys and conditions',
    minutes: 12,
    goals: ['Render a list from an array with map', 'Give each item a stable key', 'Show or hide things with && and the ternary operator'],
    body: () => (
      <>
        <ReactRunner
          code={jsx`
const accounts = [
  { id: "A1010", name: "Rahul", dpd: 47, balance: 127200 },
  { id: "A1013", name: "Priya", dpd: 64, balance: 45800 },
  { id: "A1017", name: "Kavya", dpd: 112, balance: 120500 },
];

function App() {
  return (
    <ul>
      {accounts.map((a) => (
        <li key={a.id}>
          {a.name}: {a.dpd} DPD {a.dpd > 90 && <b style={{ color: "crimson" }}> (legal)</b>}
        </li>
      ))}
    </ul>
  );
}
`}
        />
        <P>
          <F>map</F> turns each item into JSX. React needs a <F>key</F> on each item (something unique and stable, like an id) so it can tell which row changed. Avoid the
          array position as a key when items can be added, removed or re-ordered.
        </P>
        <H>Filtering and empty states</H>
        <ReactRunner
          code={jsx`
const accounts = [
  { id: "A1001", name: "Asha", dpd: 0 },
  { id: "A1010", name: "Rahul", dpd: 47 },
  { id: "A1017", name: "Kavya", dpd: 112 },
];

function App() {
  const [onlyLate, setOnlyLate] = useState(false);
  const shown = onlyLate ? accounts.filter((a) => a.dpd > 90) : accounts;
  return (
    <div>
      <button onClick={() => setOnlyLate(!onlyLate)}>{onlyLate ? "Show all" : "Only 90+"}</button>
      {shown.length === 0 ? <p>No accounts.</p> : (
        <ul>{shown.map((a) => <li key={a.id}>{a.name} ({a.dpd})</li>)}</ul>
      )}
    </div>
  );
}
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'r-overdue',
        kind: 'react',
        title: 'Overdue list',
        prompt:
          'Render each account with dpd over 30 as an <li> (key = id) showing its name, in the given order. If there are none, show <p>No overdue accounts</p> instead. Then add a button "Hide" that hides the list (and "Show" to bring it back).',
        starter: jsx`
const accounts = [
  { id: "A1001", name: "Asha", dpd: 0 },
  { id: "A1008", name: "Arjun", dpd: 33 },
  { id: "A1003", name: "Meena", dpd: 0 },
  { id: "A1014", name: "Rohit", dpd: 71 },
  { id: "A1020", name: "Yash", dpd: 130 },
];

function App() {
  return <ul></ul>;
}
`,
        tests: [
          { name: 'Shows Arjun, Rohit and Yash as list items', code: `const items = h.$$("li").map((li) => li.textContent.trim()); h.assert(items.length === 3 && items[0].includes("Arjun") && items[1].includes("Rohit") && items[2].includes("Yash"), "list items: " + JSON.stringify(items));` },
          { name: '"Hide" hides the list and "Show" brings it back', code: `await h.click(h.button("Hide")); h.assert(h.$$("li").length === 0, "still showing items after Hide"); await h.click(h.button("Show")); h.assert(h.$$("li").length === 3, "items after Show: " + h.$$("li").length);` },
          { name: 'Gives each <li> a key and has a "No overdue accounts" message', code: `h.assert(/<li[^>]*key=/.test(h.source), "give each <li> a key, e.g. key={a.id}"); h.assert(h.source.includes("No overdue accounts"), "show <p>No overdue accounts</p> when the list is empty");` },
        ],
        hint: 'const [visible, setVisible] = useState(true); const overdue = accounts.filter((a) => a.dpd > 30); then a button toggling visible, and {visible && (overdue.length === 0 ? <p>No overdue accounts</p> : <ul>{overdue.map((a) => <li key={a.id}>{a.name}</li>)}</ul>)}',
        solution: jsx`
const accounts = [
  { id: "A1001", name: "Asha", dpd: 0 },
  { id: "A1008", name: "Arjun", dpd: 33 },
  { id: "A1003", name: "Meena", dpd: 0 },
  { id: "A1014", name: "Rohit", dpd: 71 },
  { id: "A1020", name: "Yash", dpd: 130 },
];

function App() {
  const [visible, setVisible] = useState(true);
  const overdue = accounts.filter((a) => a.dpd > 30);
  return (
    <div>
      <button onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button>
      {visible && (overdue.length === 0 ? <p>No overdue accounts</p> : (
        <ul>{overdue.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
      ))}
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'What should a list item\'s key be?', options: ['Math.random()', 'Something unique and stable, like the record\'s id', 'Always the array index', 'The same for every item'], answer: 1, why: 'Stable keys let React update the right rows.' },
      { q: '{late && <b>Late</b>} shows the <b> when…', options: ['Always', 'late is truthy', 'late is false', 'Never'], answer: 1, why: '&& renders the right side only when the left side is truthy.' },
    ],
  },
  {
    id: 'r-forms',
    module: 'react-interactive',
    title: 'Forms and controlled inputs',
    minutes: 12,
    goals: ['Keep an input\'s text in state (a controlled input)', 'Filter a list live as the user types', 'Handle a form submit without reloading the page'],
    body: () => (
      <>
        <P>
          In React, an input's text usually lives in state: <F>value</F> reads it and <F>onChange</F> updates it. Everything else (filters, totals, validation) then
          recalculates automatically.
        </P>
        <ReactRunner
          code={jsx`
const names = ["Asha", "Ravi", "Meena", "Karan", "Rahul", "Priya"];

function App() {
  const [query, setQuery] = useState("");
  const shown = names.filter((n) => n.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <input placeholder="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{shown.length} found</p>
      <ul>{shown.map((n) => <li key={n}>{n}</li>)}</ul>
    </div>
  );
}
`}
          height="h-64"
        />
        <H>Submitting a form</H>
        <ReactRunner
          code={jsx`
function App() {
  const [amount, setAmount] = useState("");
  const [payments, setPayments] = useState([]);

  function submit(e) {
    e.preventDefault();                       // stop the browser reloading the page
    const value = Number(amount);
    if (!value || value <= 0) return;         // simple validation
    setPayments([...payments, value]);        // a NEW array, never push()
    setAmount("");
  }

  return (
    <form onSubmit={submit}>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <button type="submit">Add payment</button>
      <p>Total: ₹{payments.reduce((s, p) => s + p, 0).toLocaleString("en-IN")} from {payments.length} payments</p>
    </form>
  );
}
`}
        />
      </>
    ),
    exercises: [
      {
        id: 'r-search',
        kind: 'react',
        title: 'Search by name or city',
        prompt:
          'Add an <input> whose text filters the customers: show each match as an <li> with "name – city" when the name OR the city contains the text (ignore upper/lower case). Show <p id="found">N found</p> with the number of matches.',
        starter: jsx`
const customers = [
  { name: "Asha", city: "Pune" },
  { name: "Ravi", city: "Indore" },
  { name: "Meena", city: "Mumbai" },
  { name: "Rahul", city: "Nashik" },
  { name: "Priya", city: "Mumbai" },
];

function App() {
  return (
    <div>
      <ul>{customers.map((c) => <li key={c.name}>{c.name} – {c.city}</li>)}</ul>
    </div>
  );
}
`,
        tests: [
          { name: 'Shows all 5 to start, with "5 found"', code: `h.assert(h.$$("li").length === 5, "items: " + h.$$("li").length); h.assert(h.$("#found") && h.$("#found").textContent.includes("5"), "found says: " + (h.$("#found") || {}).textContent);` },
          { name: 'Typing "mum" shows Meena and Priya (city match)', code: `await h.type(h.$("input"), "mum"); const t = h.$$("li").map((l) => l.textContent); h.assert(t.length === 2 && t[0].includes("Meena") && t[1].includes("Priya"), "items: " + JSON.stringify(t)); h.assert(h.$("#found").textContent.includes("2"), "found: " + h.$("#found").textContent);` },
          { name: 'Typing "RA" matches names ignoring case', code: `await h.type(h.$("input"), "RA"); const t = h.$$("li").map((l) => l.textContent); h.assert(t.length === 2 && t[0].includes("Ravi") && t[1].includes("Rahul"), "items: " + JSON.stringify(t));` },
        ],
        hint: 'const [q, setQ] = useState(""); const s = q.toLowerCase(); const shown = customers.filter((c) => c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s));',
        solution: jsx`
const customers = [
  { name: "Asha", city: "Pune" },
  { name: "Ravi", city: "Indore" },
  { name: "Meena", city: "Mumbai" },
  { name: "Rahul", city: "Nashik" },
  { name: "Priya", city: "Mumbai" },
];

function App() {
  const [q, setQ] = useState("");
  const s = q.toLowerCase();
  const shown = customers.filter((c) => c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s));
  return (
    <div>
      <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      <p id="found">{shown.length} found</p>
      <ul>{shown.map((c) => <li key={c.name}>{c.name} – {c.city}</li>)}</ul>
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'What makes an input "controlled"?', options: ['It has a label', 'Its value comes from state and onChange updates that state', 'It is disabled', 'It uses a ref'], answer: 1, why: 'React state is the single source of truth for the text.' },
      { q: 'Why call e.preventDefault() in onSubmit?', options: ['To submit faster', 'To stop the browser reloading the page', 'To clear the form', 'It is required by JSX'], answer: 1, why: 'A normal HTML form submit reloads the page and loses state.' },
    ],
  },
  {
    id: 'r-effects',
    module: 'react-real',
    title: 'Effects and loading data',
    minutes: 14,
    goals: ['Run code after render with useEffect', 'Load data with loading and error states', 'Clean up timers and subscriptions'],
    body: () => (
      <>
        <P>
          Rendering should only describe the screen. Anything else (loading data, timers, setting the page title) is a <Term id="effect">side effect</Term> and belongs
          in <F>useEffect</F>. Here, <F>fakeFetch(data, ms)</F> stands in for a real network request: it gives back <F>data</F> after <F>ms</F> milliseconds.
        </P>
        <ReactRunner
          code={jsx`
function App() {
  const [accounts, setAccounts] = useState(null);   // null = still loading

  useEffect(() => {
    fakeFetch([{ id: "A1010", dpd: 47 }, { id: "A1017", dpd: 112 }], 800)
      .then((data) => setAccounts(data));
  }, []);                                            // [] = run once, after the first render

  if (accounts === null) return <p>Loading accounts…</p>;
  return <ul>{accounts.map((a) => <li key={a.id}>{a.id}: {a.dpd} DPD</li>)}</ul>;
}
`}
        />
        <H>Clean-up</H>
        <ReactRunner
          code={jsx`
function App() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);          // stop the old timer when running changes or we leave
  }, [running]);                             // re-run the effect when running changes

  return (
    <div>
      <p>Call timer: {seconds}s</p>
      <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>
    </div>
  );
}
`}
        />
        <Callout tone="warn" title="The dependency array matters">
          Leave it out and the effect runs after <B>every</B> render; if that effect sets state, you get an endless loop. <F>[]</F> means once;{' '}
          <F>[running]</F> means whenever <F>running</F> changes.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'r-loader',
        kind: 'react',
        title: 'Load the promises',
        prompt:
          'When App first appears, show <p>Loading…</p>. Use useEffect to call fakeFetch(promises, 300) once; when it resolves, show each promise as an <li> ("name: ₹amount") and a <p id="due">₹total due</p> with the total formatted with toLocaleString("en-IN").',
        starter: jsx`
const promises = [
  { name: "Ravi", amount: 12000 },
  { name: "Meena", amount: 4500 },
  { name: "Arjun", amount: 8100 },
];

function App() {
  return <p>Loading…</p>;
}
`,
        tests: [
          { name: 'Shows "Loading…" first', code: `h.assert(h.text().includes("Loading"), "first render shows: " + h.text());` },
          { name: 'Then lists the three promises', code: `await h.wait(700); const t = h.$$("li").map((l) => l.textContent); h.assert(t.length === 3 && t[0].includes("Ravi") && t[2].includes("Arjun"), "items after loading: " + JSON.stringify(t)); h.assert(!h.text().includes("Loading"), "still says Loading");` },
          { name: 'And the total ₹24,600', code: `await h.wait(700); h.assert(h.$("#due") && h.$("#due").textContent.includes("24,600"), "total shows: " + (h.$("#due") || {}).textContent);` },
        ],
        hint: 'const [data, setData] = useState(null); useEffect(() => { fakeFetch(promises, 300).then(setData); }, []); if (!data) return <p>Loading…</p>; then compute the total with reduce.',
        solution: jsx`
const promises = [
  { name: "Ravi", amount: 12000 },
  { name: "Meena", amount: 4500 },
  { name: "Arjun", amount: 8100 },
];

function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fakeFetch(promises, 300).then(setData);
  }, []);
  if (!data) return <p>Loading…</p>;
  const total = data.reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <ul>{data.map((p) => <li key={p.name}>{p.name}: ₹{p.amount.toLocaleString("en-IN")}</li>)}</ul>
      <p id="due">₹{total.toLocaleString("en-IN")} due</p>
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'useEffect(fn, []) runs fn…', options: ['On every render', 'Once, after the first render', 'Never', 'Before the first render'], answer: 1, why: 'An empty dependency array means no dependencies can change, so it runs once.' },
      { q: 'Why return a function from an effect?', options: ['To render it', 'To clean up (clear timers, unsubscribe) before the effect runs again or the component disappears', 'React requires it', 'To return data'], answer: 1, why: 'Without clean-up, timers and listeners pile up.' },
    ],
  },
  {
    id: 'r-project',
    module: 'react-real',
    title: 'Project: a collections mini-dashboard',
    minutes: 18,
    goals: ['Combine state, lists, conditions and derived values', 'Keep one source of truth and calculate the rest', 'Structure an app into small components'],
    body: () => (
      <>
        <P>
          A good React app stores the <B>minimum</B> in state and calculates everything else on each render. Here only the chosen bucket is state; the filtered list, the
          count and the total are derived from it.
        </P>
        <ReactRunner
          code={jsx`
const accounts = [
  { id: "A1001", name: "Asha", dpd: 0, balance: 37700 },
  { id: "A1005", name: "Pooja", dpd: 12, balance: 131600 },
  { id: "A1010", name: "Rahul", dpd: 47, balance: 127200 },
  { id: "A1014", name: "Rohit", dpd: 71, balance: 268900 },
  { id: "A1020", name: "Yash", dpd: 130, balance: 145200 },
];
const BUCKETS = { All: () => true, "0-30": (d) => d <= 30, "31-90": (d) => d > 30 && d <= 90, "90+": (d) => d > 90 };

function Total({ rows }) {
  const sum = rows.reduce((s, r) => s + r.balance, 0);
  return <p><b>{rows.length}</b> accounts, ₹{sum.toLocaleString("en-IN")}</p>;
}

function App() {
  const [bucket, setBucket] = useState("All");            // the only state
  const rows = accounts.filter((a) => BUCKETS[bucket](a.dpd));  // derived
  return (
    <div>
      {Object.keys(BUCKETS).map((b) => (
        <button key={b} onClick={() => setBucket(b)} style={{ fontWeight: b === bucket ? 800 : 400 }}>{b}</button>
      ))}
      <Total rows={rows} />
      <table><tbody>
        {rows.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.dpd}</td><td>₹{r.balance.toLocaleString("en-IN")}</td></tr>)}
      </tbody></table>
    </div>
  );
}
`}
          height="h-72"
        />
        <Callout title="Where to go from here">
          The <B>Learn the Code</B> course shows how this portfolio itself is built with React, Tailwind and Motion. Real projects start with <F>npm create vite@latest</F>.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'r-dashboard',
        kind: 'react',
        title: 'Agent dashboard',
        prompt:
          'Build App with one button per agent ("All", "Kiran", "Neha") that filters the payments, a <p id="total"> showing the filtered total as ₹ with toLocaleString("en-IN"), and a <p id="count"> showing how many payments. Keep only the selected agent in state.',
        starter: jsx`
const payments = [
  { id: 1, agent: "Kiran", amount: 4860 },
  { id: 2, agent: "Neha", amount: 12810 },
  { id: 3, agent: "Kiran", amount: 3800 },
  { id: 4, agent: "Neha", amount: 6970 },
  { id: 5, agent: "Kiran", amount: 2920 },
];

function App() {
  return <div></div>;
}
`,
        tests: [
          { name: 'Starts on All: ₹31,360 from 5 payments', code: `h.assert(h.$("#total") && h.$("#total").textContent.includes("31,360"), "total: " + (h.$("#total") || {}).textContent); h.assert(h.$("#count").textContent.includes("5"), "count: " + h.$("#count").textContent);` },
          { name: 'Kiran: ₹11,580 from 3', code: `await h.click(h.button("Kiran")); h.assert(h.$("#total").textContent.includes("11,580"), "total: " + h.$("#total").textContent); h.assert(h.$("#count").textContent.includes("3"), "count: " + h.$("#count").textContent);` },
          { name: 'Neha: ₹19,780 from 2, and back to All', code: `await h.click(h.button("Neha")); h.assert(h.$("#total").textContent.includes("19,780"), "total: " + h.$("#total").textContent); await h.click(h.button("All")); h.assert(h.$("#total").textContent.includes("31,360"), "back to All: " + h.$("#total").textContent);` },
        ],
        hint: 'const [agent, setAgent] = useState("All"); const rows = payments.filter((p) => agent === "All" || p.agent === agent); then total with reduce, and buttons from ["All", "Kiran", "Neha"].map(...).',
        solution: jsx`
const payments = [
  { id: 1, agent: "Kiran", amount: 4860 },
  { id: 2, agent: "Neha", amount: 12810 },
  { id: 3, agent: "Kiran", amount: 3800 },
  { id: 4, agent: "Neha", amount: 6970 },
  { id: 5, agent: "Kiran", amount: 2920 },
];

function App() {
  const [agent, setAgent] = useState("All");
  const rows = payments.filter((p) => agent === "All" || p.agent === agent);
  const total = rows.reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      {["All", "Kiran", "Neha"].map((a) => <button key={a} onClick={() => setAgent(a)}>{a}</button>)}
      <p id="total">₹{total.toLocaleString("en-IN")}</p>
      <p id="count">{rows.length} payments</p>
    </div>
  );
}
`,
      },
    ],
    quiz: [
      { q: 'The filtered list can be worked out from the selected bucket. Should it be state too?', options: ['Yes, always store everything', 'No: derive it during render from the state you already have', 'Only in class components', 'Store it in localStorage'], answer: 1, why: 'Duplicated state gets out of sync; derived values never do.' },
      { q: 'Why split an app into components like <Total />?', options: ['React requires one component per value', 'Each piece is smaller, reusable and easier to understand', 'It makes it slower', 'For CSS only'], answer: 1, why: 'Small components with clear props are easier to read, test and reuse.' },
    ],
  },
];

export const reactCourse = {
  id: 'react',
  title: 'React',
  tagline: 'Build interactive web interfaces, live in your browser',
  blurb:
    'The library behind this portfolio. Write components, props, state, lists, forms and effects with a live preview that updates as you type, and exercises checked by clicking and typing in what you build. Uses React 19.',
  levels: 'Beginner → Intermediate',
  icon: 'react',
  modules,
  lessons,
};
