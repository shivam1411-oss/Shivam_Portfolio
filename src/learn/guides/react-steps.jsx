// Step-by-step material for the React lessons: same shape as python-steps.js (terms, process, steps), plus
// `practice(key)`, the live React editor the steps are done in.
// It is attached to the lessons in content/ (see withGuide), so each course loads only its own practice tool.
// scripts/check-steps.mjs replays the steps: each step is compiled and rendered, and `expect` lists text the first render must contain.
import ReactRunner from '../react/LazyReactRunner';

const REACT_START = `function App() {
  return <h1>Hello</h1>;
}
`;
const reactBox = (code = REACT_START) => (key) => <ReactRunner key={key} code={code} storageKey={`react-code:steps:${key}`} title="Practice box" />;
const NOW = 'Change the code in the practice box so it reads like this. The preview updates by itself a moment after you stop typing.';

export const reactSteps = {
  'r-intro': {
    terms: ['react', 'component', 'jsx', 'render', 'expression', 'error'],
    process: {
      title: 'How your code becomes what you see',
      stages: [
        ['You write a component', 'A function whose name starts with a capital letter, such as App, that returns JSX.'],
        ['React calls it', 'This is called rendering. React runs your function to find out what the screen should show.'],
        ['The JSX is read', 'Tags such as <h1> become page elements. Anything inside { } is worked out as JavaScript first.'],
        ['The page is updated', 'React puts the result on the screen: here, in the preview next to your code.'],
        ['Change the code, and it happens again', 'Every edit is rendered afresh, which is why the preview follows your typing.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Find the practice box. It already holds a tiny component called App. Click inside the code and change the word Hello to Hello, React! Wait a moment.', code: 'function App() {\n  return <h1>Hello, React!</h1>;\n}', see: 'The preview beside the code now shows Hello, React! as a heading.', expect: ['Hello, React!'] },
      { do: 'Store a value in a variable and show it with curly braces. ' + NOW, code: 'function App() {\n  const name = "Shivam";\n  return <h1>Hello, {name}!</h1>;\n}', see: 'Hello, Shivam! The braces were replaced by the value of name.', expect: ['Hello, Shivam!'] },
      { do: 'Do maths inside the braces. ' + NOW, code: 'function App() {\n  const accounts = 20;\n  return <p>Twice {accounts} is {accounts * 2}.</p>;\n}', see: 'Twice 20 is 40.', expect: ['Twice 20 is 40.'] },
      { do: 'Make a common mistake: return two elements side by side. ' + NOW, code: 'function App() {\n  return (\n    <h1>Portfolio</h1>\n    <p>20 accounts</p>\n  );\n}', see: 'A red error instead of the preview. A component must return one outer element.', error: true },
      { do: 'Fix it by wrapping both in one <div>. ' + NOW, code: 'function App() {\n  return (\n    <div>\n      <h1>Portfolio</h1>\n      <p>20 accounts</p>\n    </div>\n  );\n}', see: 'The error is gone: a Portfolio heading with 20 accounts under it.', expect: ['Portfolio', '20 accounts'] },
    ],
  },
  'r-props': {
    terms: ['component', 'props', 'jsx', 'argument', 'render'],
    process: {
      title: 'How data travels into a component',
      stages: [
        ['The parent writes the tag with attributes', '<Card name="Asha" balance={25000} />'],
        ['React gathers them into one object', '{ name: "Asha", balance: 25000 }: these are the props.'],
        ['It calls the child with that object', 'Card({ name, balance }) receives the values, usually unpacked in the brackets.'],
        ['The child returns its JSX', 'Using the props wherever it needs them.'],
        ['Props only go downwards', 'A child reads its props; it never changes them.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Write a second component above App, and use it inside App like a tag. ' + NOW, code: 'function Card() {\n  return <p>An account card</p>;\n}\n\nfunction App() {\n  return <Card />;\n}', see: 'An account card. App drew the Card component.', expect: ['An account card'] },
      { do: 'Pass a value in as a prop. ' + NOW, code: 'function Card({ name }) {\n  return <p>Account of {name}</p>;\n}\n\nfunction App() {\n  return <Card name="Asha" />;\n}', see: 'Account of Asha.', expect: ['Account of Asha'] },
      { do: 'Reuse the same component with different props. ' + NOW, code: 'function Card({ name, balance }) {\n  return <p>{name} owes {balance}</p>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Card name="Asha" balance={25000} />\n      <Card name="Ravi" balance={4000} />\n    </div>\n  );\n}', see: 'Two lines: Asha owes 25000 and Ravi owes 4000. One component, drawn twice.', expect: ['Asha owes 25000', 'Ravi owes 4000'] },
      { do: 'Put content between the opening and closing tags; it arrives as the children prop. ' + NOW, code: 'function Box({ children }) {\n  return <div style={{ border: "2px solid teal", padding: 8 }}>{children}</div>;\n}\n\nfunction App() {\n  return (\n    <Box>\n      <p>Inside the box</p>\n    </Box>\n  );\n}', see: 'Inside the box, with a teal border around it.', expect: ['Inside the box'] },
    ],
  },
  'r-state': {
    terms: ['state', 'hook', 'render', 'component', 'variable', 'call'],
    process: {
      title: 'What happens when you click a button that changes state',
      stages: [
        ['useState gives a value and a setter', 'const [count, setCount] = useState(0): count starts at 0.'],
        ['The click runs your handler', 'onClick={() => setCount(count + 1)} runs only when the button is clicked.'],
        ['The setter stores the new value', 'React remembers 1 in place of 0.'],
        ['React calls your component again', 'This is a re-render. This time useState hands back 1.'],
        ['The screen is updated', 'Only what changed is redrawn: the number on the page.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Give the component some memory with useState. ' + NOW, code: 'function App() {\n  const [count, setCount] = useState(0);\n  return <p>Reminders sent: {count}</p>;\n}', see: 'Reminders sent: 0. The number in useState(0) is the starting value.', expect: ['Reminders sent: 0'] },
      { do: 'Add a button. ' + NOW, code: 'function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Reminders sent: {count}</p>\n      <button>Send one</button>\n    </div>\n  );\n}', see: 'A Send one button under the text. Clicking it does nothing yet.', expect: ['Send one'] },
      { do: 'Make the click change the state: add onClick to the button. ' + NOW + ' Then click the button a few times.', code: 'function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Reminders sent: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Send one</button>\n    </div>\n  );\n}', see: 'The number goes up by one with every click.', expect: ['Reminders sent: 0', 'Send one'] },
      { do: 'Show something worked out from the state. Add one line under the first <p>. ' + NOW + ' Click again.', code: 'function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Reminders sent: {count}</p>\n      <p>Cost: ₹{count * 2}</p>\n      <button onClick={() => setCount(count + 1)}>Send one</button>\n    </div>\n  );\n}', see: 'Both lines update on each click: the cost is always twice the count.', expect: ['Cost: ₹0'] },
      { do: 'Add a second button that sets the state back to 0. ' + NOW + ' Click Send one a few times, then Reset.', code: 'function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Reminders sent: {count}</p>\n      <p>Cost: ₹{count * 2}</p>\n      <button onClick={() => setCount(count + 1)}>Send one</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}', see: 'Reset puts both lines back to 0.', expect: ['Reset'] },
    ],
  },
  'r-lists': {
    terms: ['list', 'loop', 'jsx', 'reactkey', 'condition', 'render'],
    process: {
      title: 'How an array becomes a list on screen',
      stages: [
        ['Start with an array of data', 'const accounts = [{ id: "A1", name: "Asha" }, …]'],
        ['map visits every item', 'accounts.map((a) => …) calls your function once per item.'],
        ['Each call returns a piece of JSX', '<li key={a.id}>{a.name}</li>'],
        ['React draws them in order', 'The array of JSX pieces appears as a list.'],
        ['The key tells items apart', 'When the data changes, React uses each key to know which item moved, was added or was removed.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Draw one line per item of an array with map. ' + NOW, code: 'function App() {\n  const names = ["Asha", "Ravi", "Meena"];\n  return (\n    <ul>\n      {names.map((n) => <li key={n}>{n}</li>)}\n    </ul>\n  );\n}', see: 'A bulleted list: Asha, Ravi, Meena.', expect: ['Asha', 'Ravi', 'Meena'] },
      { do: 'Use objects, with the id as the key. ' + NOW, code: 'function App() {\n  const accounts = [\n    { id: "A1", name: "Asha", dpd: 0 },\n    { id: "A2", name: "Ravi", dpd: 45 },\n    { id: "A3", name: "Meena", dpd: 95 },\n  ];\n  return (\n    <ul>\n      {accounts.map((a) => <li key={a.id}>{a.name}: {a.dpd} days</li>)}\n    </ul>\n  );\n}', see: 'Three lines: Asha: 0 days, Ravi: 45 days, Meena: 95 days.', expect: ['Ravi', '45', 'Meena', '95'] },
      { do: 'Show a warning only for late accounts, using &&. Change the <li> line. ' + NOW, code: 'function App() {\n  const accounts = [\n    { id: "A1", name: "Asha", dpd: 0 },\n    { id: "A2", name: "Ravi", dpd: 45 },\n    { id: "A3", name: "Meena", dpd: 95 },\n  ];\n  return (\n    <ul>\n      {accounts.map((a) => <li key={a.id}>{a.name} {a.dpd > 30 && <b>LATE</b>}</li>)}\n    </ul>\n  );\n}', see: 'LATE appears in bold beside Ravi and Meena, and nothing beside Asha.', expect: ['LATE'] },
      { do: 'Choose between two texts with the ? : operator. Change the <li> line again. ' + NOW, code: 'function App() {\n  const accounts = [\n    { id: "A1", name: "Asha", dpd: 0 },\n    { id: "A2", name: "Ravi", dpd: 45 },\n    { id: "A3", name: "Meena", dpd: 95 },\n  ];\n  return (\n    <ul>\n      {accounts.map((a) => <li key={a.id}>{a.name}: {a.dpd > 30 ? "late" : "on time"}</li>)}\n    </ul>\n  );\n}', see: 'Asha: on time, Ravi: late, Meena: late.', expect: ['on time', 'late'] },
    ],
  },
  'r-forms': {
    terms: ['state', 'controlled', 'event', 'filter', 'render'],
    process: {
      title: 'How a controlled input works',
      stages: [
        ['State holds the text', 'const [text, setText] = useState("")'],
        ['The input shows the state', 'value={text}: the box displays whatever the state holds.'],
        ['Typing fires onChange', 'onChange={(e) => setText(e.target.value)} hands you what the box would now contain.'],
        ['You store it in state', 'setText saves the new text.'],
        ['React re-renders', 'The input shows the new state, and anything else that uses text updates too.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Make an input whose text lives in state. ' + NOW + ' Then type in the box in the preview.', code: 'function App() {\n  const [text, setText] = useState("");\n  return (\n    <div>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a name" />\n      <p>You typed: {text}</p>\n    </div>\n  );\n}', see: 'Whatever you type appears after You typed: at once.', expect: ['You typed:'] },
      { do: 'Use the text to filter a list as you type. ' + NOW + ' Then type the letter a.', code: 'function App() {\n  const [text, setText] = useState("");\n  const names = ["Asha", "Ravi", "Meena", "Karan"];\n  const shown = names.filter((n) => n.toLowerCase().includes(text.toLowerCase()));\n  return (\n    <div>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search" />\n      <ul>\n        {shown.map((n) => <li key={n}>{n}</li>)}\n      </ul>\n    </div>\n  );\n}', see: 'All four names at first. Typing m leaves only Meena; clearing the box brings them all back.', expect: ['Asha', 'Ravi', 'Meena', 'Karan'] },
      { do: 'Show how many matched. Add one line under the input. ' + NOW, code: 'function App() {\n  const [text, setText] = useState("");\n  const names = ["Asha", "Ravi", "Meena", "Karan"];\n  const shown = names.filter((n) => n.toLowerCase().includes(text.toLowerCase()));\n  return (\n    <div>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search" />\n      <p>{shown.length} of {names.length} shown</p>\n      <ul>\n        {shown.map((n) => <li key={n}>{n}</li>)}\n      </ul>\n    </div>\n  );\n}', see: '4 of 4 shown, and the first number drops as you type.', expect: ['4 of 4 shown'] },
    ],
  },
  'r-effects': {
    terms: ['effect', 'hook', 'state', 'render', 'api'],
    process: {
      title: 'How loading data with an effect works',
      stages: [
        ['The component renders first', 'With no data yet, it shows "Loading…".'],
        ['The effect runs after that render', 'useEffect(() => { … }, []) runs once the component is on screen.'],
        ['The effect asks for the data', 'The request takes time; the page stays usable meanwhile.'],
        ['The data arrives and is put in state', 'setAccounts(data)'],
        ['React re-renders with the data', '"Loading…" is replaced by the list.'],
        ['[] means "only once"', 'The list after the function says when to run the effect again. Empty means never again.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Start with a component that has no data yet. ' + NOW, code: 'function App() {\n  const [accounts, setAccounts] = useState(null);\n  if (!accounts) return <p>Loading…</p>;\n  return <p>{accounts.length} accounts loaded</p>;\n}', see: 'Loading… and it stays that way, because nothing ever loads the data.', expect: ['Loading…'] },
      { do: 'Load the data in an effect. fakeFetch is a pretend network call provided by this Lab. ' + NOW, code: 'function App() {\n  const [accounts, setAccounts] = useState(null);\n  useEffect(() => {\n    fakeFetch(["Asha", "Ravi", "Meena"], 1000).then(setAccounts);\n  }, []);\n  if (!accounts) return <p>Loading…</p>;\n  return <p>{accounts.length} accounts loaded</p>;\n}', see: 'Loading… for about a second, then 3 accounts loaded.', expect: ['Loading…'] },
      { do: 'Show the names once they arrive. Change the last return. ' + NOW, code: 'function App() {\n  const [accounts, setAccounts] = useState(null);\n  useEffect(() => {\n    fakeFetch(["Asha", "Ravi", "Meena"], 1000).then(setAccounts);\n  }, []);\n  if (!accounts) return <p>Loading…</p>;\n  return (\n    <ul>\n      {accounts.map((a) => <li key={a}>{a}</li>)}\n    </ul>\n  );\n}', see: 'Loading… for about a second, then a list: Asha, Ravi, Meena.', expect: ['Loading…'] },
    ],
  },
  'r-project': {
    terms: ['component', 'state', 'props', 'filter', 'render'],
    process: {
      title: 'How to build a small app from a blank page',
      stages: [
        ['Start with the data', 'Write the array of accounts first. Everything on screen comes from it.'],
        ['Draw it plainly', 'A list with map, no styling, no buttons.'],
        ['Add one piece of state', 'Only what the user can change: here, a "late only" switch.'],
        ['Work the rest out from state', 'The filtered list and the totals are calculated on every render, never stored.'],
        ['Split into components last', 'Once it works, move repeated pieces into their own components and pass props.'],
      ],
    },
    practice: reactBox(),
    steps: [
      { do: 'Step one of the plan: the data, drawn plainly. ' + NOW, code: 'const ACCOUNTS = [\n  { id: "A1", name: "Asha", balance: 25000, dpd: 0 },\n  { id: "A2", name: "Ravi", balance: 4000, dpd: 45 },\n  { id: "A3", name: "Meena", balance: 61000, dpd: 95 },\n];\n\nfunction App() {\n  return (\n    <ul>\n      {ACCOUNTS.map((a) => <li key={a.id}>{a.name}: {a.balance}</li>)}\n    </ul>\n  );\n}', see: 'Three lines: Asha: 25000, Ravi: 4000, Meena: 61000.', expect: ['Asha', '25000', 'Meena', '61000'] },
      { do: 'Add a total worked out from the data. ' + NOW, code: 'const ACCOUNTS = [\n  { id: "A1", name: "Asha", balance: 25000, dpd: 0 },\n  { id: "A2", name: "Ravi", balance: 4000, dpd: 45 },\n  { id: "A3", name: "Meena", balance: 61000, dpd: 95 },\n];\n\nfunction App() {\n  const total = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);\n  return (\n    <div>\n      <p>Total: {total}</p>\n      <ul>\n        {ACCOUNTS.map((a) => <li key={a.id}>{a.name}: {a.balance}</li>)}\n      </ul>\n    </div>\n  );\n}', see: 'Total: 90000 above the list.', expect: ['Total: 90000'] },
      { do: 'Add one piece of state and a button that flips it, and filter the list with it. ' + NOW + ' Then click the button.', code: 'const ACCOUNTS = [\n  { id: "A1", name: "Asha", balance: 25000, dpd: 0 },\n  { id: "A2", name: "Ravi", balance: 4000, dpd: 45 },\n  { id: "A3", name: "Meena", balance: 61000, dpd: 95 },\n];\n\nfunction App() {\n  const [lateOnly, setLateOnly] = useState(false);\n  const shown = lateOnly ? ACCOUNTS.filter((a) => a.dpd > 30) : ACCOUNTS;\n  const total = shown.reduce((sum, a) => sum + a.balance, 0);\n  return (\n    <div>\n      <button onClick={() => setLateOnly(!lateOnly)}>{lateOnly ? "Show all" : "Late only"}</button>\n      <p>Total: {total}</p>\n      <ul>\n        {shown.map((a) => <li key={a.id}>{a.name}: {a.balance}</li>)}\n      </ul>\n    </div>\n  );\n}', see: 'Clicking Late only leaves Ravi and Meena, and the total becomes 65000. Clicking Show all brings Asha back and the total returns to 90000.', expect: ['Late only', 'Total: 90000'] },
      { do: 'Tidy up: move one row into its own component and pass the account in as a prop. ' + NOW, code: 'const ACCOUNTS = [\n  { id: "A1", name: "Asha", balance: 25000, dpd: 0 },\n  { id: "A2", name: "Ravi", balance: 4000, dpd: 45 },\n  { id: "A3", name: "Meena", balance: 61000, dpd: 95 },\n];\n\nfunction Row({ account }) {\n  return <li>{account.name}: {account.balance}</li>;\n}\n\nfunction App() {\n  const [lateOnly, setLateOnly] = useState(false);\n  const shown = lateOnly ? ACCOUNTS.filter((a) => a.dpd > 30) : ACCOUNTS;\n  const total = shown.reduce((sum, a) => sum + a.balance, 0);\n  return (\n    <div>\n      <button onClick={() => setLateOnly(!lateOnly)}>{lateOnly ? "Show all" : "Late only"}</button>\n      <p>Total: {total}</p>\n      <ul>\n        {shown.map((a) => <Row key={a.id} account={a} />)}\n      </ul>\n    </div>\n  );\n}', see: 'Exactly the same app as before. Splitting into components changes the code, not what the user sees.', expect: ['Late only', 'Total: 90000', 'Meena'] },
    ],
  },
};
