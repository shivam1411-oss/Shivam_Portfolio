import { Callout, Code, Term } from './ui';
import { ComponentTree, DataToUI, MotionPlayground, PropsPlayground, StateCalculator, Steps, ThemeDecider, TokenEditor } from './widgets/basics';
import { BlurVsGradient, BreakpointPreview, ChunkTimeline, DecodeDemo, DeviceInspector, MaskDemo, MatrixMini, StorageInspector } from './widgets/effects';
import { ChatFlow, MaskPhone, ZTestStepper } from './widgets/features';
import { RouteExplorer, ThreadDemo } from './widgets/lab';
import { HaloDemo, ShineDemo } from './widgets/recent';
import PyRunner from './python/PyRunner';

// Every lesson explains one part of how the portfolio was built, with the real code, a playground and a quiz.
// `commits` link a lesson to the changes in the timeline (src/learn/timeline.js).

export const modules = [
  { id: 'foundations', title: 'Foundations', blurb: 'How the site is put together: React, components, state and data files.' },
  { id: 'look', title: 'Look & feel', blurb: 'Styling with Tailwind, light and dark themes, and animations.' },
  { id: 'effects', title: 'The effects', blurb: 'The code matrix, cursor trail, welcome screen and water reveal.' },
  { id: 'speed', title: 'Speed & devices', blurb: 'Making it fast on phones and laying it out for every screen.' },
  { id: 'features', title: 'Features', blurb: 'The Analytical Lab maths, contact pop-up, resume and AI chat.' },
  { id: 'shipping', title: 'Shipping it', blurb: 'Git, automatic deploys to GitHub Pages, and the Android app.' },
  { id: 'python-lab', title: 'Learning Lab & Python', blurb: 'How the course pages work, and how Python was made to run, get tested and deploy in the browser.' },
  { id: 'accounts', title: 'Accounts & payments', blurb: 'Sign-in and synced progress, free and paid lessons, Razorpay payments, and a checkout that never gets stuck.' },
];

const P = ({ children }) => <p className="my-4 leading-relaxed text-muted">{children}</p>;
const H = ({ children }) => <h3 className="mt-10 mb-3 text-xl font-extrabold text-fg">{children}</h3>;
const B = ({ children }) => <b className="text-fg">{children}</b>;
const F = ({ children }) => <code className="px-1.5 py-0.5 rounded bg-surface-2 border border-line font-mono text-[0.85em] text-fg">{children}</code>;

export const lessons = [
  // ---------------------------------------------------------------- Foundations
  {
    id: 'big-picture',
    module: 'foundations',
    title: 'From one HTML file to a React app',
    minutes: 8,
    commits: ['d1fd86a'],
    goals: ['What changed when the site moved to React', 'What Vite does and what dist/ is', 'Where to find things in the project'],
    body: () => (
      <>
        <P>
          Your portfolio started as a single <Term id="html">HTML</Term> file of about 840 lines, with all the text, layout and scripts mixed together. The first big
          change rebuilt it with <Term id="react">React</Term>, <Term id="vite">Vite</Term>, <Term id="tailwind">Tailwind CSS</Term> and <Term id="motion">Motion</Term>.
          The page looks like one thing to a visitor, but the code is now split into small files that each do one job.
        </P>
        <H>The new index.html is almost empty</H>
        <P>
          Open <F>index.html</F> today and the body has just one empty box and one script. React fills the box in.
        </P>
        <Code file="index.html">{`
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>`}</Code>
        <Code file="src/main.jsx" note="createRoot finds the empty div and draws <App /> inside it. ThemeProvider wraps everything so any part of the site can ask 'is it dark?'.">{`
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);`}</Code>
        <H>Your files are not what visitors download</H>
        <P>
          Browsers do not understand <Term id="jsx">JSX</Term> or Tailwind classes on their own. Vite is a translator: it reads all of <F>src/</F> and writes a few small,
          optimised files into <F>dist/</F>. That folder is what gets published.
        </P>
        <Steps
          title="What happens when you run npm run build"
          steps={[
            { label: 'You write code', body: 'Components in src/components, text in src/data, styles in src/index.css, images and the PDF in public/assets.' },
            { label: 'npm install', body: 'npm reads package.json and downloads the libraries the site uses (React, Motion, lucide icons, pdf.js, EmailJS) into node_modules/.', code: 'npm install' },
            { label: 'vite build', body: 'Vite converts JSX into plain JavaScript, generates only the Tailwind CSS you actually use, shrinks everything and gives files unique names so browsers never use a stale copy.', code: 'npm run build   # = vite build' },
            { label: 'dist/', body: 'The output: index.html, privacy.html, learn.html, and an assets/ folder of bundled JS and CSS. Nothing in dist/ is edited by hand; it is rebuilt every time.' },
            { label: 'Published', body: 'GitHub Actions runs the same build on every push to main and puts dist/ on GitHub Pages. You will see this in the "Shipping it" lessons.' },
          ]}
        />
        <H>Map of the project</H>
        <Code file="project folders">{`
src/main.jsx          // starts React
src/App.jsx           // welcome screen, then the site
src/Site.jsx          // the portfolio sections in order
src/components/       // one file per piece of the page
src/data/             // all text and numbers (content, impact, playbook)
src/theme/            // light/dark theme logic
src/index.css         // colours (CSS variables) and custom styles
public/assets/        // photo and resume PDF, copied as-is
chat-worker/          // the AI chat server (separate from the site)
android/              // the Android app project
.github/workflows/    // automatic deploy to GitHub Pages`}</Code>
        <Callout title="Beginner tip">
          To change a sentence on the site, you almost never need to touch a component. Look in <F>src/data/content.js</F> first.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Which folder is actually published to GitHub Pages?',
        options: ['src/', 'dist/', 'node_modules/', 'public/'],
        answer: 1,
        why: 'Vite writes the optimised, browser-ready site into dist/. That is what the deploy workflow uploads.',
      },
      {
        q: 'Why is the body of index.html almost empty?',
        options: ['The site failed to load', 'React draws the whole page into the #root div using JavaScript', 'The HTML lives on another server', 'It is hidden for privacy'],
        answer: 1,
        why: 'main.jsx finds <div id="root"> and React renders every component inside it.',
      },
    ],
  },
  {
    id: 'components',
    module: 'foundations',
    title: 'Components and props',
    minutes: 8,
    commits: ['d1fd86a'],
    goals: ['What a component is', 'How the page is a tree of components', 'How props pass data and functions down'],
    body: () => (
      <>
        <P>
          A <Term id="component">component</Term> is a JavaScript function that returns what to show. Your site is built from about twenty of them, nested inside each other like
          boxes. <F>Site.jsx</F> simply lists the sections in the order they appear:
        </P>
        <Code file="src/Site.jsx">{`
export default function Site() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = useCallback(() => setContactOpen(true), []);
  // ...
  return (
    <>
      <Navbar onConnect={openContact} onResume={openResume} />
      <main>
        <Hero onConnect={openContact} />
        <Marquee />
        <Metrics />
        <Experience />
        <Lab />
      </main>
      <Footer onResume={openResume} />
      <ContactModal open={contactOpen} onClose={closeContact} onResume={openResume} />
    </>
  );
}`}</Code>
        <ComponentTree />
        <H>Props: a component's inputs</H>
        <P>
          The things written like attributes, <F>onConnect={'{openContact}'}</F> or <F>open={'{contactOpen}'}</F>, are <Term id="props">props</Term>. They are how a parent
          hands information to a child. Here Site owns the "is the contact pop-up open?" fact and gives the Navbar and Hero a function to open it. Clicking "Connect" in either
          place calls the same function, so they can never disagree.
        </P>
        <PropsPlayground />
        <Callout title="Rule of thumb">
          Data flows <B>down</B> through props; events flow <B>up</B> by calling functions that were passed down.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'In <Hero onConnect={openContact} />, what is onConnect?',
        options: ['A CSS class', 'A prop holding a function Hero can call', 'An HTML tag', 'A file name'],
        answer: 1,
        why: 'It is a prop. Hero calls it when its Connect button is clicked, which opens the pop-up owned by Site.',
      },
      {
        q: 'Why does Site.jsx, not Navbar, keep track of whether the contact pop-up is open?',
        options: ['Navbar is too small', 'Several components (Navbar, Hero, ContactModal) need the same fact, so their shared parent owns it', 'It loads faster', 'No reason'],
        answer: 1,
        why: 'Shared information lives in the closest common parent and is passed down. This is called "lifting state up".',
      },
    ],
  },
  {
    id: 'state',
    module: 'foundations',
    title: 'State and hooks',
    minutes: 10,
    commits: ['93a2614'],
    goals: ['What state is and why changing it redraws the page', 'useState, useEffect, useRef in plain words', 'How the Lab calculators work'],
    body: () => (
      <>
        <P>
          <Term id="state">State</Term> is anything a component needs to remember: which Lab method is selected, where each slider is, whether the SQL is showing. You create it
          with the <Term id="hook">hook</Term> <F>useState</F>, which gives you the current value and a function to change it.
        </P>
        <Code file="src/components/Lab.jsx">{`
const [activeKey, setActiveKey] = useState(playbook[0].key);   // which method tab
const [sqlOpen, setSqlOpen] = useState(false);                // is the SQL shown?

// a slider moved: copy the old values and replace just one
const setValue = (id, v) =>
  setValues((all) => ({ ...all, [activeKey]: { ...all[activeKey], [id]: v } }));`}</Code>
        <P>
          When you call a setter, React re-runs the component (a <Term id="render">render</Term>) with the new value and updates only what changed on screen. You never touch the
          page directly.
        </P>
        <StateCalculator />
        <H>The three hooks you see everywhere</H>
        <Code file="cheat sheet">{`
useState(initial)   // remember a value; changing it redraws the component
useEffect(fn, deps) // run code after drawing (start a loop, listen to scroll); return a clean-up
useRef(initial)     // remember a value WITHOUT redrawing (a canvas element, a counter)`}</Code>
        <P>
          The canvas effects use <Term id="effect">useEffect</Term> to start their animation loop when they appear, and return a function that stops it and removes event
          listeners when they disappear. Forgetting that clean-up is a classic source of slowdowns.
        </P>
        <Code file="src/components/CodeTrail.jsx (shape)">{`
useEffect(() => {
  window.addEventListener('pointermove', onMove);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
  };
}, []);   // [] = run once, when the component first appears`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'What happens when a slider calls setValues(...)?',
        options: ['Nothing until you reload', 'React stores the new value and re-renders the component, so the result updates', 'The page reloads', 'The value is saved to a server'],
        answer: 1,
        why: 'Calling a state setter schedules a re-render with the new value.',
      },
      {
        q: 'Which hook would you use to start an animation loop when a component appears?',
        options: ['useState', 'useEffect', 'useMemo', 'useContext'],
        answer: 1,
        why: 'useEffect runs after the component is drawn, and its returned function cleans up when it goes away.',
      },
      {
        q: 'Why use useRef instead of useState for a frame counter inside a loop?',
        options: ['useRef is newer', 'Changing a ref does not trigger a re-render, so 60 updates a second stay cheap', 'useState cannot hold numbers', 'Refs are saved to disk'],
        answer: 1,
        why: 'Refs are a box React does not watch. Perfect for values that change constantly but do not need to be shown.',
      },
    ],
  },
  {
    id: 'data',
    module: 'foundations',
    title: 'Content lives in data files',
    minutes: 6,
    commits: ['d1fd86a', '5fc8139', '93a2614', '63eaa96'],
    goals: ['Why text and numbers are kept apart from layout', 'What is in content.js, impact.js and playbook.js', 'How a component loops over data'],
    body: () => (
      <>
        <P>
          Your career history, contact details, hero proof cards, impact results and Lab formulas are not written inside the components. They live in three plain JavaScript
          files in <F>src/data/</F>. Components import them and loop over them.
        </P>
        <Code file="src/data/content.js">{`
export const experience = [
  {
    period: 'June 2023 – May 2026',
    title: 'Manager, Repayments',
    company: 'FPL Technologies (OneCard), Pune',
    points: [
      'Managed DPD 30–150 buckets, improving Collection Efficiency from 50% to 65%.',
      'Optimized collection cycles, cutting DSO by 12 days.',
    ],
  },
  // ...one object per job
];`}</Code>
        <Code file="a component looping over data (simplified)" note="map() turns each object in the list into a piece of the page. Add a job to the list and a new card appears; no layout code changes.">{`
{experience.map((job) => (
  <article key={job.period}>
    <h3>{job.title}</h3>
    <p>{job.company}</p>
  </article>
))}`}</Code>
        <DataToUI />
        <H>Where each thing lives</H>
        <Code file="src/data/">{`
content.js   // profile, contacts (masked phones), nav links, hero pillars,
             // skills, education, experience, EmailJS ids
impact.js    // "Impact by the numbers" result cards and delivery steps
playbook.js  // the five Analytical Lab methods: formula, sliders, maths, SQL`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'You got a new job. What is the simplest correct change?',
        options: ['Edit Experience.jsx layout', 'Add a new object at the top of the experience list in src/data/content.js', 'Edit index.html', 'Edit dist/'],
        answer: 1,
        why: 'The Experience component loops over that list, so a new entry becomes a new card automatically.',
      },
      {
        q: 'What does .map() do in a component?',
        options: ['Draws a map', 'Turns each item in a list into a piece of the page', 'Sorts a list', 'Saves data'],
        answer: 1,
        why: 'map() transforms every item, here from a data object into JSX.',
      },
    ],
  },

  // ---------------------------------------------------------------- Look & feel
  {
    id: 'styling',
    module: 'look',
    title: 'Tailwind and CSS variables',
    minutes: 8,
    commits: ['d1fd86a'],
    goals: ['How to read a Tailwind class list', 'What CSS variables are and why the theme uses them', 'How custom utilities like glass and text-gradient are made'],
    body: () => (
      <>
        <P>
          With <Term id="tailwind">Tailwind</Term> you style things by adding short class names right in the JSX. Each class does one small job. This is the Contact button in
          the pop-up:
        </P>
        <Code file="src/components/ContactModal.jsx">{`
className="mt-6 w-full flex items-center justify-center gap-2 p-4
           rounded-2xl bg-fg text-bg font-bold text-sm shadow-soft"`}</Code>
        <Code file="how to read it">{`
mt-6         // margin on top (6 × 4px = 24px)
w-full       // full width
flex items-center justify-center gap-2   // centre the icon and text, 8px apart
p-4          // 16px padding all round
rounded-2xl  // rounded corners
bg-fg text-bg  // background = text colour, text = background colour (an inverted button)
font-bold text-sm shadow-soft`}</Code>
        <H>Colours come from variables</H>
        <P>
          Notice <F>bg-fg</F> and <F>text-bg</F> are not "black" or "white". They are names you defined. At the top of <F>src/index.css</F>, each colour is a{' '}
          <Term id="cssvar">CSS variable</Term>, with one set for light and another for <F>.dark</F>. Tailwind is told those names exist via <F>@theme</F>.
        </P>
        <Code file="src/index.css">{`
:root {            /* light theme */
  --bg: #f7f7f5;
  --fg: #0c0d10;
  --accent: #0f8a7e;
}
.dark {            /* same names, dark values */
  --bg: #0a0b0e;
  --fg: #ecedef;
  --accent: #3fd1bf;
}
@theme inline {    /* lets you write bg-bg, text-fg, text-accent... */
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-accent: var(--accent);
}`}</Code>
        <TokenEditor />
        <H>Your own utilities</H>
        <Code file="src/index.css" note="@utility creates a new Tailwind class. 'glass' is the frosted see-through look on the navbar; on touch screens it turns solid because blurring is expensive on phones.">{`
@utility text-gradient {
  background: linear-gradient(110deg, var(--accent), var(--accent-2));
  background-clip: text;
  color: transparent;
}
@utility glass {
  background: color-mix(in oklab, var(--surface) 72%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  @media (pointer: coarse) { backdrop-filter: none; }
}`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'Why do the components use bg-surface instead of bg-white?',
        options: ['bg-white does not exist', 'bg-surface points to a variable that has a different value in dark mode, so one class works in both themes', 'It is shorter', 'For SEO'],
        answer: 1,
        why: 'The variable --surface is white in light mode and near-black in dark mode, so components never need to know the theme.',
      },
      {
        q: 'What does p-4 mean in Tailwind?',
        options: ['4 paragraphs', '16px of padding on every side', 'Position 4', '4% opacity'],
        answer: 1,
        why: 'The spacing scale is 4px per step: p-4 = 16px.',
      },
    ],
  },
  {
    id: 'themes',
    module: 'look',
    title: 'Light and dark themes',
    minutes: 10,
    commits: ['d1fd86a', '97209b3'],
    goals: ['How the theme is chosen before the page appears', 'How the toggle saves your choice', 'How the circular reveal works and why phones skip it'],
    body: () => (
      <>
        <P>
          The whole theme is one class on the <F>{'<html>'}</F> element: if it has <F>dark</F>, the dark variables win. The tricky part is choosing it early enough that the
          page never flashes the wrong colours.
        </P>
        <H>Step 1: decide before anything is drawn</H>
        <P>
          A tiny script sits in the <F>{'<head>'}</F> of every page and runs before React even loads. It checks for a saved choice in <Term id="localstorage">localStorage</Term>,
          otherwise follows the device's <Term id="mediaquery">media query</Term> for dark mode.
        </P>
        <ThemeDecider />
        <H>Step 2: the toggle</H>
        <Code file="src/theme/ThemeProvider.jsx (simplified)">{`
const toggleTheme = (event) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);          // remember the choice

  const switchTo = () => {
    root.classList.add('theme-switching');      // pause colour fades
    root.classList.toggle('dark', next === 'dark');
    flushSync(() => setTheme(next));
    requestAnimationFrame(() => requestAnimationFrame(
      () => root.classList.remove('theme-switching')));
  };

  // phones, reduced motion, or old browsers: switch instantly
  if (!document.startViewTransition || reduce || !finePointer) return switchTo();

  // desktop: circle grows from where you clicked
  const transition = document.startViewTransition(switchTo);
  transition.ready.then(() => root.animate(
    { clipPath: ['circle(0px at x y)', 'circle(Rpx at x y)'] },
    { duration: 420, pseudoElement: '::view-transition-new(root)' }));
};`}</Code>
        <P>
          The <Term id="viewtransition">View Transitions API</Term> takes a picture of the page in the old theme, switches, takes a picture of the new theme, then lets you
          animate between them. Here the new picture is revealed through a growing circle centred on the button.
        </P>
        <Callout title="What the latest fix (97209b3) changed">
          On the welcome screen the toggle sat underneath the full-screen "click to enter" area, so clicking it entered the site instead. It was raised above with a higher{' '}
          <F>z-index</F>. Colour fades on every card were paused during the switch (<F>.theme-switching</F>) so the theme changes in one crisp step, and phones now switch
          instantly because full-page snapshots are slow on them.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'A first-time visitor has their phone set to dark mode. Which theme do they see?',
        options: ['Light, always', 'Dark, because nothing is saved so the device preference is used', 'Random', 'Whatever the last visitor chose'],
        answer: 1,
        why: 'With no saved value, the script follows (prefers-color-scheme: dark).',
      },
      {
        q: 'Why is the theme script inside <head> instead of in React?',
        options: ['React cannot read localStorage', 'It runs before the page is painted, so there is no flash of the wrong theme', 'It is a security requirement', 'Head scripts are faster to write'],
        answer: 1,
        why: 'React loads a moment later. Setting the class first means the very first paint already has the right colours.',
      },
      {
        q: 'Why do phones skip the circular reveal?',
        options: ['Phones do not support CSS', 'Taking full-page snapshots is slow on phones, so an instant switch feels better', 'It uses too much data', 'It is a bug'],
        answer: 1,
        why: 'The commit made touch devices switch instantly for exactly this reason.',
      },
    ],
  },
  {
    id: 'readable',
    module: 'look',
    title: 'Keeping text readable over the effects',
    minutes: 8,
    commits: ['c852408', '0e03fc2', '66be771'],
    goals: ['Why the moving code made some words hard to read', 'How one inherited text-shadow fixes every line at once', 'Which places switch it off, and the light-theme gloss bug that taught us why'],
    body: () => (
      <>
        <P>
          The code matrix and the cursor trail are drawn on <Term id="canvas">canvases</Term> <B>behind</B> the page. That looks great, but wherever a bright line of code
          passed under a sentence, the letters and the code blurred together. The fix had to work for every paragraph on the site and in this Lab, in both themes, without
          touching hundreds of components.
        </P>
        <H>One rule, inherited everywhere</H>
        <P>
          A <Term id="textshadow">text-shadow</Term> with no offset and a blur draws a soft glow around each letter. If that glow is the <B>page's own background colour</B>,
          it quietly erases the code just around the words. Because text-shadow is <B>inherited</B>, setting it once on <F>main</F> and <F>footer</F> reaches every line inside.
        </P>
        <Code file="src/index.css">{`
main,
footer {
  /* three soft layers in the page colour: light grey in light theme, near-black in dark */
  text-shadow: 0 0 4px var(--bg), 0 0 10px var(--bg), 0 0 18px var(--bg);
}`}</Code>
        <HaloDemo />
        <H>Where it must be switched off</H>
        <P>
          Text sitting on its own solid background (a card, a button, a badge) has nothing showing through it, so the halo is pointless there, and on gradient text it would
          smudge the colours. Those places turn it off:
        </P>
        <Code file="src/index.css">{`
/* Browsers reset text-shadow on <button>; let background-less buttons inherit it */
:is(main, footer) button { text-shadow: inherit; }

/* Solid backgrounds: bg-surface, bg-accent… (a "/" like bg-accent/5 is a faint tint, so it keeps the halo) */
:is(main, footer) :is([class^="bg-"], [class*=" bg-"]):not([class*="/"]),
/* Solid colour panels such as bg-[#0d1014], even if another class has a "/" */
:is(main, footer) [class*="bg-[#"]:not([class*="]/"]),
:is(main, footer) :is(.glass, .text-gradient, .shine-text, svg, canvas, img) {
  text-shadow: none;
}`}</Code>
        <Callout tone="warn" title="The light-theme gloss bug (66be771)">
          The dark Analytical Lab panel has the class <F>bg-[#0d1014]</F>, but also <F>border-white/5</F>. That "/" made the first rule think it was a faint tint, so the
          halo stayed on. In the light theme the halo is <B>white</B>, so every white word on the dark panel got a white glow and looked glossy. The extra rule for{' '}
          <F>bg-[#…]</F> panels fixed it, and also covered the dark code editors and terminals in this Lab. Try "Halo, old rule" on a dark panel in the playground above.
        </Callout>
        <P>
          The cursor trail also moved: it now sits just above the matrix (<F>-z-[4]</F>) instead of over everything, and only goes on top on the welcome screen, where
          there is no reading to do.
        </P>
      </>
    ),
    quiz: [
      {
        q: 'Why is the halo set on main and footer instead of on every paragraph?',
        options: ['It is faster to type', 'text-shadow is inherited, so one rule reaches every line of text inside', 'Paragraphs cannot have shadows', 'Tailwind requires it'],
        answer: 1,
        why: 'Inherited properties flow down to every child unless something sets its own value.',
      },
      {
        q: 'What colour is the halo in the light theme?',
        options: ['Black', 'The accent colour', 'The page background, a near-white', 'Transparent'],
        answer: 2,
        why: 'It uses var(--bg), which is the page colour in whichever theme is on.',
      },
      {
        q: 'Why did the Analytical Lab panel look glossy in the light theme?',
        options: [
          'The panel had a gradient',
          'A "/" in another class (border-white/5) fooled the opt-out rule, so a white halo surrounded white text',
          'The font was too thin',
          'The canvas was drawn on top',
        ],
        answer: 1,
        why: 'The opt-out skipped any class list with a "/". The fix added a rule just for solid bg-[#…] panels.',
      },
    ],
  },
  {
    id: 'animation',
    module: 'look',
    title: 'Animations with Motion',
    minutes: 8,
    commits: ['d1fd86a', 'b5219e7'],
    goals: ['Describing animations as start and end states', 'Scroll reveals, staggered lists and count-ups', 'Respecting reduced motion'],
    body: () => (
      <>
        <P>
          With <Term id="motion">Motion</Term> you do not write animation frames. You say where something starts and where it ends, and Motion fills in between. The site's
          helpers live in <F>src/components/motion.jsx</F>.
        </P>
        <Code file="src/components/motion.jsx" note="whileInView starts the animation when the element scrolls on screen; once: true means it only plays the first time.">{`
export const ease = [0.22, 1, 0.36, 1];   // fast start, gentle stop

export function Reveal({ children, delay = 0, y = 24 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}`}</Code>
        <MotionPlayground />
        <H>Other tricks used on the site</H>
        <Code file="where to find them">{`
Counter     // numbers count up from 0 when scrolled into view (Hero stats)
SplitWords  // headline words slide up one after another
Magnetic    // buttons lean towards the cursor (springs)
Spotlight   // a soft glow follows the cursor across cards (CSS variables --mx/--my)
layoutId    // the selected Lab tab background slides between tabs
AnimatePresence // lets things animate OUT before they are removed (pop-ups, tabs)`}</Code>
        <Callout title="Accessibility">
          <F>{'<MotionConfig reducedMotion="user">'}</F> in <F>App.jsx</F> tells Motion to follow the visitor's <Term id="reducedmotion">reduced motion</Term> setting, and the
          canvas effects check the same setting themselves.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'What does staggerChildren do?',
        options: ['Makes children shake', 'Starts each child\'s animation a little after the previous one', 'Hides children', 'Sorts children'],
        answer: 1,
        why: 'It delays each child by the given seconds, giving the cascading "one after another" effect.',
      },
      {
        q: 'Why does the site check prefers-reduced-motion?',
        options: ['To save battery only', 'Some people get dizzy or unwell from motion and turn this setting on', 'Search engines require it', 'It makes images load'],
        answer: 1,
        why: 'Respecting it is an accessibility basic.',
      },
    ],
  },

  // ---------------------------------------------------------------- Effects
  {
    id: 'canvas',
    module: 'effects',
    title: 'Canvas and the animation loop',
    minutes: 12,
    commits: ['168019b', 'b5219e7', '7d0e435'],
    goals: ['What a canvas is and why the effects use one', 'How requestAnimationFrame makes a loop', 'How the code matrix and code trail are drawn'],
    body: () => (
      <>
        <P>
          The falling code matrix and the code tokens that follow your cursor are not HTML elements. There would be thousands of them. Instead each is drawn on a{' '}
          <Term id="canvas">canvas</Term>: one element you paint pixels on with JavaScript, many times a second.
        </P>
        <H>The loop</H>
        <P>
          Every animation on a canvas follows the same pattern: update positions, clear, draw, and ask the browser to call you again before the next screen refresh with{' '}
          <Term id="raf">requestAnimationFrame</Term>.
        </P>
        <Code file="the pattern (from Intro.jsx)">{`
const tick = () => {
  // ~30fps is plenty for falling code and halves the drawing work.
  if (tickCount++ % 2 === 0) {
    matrix.step();          // move every stream down
    matrix.step();          // twice, so it falls at the same speed
    matrix.drawFull(ctx, currentMatrixTheme(), glow, dpr);
  }
  frame = requestAnimationFrame(tick);   // see you next frame
};
frame = requestAnimationFrame(tick);
// clean-up: cancelAnimationFrame(frame)`}</Code>
        <MatrixMini />
        <H>How the matrix is built (src/components/codeMatrix.js)</H>
        <Code file="src/components/codeMatrix.js">{`
// Real code, read top-to-bottom down each column
const CODE = \`SELECT bucket, SUM(balance) AS exposure FROM ar_book ...
cei = (opening_ar + sales - closing_ar) / (...) * 100
if challenger.cure_rate > champion.cure_rate: strategy.scale(challenger)\`;

// each cube: flat face, light top-left edge, dark bottom-right edge
const drawTile = (ctx, theme, x, y) => {
  ctx.fillStyle = theme.tile; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = theme.hi;   ctx.fillRect(x, y, s, 1); ctx.fillRect(x, y, 1, s);
  ctx.fillStyle = theme.lo;   ctx.fillRect(x, y + s - 1, s, 1); ...
};`}</Code>
        <P>
          One clever saving: <F>drawFull</F> draws the whole unlit grid <B>once</B> into a hidden canvas (a cache), then each frame copies that picture in one go and only
          redraws the few lit cells near each stream head.
        </P>
        <H>The code trail (CodeTrail.jsx)</H>
        <P>
          Each time the pointer moves, a few "glyphs" are added at points along the path, each with its own drift, spin, colour and lifetime. Every frame they move, fade
          and shrink; dead ones are filtered out; when none are left the loop stops so it costs nothing while you are still.
        </P>
        <Code file="src/components/CodeTrail.jsx">{`
const TOKENS = ['{', '}', '=>', '!=', '&&', 'SUM', 'SQL', 'dpd', 'AR', '₹', ...];

glyphs = glyphs.filter((s) => s.age < s.life);   // drop finished ones
for (const s of glyphs) {
  s.age++;  s.x += s.vx;  s.y += s.vy;
  s.vy = s.vy * 0.97 + 0.02;                     // slow down, slight gravity
  ctx.globalAlpha = fade * flicker * s.peak;
  ctx.fillText(s.token, 0, 0);
}
frame = glyphs.length ? requestAnimationFrame(tick) : 0;  // stop when empty`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'Why are the matrix and trail drawn on a canvas instead of with HTML elements?',
        options: ['Canvas is prettier', 'Thousands of moving HTML elements would be far too slow; one canvas is cheap to repaint', 'HTML cannot show text', 'For SEO'],
        answer: 1,
        why: 'A canvas is a single element, so drawing thousands of characters on it each frame stays fast.',
      },
      {
        q: 'What does requestAnimationFrame(tick) do?',
        options: ['Runs tick once, right before the next screen refresh', 'Runs tick every second forever', 'Pauses the page', 'Loads an image'],
        answer: 0,
        why: 'It schedules tick for the next frame. Calling it again inside tick makes a loop.',
      },
      {
        q: 'Why does the trail stop its loop when there are no glyphs?',
        options: ['To save battery and CPU while nothing is moving', 'Because of a bug', 'Canvas requires it', 'To clear storage'],
        answer: 0,
        why: 'An idle loop still costs work every frame. Stopping it makes the effect free while the cursor is still.',
      },
    ],
  },
  {
    id: 'welcome',
    module: 'effects',
    title: 'The welcome screen',
    minutes: 7,
    commits: ['7d0e435', 'b5219e7', '97209b3'],
    goals: ['How the decoding name works', 'Why it shows only once per visit (sessionStorage)', 'How the site is mounted when you enter'],
    body: () => (
      <>
        <P>
          The first thing visitors see is a full-screen code matrix, your name decoding from random symbols, and a quote. Clicking, tapping or pressing Enter opens a portal into
          the site. It lives in <F>src/components/Intro.jsx</F>.
        </P>
        <DecodeDemo />
        <Code file="src/components/Intro.jsx">{`
id = setInterval(() => {
  step++;
  setOut(text.split('').map((c, i) =>
    c === ' ' ? ' '
    : i < step      ? c              // already decoded: real letter
    : i < step + 6  ? randomGlyph()  // the next 6: random symbols
    : ''                             // the rest: not shown yet
  ).join(''));
  if (step >= text.length) clearInterval(id);
}, 28);`}</Code>
        <H>Showing it once per visit</H>
        <P>
          When you enter, the site writes <F>intro-seen = 1</F> into <Term id="sessionstorage">sessionStorage</Term>. Coming back from the privacy page during the same visit
          skips the intro; a new visit shows it again.
        </P>
        <Code file="src/App.jsx">{`
const introSeen = () => {
  try { return sessionStorage.getItem('intro-seen') === '1'; }
  catch { return false; }        // storage blocked (private mode): just show it
};

const [entered, setEntered] = useState(introSeen);
// ...
{showIntro && <Intro onEnter={enterSite} onDone={closeIntro} />}
{entered && <Suspense fallback={null}><Site /></Suspense>}`}</Code>
        <StorageInspector />
        <Callout title="Why try/catch around storage?">
          Some browsers (private windows, strict settings) throw an error when you touch storage. Wrapping it means the worst case is the intro showing again, never a broken
          page.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why sessionStorage and not localStorage for intro-seen?',
        options: ['sessionStorage is faster', 'It clears when the browser session ends, so each new visit sees the welcome screen once', 'localStorage is not allowed', 'No difference'],
        answer: 1,
        why: 'The goal is "once per visit", not "once ever", which is exactly what sessionStorage gives.',
      },
      {
        q: 'In the decode effect, what is shown at positions just after the decoded letters?',
        options: ['Nothing', 'Random code symbols', 'The real letters', 'Dots'],
        answer: 1,
        why: 'The next six positions show randomGlyph(), which gives the scrambling look.',
      },
    ],
  },
  {
    id: 'tilt-shine',
    module: 'effects',
    title: 'The shine that follows your tilt',
    minutes: 8,
    commits: ['94372b5'],
    goals: ['How a gradient clipped to text makes a glossy name', 'How the phone\'s gyroscope (or the mouse) moves the gleam', 'Why the shine eases and why it settles back to the middle'],
    body: () => (
      <>
        <P>
          On the welcome screen a gleam slides across "SHIVAM SONI" as you tilt your phone, or move the mouse on a computer. It is the same idea as the glossy glass plaques on
          the app icon, made with plain CSS and a few lines of JavaScript.
        </P>
        <H>Step 1: paint the text with a gradient</H>
        <P>
          The letters are made transparent, and a wide gradient (base colour, a bright band, base colour) is painted behind them and <B>clipped to the shape of the text</B>.
          The gradient is three times wider than the word, so moving it sideways slides the bright band across the letters. Its position comes from a{' '}
          <Term id="cssvar">CSS variable</Term>, <F>--shine</F>.
        </P>
        <Code file="src/index.css">{`
.shine-text {
  color: transparent;
  background-image: linear-gradient(105deg,
    var(--shine-base) 38%, var(--accent) 44%, #fff 50%,
    var(--accent-2) 56%, var(--shine-base) 62%);
  background-size: 300% 100%;                     /* three words wide */
  background-position: var(--shine, 50%) 0;       /* moved by JavaScript */
  background-clip: text;                          /* only inside the letters */
}`}</Code>
        <ShineDemo />
        <H>Step 2: read the tilt</H>
        <P>
          Phones report their angle through the <Term id="gyroscope">deviceorientation</Term> event: <F>gamma</F> is left/right tilt and <F>beta</F> is front/back. The code
          measures tilt from a <B>baseline</B>, how you were already holding the phone, and lets that baseline slowly follow you. So holding the phone at any angle starts the
          shine in the middle, and if you stop moving it drifts back there.
        </P>
        <Code file="src/components/Intro.jsx (useTiltShine)">{`
const onTilt = (e) => {
  if (!base) base = { g: e.gamma, b: e.beta };   // how the phone was held
  base.g += (e.gamma - base.g) * 0.02;            // the baseline slowly follows
  base.b += (e.beta - base.b) * 0.02;
  aim(50 + (e.gamma - base.g) * 2 + (e.beta - base.b) * 0.8);
};
const onMouse = (e) => aim((e.clientX / innerWidth) * 140 - 20);   // computers

// Ease towards the target, writing the variable straight to the element
const loop = () => {
  pos += (target - pos) * 0.12;
  el.style.setProperty('--shine', pos + '%');
  frame = Math.abs(target - pos) > 0.05 ? requestAnimationFrame(loop) : 0;
};`}</Code>
        <Callout title="Why not use React state?">
          The gyroscope fires dozens of times a second. Writing <F>--shine</F> straight onto the element with <F>style.setProperty</F> moves the gleam without asking React to
          re-render anything, and the <Term id="raf">animation loop</Term> stops by itself once the shine has arrived. People who ask for{' '}
          <Term id="reducedmotion">reduced motion</Term> get no moving shine at all.
        </Callout>
        <P>
          The app icon uses the same look: <F>scripts/app-icon.swift</F> draws "SHIVAM SONI" on three stacked glass plaques with a glossy sheen over the code-matrix tiles, and
          writes every size Android needs.
        </P>
      </>
    ),
    quiz: [
      {
        q: 'How does the gradient appear only inside the letters?',
        options: ['The letters are an image', 'background-clip: text, with the text colour set to transparent', 'A mask made in Photoshop', 'The canvas draws it'],
        answer: 1,
        why: 'The background is clipped to the glyph shapes, and transparent text lets it show through.',
      },
      {
        q: 'Why is tilt measured from a slowly moving baseline?',
        options: [
          'Gyroscopes are inaccurate',
          'So the shine starts in the middle however you hold the phone, and drifts back when you stop moving',
          'To save battery',
          'Android requires it',
        ],
        answer: 1,
        why: 'Only the change from how you were holding it moves the gleam.',
      },
      {
        q: 'Why is --shine written with style.setProperty instead of React state?',
        options: ['React cannot set CSS variables', 'It changes many times a second; skipping React re-renders keeps it smooth', 'It is shorter', 'For security'],
        answer: 1,
        why: 'Fast-changing visual values are best written straight to the element.',
      },
    ],
  },
  {
    id: 'reveal',
    module: 'effects',
    title: 'The water-droplet reveal',
    minutes: 9,
    commits: ['025e871', '168019b', '77ebbfa'],
    goals: ['What a mask is', 'How canvas compositing hides and shows layers', 'How droplets wobble, drift and dry up'],
    body: () => (
      <>
        <P>
          Behind the whole page sits the code matrix, normally invisible. Wherever the cursor goes, "water" washes the page away to reveal it. That is <B>masking</B>: a shape
          decides where a hidden picture is allowed to show.
        </P>
        <MaskDemo />
        <H>Three layers, every frame</H>
        <Code file="src/components/CursorReveal.jsx (outline)">{`
// 1) paint soft droplet blobs on a small mask canvas
for (const d of drops) {
  d.x += d.vx;  d.y += d.vy;   // drift with the motion, slight downward pull
  d.r += d.grow;               // spread out
  // fade in quickly, dry up slowly
  blobPath(mctx, d.x, d.y, d.r, d.seed, MASK_SCALE);  mctx.fill();
}
// 2) draw the matrix only inside the droplets
ctx.drawImage(mask, 0, 0, w, h);
ctx.globalCompositeOperation = 'source-in';
ctx.drawImage(art, 0, 0, w, h);
// 3) faint ripple rings on top
ctx.globalCompositeOperation = 'source-atop';`}</Code>
        <P>
          The wobble comes from <F>blobPath</F>: a circle whose radius is nudged by three sine waves that drift over time, so every droplet's edge ripples like water.
        </P>
        <Code file="src/components/CursorReveal.jsx">{`
const k = 1
  + 0.14 * Math.sin(3 * a + time * 0.045 + seed)
  + 0.09 * Math.sin(5 * a - time * 0.06  + seed * 1.7)
  + 0.05 * Math.sin(8 * a + time * 0.09  + seed * 0.3);`}</Code>
        <Callout title="Performance tricks in this effect">
          The mask is drawn at 30% size (22% on phones) because a soft blob looks the same scaled up. Only cubes inside the wet area are drawn (<F>drawRegion</F>). On phones,
          small height changes from the address bar sliding are ignored so the matrix does not reshuffle while you scroll.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: "With globalCompositeOperation = 'source-in', what is kept?",
        options: ['Everything', 'New pixels only where existing pixels (the mask) already are', 'Only the old pixels', 'Nothing'],
        answer: 1,
        why: 'source-in keeps the new drawing only inside what is already there, so the matrix appears only inside the droplets.',
      },
      {
        q: 'Why is the mask drawn at a smaller size?',
        options: ['To look pixelated', 'Soft blurry shapes look the same scaled up, and a smaller canvas is much cheaper', 'Canvas has a size limit', 'For colour accuracy'],
        answer: 1,
        why: 'Drawing 30% of the pixels in each direction is about 9% of the work.',
      },
    ],
  },

  // ---------------------------------------------------------------- Speed & devices
  {
    id: 'performance',
    module: 'speed',
    title: 'Making it fast on phones',
    minutes: 10,
    commits: ['1917bba', '77ebbfa', '93a2614'],
    goals: ['Why some CSS is expensive', 'How the site detects touch screens', 'The changes that took idle frames from ~95ms to ~20ms'],
    body: () => (
      <>
        <P>
          A screen refreshes about 60 times a second, so each frame has roughly 16 milliseconds. On an Android test phone the site was taking ~95ms per idle frame, which feels
          sluggish. Commit <F>1917bba</F> got it to ~20ms. Here is how.
        </P>
        <DeviceInspector />
        <H>1. Swap blur filters for gradients</H>
        <P>
          A big <F>filter: blur()</F> forces the browser to re-blur lots of pixels whenever anything near it changes. A <F>radial-gradient</F> that fades to transparent looks
          almost identical and is cheap.
        </P>
        <Code file="src/index.css">{`
/* A radial gradient looks like a big blurred circle but costs nothing to draw,
   unlike filter: blur() on a large element. */
.glow-accent {
  background: radial-gradient(closest-side,
    color-mix(in oklab, var(--accent) 22%, transparent), transparent);
}`}</Code>
        <BlurVsGradient />
        <H>2. Rotate a layer, do not repaint it</H>
        <Code file="src/index.css" note="Rotating a layer is handed to the GPU. Animating the gradient's angle instead would repaint it every frame.">{`
.ring-spin::before {
  background: conic-gradient(var(--accent), transparent 30%, var(--accent-2), ...);
  animation: ring-rotate 8s linear infinite;   /* transform: rotate(360deg) */
}`}</Code>
        <H>3. Lighter settings on touch screens</H>
        <Code file="src/components/CursorReveal.jsx">{`
const SETTINGS = {
  mouse: { spacing: 16, maxDrops: 140, cell: 14, maxDpr: 1.5, glow: 8 },
  touch: { spacing: 22, maxDrops: 60,  cell: 18, maxDpr: 1,   glow: 0 },
};
const isTouch = window.matchMedia('(pointer: coarse)').matches;`}</Code>
        <P>
          On touch devices: no frosted glass, no film grain, no drifting glows, fewer droplets and tokens, bigger cubes (fewer to draw), no glow, and canvases capped at a lower{' '}
          <Term id="dpr">device pixel ratio</Term>. Section reveals also stopped animating a blur.
        </P>
        <Callout tone="warn" title="The cheap things to animate">
          <F>transform</F> (move, scale, rotate) and <F>opacity</F> are cheap for the <Term id="gpu">GPU</Term>. <F>filter: blur</F>, <F>backdrop-filter</F>, big shadows and
          changing width/height are expensive. When in doubt, animate transform and opacity.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Roughly how long does one frame have at 60 frames per second?',
        options: ['1 second', '16 milliseconds', '100 milliseconds', '1 millisecond'],
        answer: 1,
        why: '1000ms ÷ 60 ≈ 16.7ms. Taking longer drops frames and feels janky.',
      },
      {
        q: 'Which is cheapest to animate?',
        options: ['filter: blur()', 'width and height', 'transform and opacity', 'box-shadow'],
        answer: 2,
        why: 'Transform and opacity can be done by the GPU without repainting.',
      },
      {
        q: 'How does the code know it is on a phone or tablet?',
        options: ['It reads the phone brand', "window.matchMedia('(pointer: coarse)')", 'It asks the user', 'Screen colour'],
        answer: 1,
        why: 'pointer: coarse means the main input is a finger rather than a precise mouse.',
      },
    ],
  },
  {
    id: 'splitting',
    module: 'speed',
    title: 'Loading less up front',
    minutes: 6,
    commits: ['b5219e7'],
    goals: ['What a bundle and a chunk are', 'How React.lazy splits the site', 'Why it prefetches during the welcome screen'],
    body: () => (
      <>
        <P>
          Before <F>b5219e7</F>, all JavaScript (welcome screen, every section, the PDF viewer, email library) was one <Term id="bundle">bundle</Term> that had to download
          before anything appeared. Now the site is its own <Term id="chunk">chunk</Term>.
        </P>
        <Code file="src/App.jsx">{`
// The site is a separate chunk so the welcome screen shows as soon as possible;
// it starts downloading straight away.
const loadSite = () => import('./Site');
const Site = lazy(loadSite);

useEffect(() => {
  loadSite();          // prefetch while the welcome screen is up
}, []);`}</Code>
        <P>
          <F>import('./Site')</F> with brackets is a "dynamic import": Vite sees it and puts Site and everything it uses into a separate file. <F>lazy</F> lets React show it
          once it arrives. Because downloading starts immediately, by the time you click "enter" it is usually ready.
        </P>
        <ChunkTimeline />
        <Callout title="Same idea elsewhere">
          The PDF library in <F>ResumeModal.jsx</F> is also loaded with <F>await import('pdfjs-dist')</F>, only when someone opens the resume.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: "What does import('./Site') (with brackets) tell Vite?",
        options: ['Delete Site', 'Put Site in a separate file that loads on demand', 'Make Site load first', 'Nothing'],
        answer: 1,
        why: 'A dynamic import becomes its own chunk.',
      },
      {
        q: 'Why call loadSite() inside useEffect right away?',
        options: ['To start downloading the site while the visitor is still looking at the welcome screen', 'To skip the welcome screen', 'To clear the cache', 'It is required by React'],
        answer: 0,
        why: 'Prefetching hides the download time behind the welcome screen.',
      },
    ],
  },
  {
    id: 'responsive',
    module: 'speed',
    title: 'One layout for every screen',
    minutes: 6,
    commits: ['fa4391c', '5fc8139'],
    goals: ['Mobile-first Tailwind breakpoints', 'How the hero rearranges on phones', 'Readable font sizes on small screens'],
    body: () => (
      <>
        <P>
          Tailwind is <B>mobile first</B>: a class with no prefix applies everywhere, and <F>md:</F> or <F>lg:</F> versions take over from a certain width (a{' '}
          <Term id="breakpoint">breakpoint</Term>).
        </P>
        <Code file="reading responsive classes">{`
text-4xl md:text-5xl          // 36px on phones, 48px from 768px wide
grid-cols-1 lg:grid-cols-12   // one column on phones, 12-column grid on desktop
order-2 lg:order-1            // change the order things appear in
hidden lg:flex                // only show on desktop`}</Code>
        <BreakpointPreview />
        <P>
          Commit <F>fa4391c</F> moved the photo first on phones and tablets with the stat cards in a row below it (they used to overlap the face), limited the scroll
          fade/parallax to desktop, and raised the smallest labels to at least 10–11px. Later, <F>5fc8139</F> kept the call-to-action buttons visible without scrolling on
          laptops.
        </P>
        <Code file="src/index.css" note="Phones get the larger 11px so the tiny uppercase labels stay readable; from 48rem (768px) it drops to 10px.">{`
@utility eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  @media (width >= 48rem) { font-size: 10px; }
}`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'What does md:text-5xl mean?',
        options: ['Always 5xl', 'Use text-5xl from the md breakpoint (768px) upwards', 'Use text-5xl only on phones', 'Medium bold text'],
        answer: 1,
        why: 'Prefixed classes apply from that width and up.',
      },
      {
        q: 'In Tailwind, a class with no prefix applies to…',
        options: ['Only desktops', 'All screen sizes (it is the mobile starting point)', 'Only phones', 'Nothing'],
        answer: 1,
        why: 'Mobile first: unprefixed is the base; prefixes override for bigger screens.',
      },
    ],
  },

  // ---------------------------------------------------------------- Features
  {
    id: 'lab',
    module: 'features',
    title: 'The Analytical Lab maths',
    minutes: 10,
    commits: ['93a2614'],
    goals: ['How each method is described as data', 'The z-test behind champion-challenger', 'Why NULLIF appears in the SQL'],
    body: () => (
      <>
        <P>
          The Lab (<F>#lab</F>) is driven entirely by <F>src/data/playbook.js</F>. Each method is an object with its formula shown as chips, the sliders it needs, a{' '}
          <F>compute</F> function, and the SQL. <F>Lab.jsx</F> just draws whatever it is given.
        </P>
        <Code file="src/data/playbook.js (Roll rate)">{`
{
  key: 'roll',
  label: 'Roll Rate Analysis',
  formula: ['Roll rate', '=', 'Balance that rolled to the next bucket', '÷',
            "Bucket's balance last month", '× 100'],
  inputs: [
    { id: 'bucket', label: 'Balance in DPD 30–60 last month', min: 10, max: 200, value: 100 },
    { id: 'rolled', label: 'Of which rolled to DPD 60–90',   min: 0,  max: 100, value: 22 },
  ],
  compute: ({ bucket, rolled }) => {
    const v = bucket > 0 ? (Math.min(rolled, bucket) / bucket) * 100 : 0;
    return { value: v, verdict: v <= 15 ? 'Contained' : v <= 25 ? 'Watch closely' : 'High' };
  },
}`}</Code>
        <Callout title="Guarding against bad input">
          <F>bucket {'>'} 0 ? … : 0</F> avoids dividing by zero, and <F>Math.min(rolled, bucket)</F> stops a slider combination from claiming more rolled than existed. The SQL
          does the same with <F>NULLIF(x, 0)</F>, which turns a zero divisor into NULL instead of an error.
        </Callout>
        <H>Champion-challenger: luck or real?</H>
        <P>
          A challenger with a higher cure rate is not automatically better; small groups vary by chance. The Lab uses a two-proportion <Term id="ztest">z-test</Term>.
        </P>
        <ZTestStepper />
        <Code file="src/data/playbook.js">{`
function championChallenger({ n1, c1, n2, c2 }) {
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = se ? (p2 - p1) / se : 0;
  const lift = p1 ? ((p2 - p1) / p1) * 100 : 0;
  return { p1, p2, z, lift };
}
const significant = Math.abs(r.z) >= 1.96;   // 95% confidence`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'Champion 30% vs challenger 33% cure rate, 500 accounts each. Is it significant?',
        options: ['Yes, 10% lift is always significant', 'No: with small groups |z| is under 1.96, so it could be luck', 'Cannot be calculated', 'Only if the SQL agrees'],
        answer: 1,
        why: 'z ≈ 1.0 here. The same rates with 5,000 per arm give z ≈ 3.2, which is significant.',
      },
      {
        q: 'What does NULLIF(denominator, 0) prevent in the SQL?',
        options: ['Slow queries', 'A divide-by-zero error', 'Duplicate rows', 'Negative numbers'],
        answer: 1,
        why: 'It turns a zero divisor into NULL, so the result is NULL instead of an error.',
      },
    ],
  },
  {
    id: 'contact',
    module: 'features',
    title: 'Contact, resume and email',
    minutes: 7,
    commits: ['63eaa96', 'd1fd86a', 'd18b71e'],
    goals: ['How pop-ups (modals) open and close', 'Masked phone numbers', 'Sending the resume with EmailJS, and the PDF preview'],
    body: () => (
      <>
        <P>
          Both pop-ups are built on one shared <F>Modal.jsx</F> (backdrop, close button, Escape key, animation). <F>ContactModal</F> lists the contacts from{' '}
          <F>content.js</F>; <F>ResumeModal</F> previews and sends the PDF.
        </P>
        <H>Masked phone numbers</H>
        <Code file="src/data/content.js">{`
// Phone numbers are shown masked; the links still open WhatsApp / the dialler.
{ key: 'whatsapp', label: 'WhatsApp', value: '+91 ••••• ••456',
  href: 'https://wa.me/91XXXXXXXXXX', external: true },`}</Code>
        <MaskPhone />
        <H>Previewing and emailing the resume</H>
        <Code file="src/components/ResumeModal.jsx (shape)">{`
// PDF preview: load the heavy library only when the pop-up opens
const pdfjs = await import('pdfjs-dist');
const pdf = await pdfjs.getDocument(profile.resume).promise;

// Email: EmailJS sends the message straight from the browser
await emailjs.send(serviceId, templateId, { ...fields }, { publicKey });`}</Code>
        <Callout title="Are the EmailJS ids a secret?">
          No. EmailJS public keys are designed to be in browser code; the service controls which templates and domains can use them. Compare this with the Claude API key in
          the next lesson, which must never be in the site.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'If the phone number is masked, how does tapping it still work?',
        options: ['It does not', 'The visible text is masked but the link (href) still holds the full number', 'It asks the visitor to type it', 'JavaScript guesses it'],
        answer: 1,
        why: 'value is for display, href is where the link goes.',
      },
      {
        q: 'Why is the PDF library imported only when the resume pop-up opens?',
        options: ['It is large, and most visitors never open the resume', 'It is broken otherwise', 'Legal reasons', 'PDFs cannot load early'],
        answer: 0,
        why: 'Same idea as code splitting: do not make everyone download something only some people use.',
      },
    ],
  },
  {
    id: 'chat',
    module: 'features',
    title: 'The AI chat and its Worker',
    minutes: 12,
    commits: ['e123564'],
    goals: ['Why the API key must not be in the website', 'What the Cloudflare Worker checks', 'Streaming answers and why the widget is hidden until configured'],
    body: () => (
      <>
        <P>
          The "Ask my AI" widget answers questions on receivables, R2R, collections and automation using Claude. Calling Claude needs an <Term id="apikey">API key</Term>, and
          everything in your website can be read by anyone. So the key lives in a small server, a <Term id="worker">Cloudflare Worker</Term> in <F>chat-worker/</F>, which
          calls Claude on the site's behalf.
        </P>
        <ChatFlow />
        <H>The Worker's guards</H>
        <Code file="chat-worker/src/index.ts">{`
const origin = request.headers.get('Origin') ?? '';
if (!allowed.includes(origin)) return new Response('Forbidden', { status: 403 });

const { success } = await env.CHAT_LIMITER.limit({ key: ip });
if (!success) return json(429, { error: 'Too many messages...' }, cors);

messages = parseMessages(await request.json());   // alternating, ≤ 20, ≤ 2000 chars
if (!messages) return json(400, { error: 'Invalid conversation.' }, cors);

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });  // secret, server only`}</Code>
        <P>
          <Term id="cors">CORS</Term> headers and the allow-list in <F>wrangler.toml</F> mean only your site, local development and the Android app may call it. The{' '}
          <Term id="ratelimit">rate limit</Term> (10 per minute per visitor) keeps costs predictable.
        </P>
        <H>Streaming</H>
        <Code file="chat-worker/src/index.ts" note="Words are written to the response as Claude produces them, so the visitor sees the answer type itself out.">{`
for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    await writer.write(encoder.encode(event.delta.text));
  }
}`}</Code>
        <H>Hidden until it is set up</H>
        <Code file="src/components/ChatWidget.jsx">{`
const API_URL = import.meta.env.VITE_CHAT_API_URL;  // filled in at build time
// ...the widget renders nothing when API_URL is empty`}</Code>
        <Code file=".github/workflows/deploy.yml">{`
- run: npm run build
  env:
    VITE_CHAT_API_URL: \${{ vars.CHAT_API_URL }}   # repository variable`}</Code>
        <Callout tone="warn" title="To switch the chat on">
          Deploy the Worker (<F>npx wrangler deploy</F>), store the key with <F>npx wrangler secret put ANTHROPIC_API_KEY</F>, then add the Worker URL as the repository
          variable <F>CHAT_API_URL</F>. Full steps are in the README.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why is there a separate Worker instead of calling Claude from the site?',
        options: ['Workers are faster', 'Anything in the site can be read by visitors, so the secret key must stay on a server', 'Claude only talks to Cloudflare', 'To make the site bigger'],
        answer: 1,
        why: 'A key shipped in the website could be copied and used on your bill.',
      },
      {
        q: 'A request arrives from a website not on the allow-list. What happens?',
        options: ['Claude answers anyway', 'The Worker returns 403 Forbidden without calling Claude', 'The Worker crashes', 'It is rate limited to 10 per minute'],
        answer: 1,
        why: 'The origin check is the very first thing the Worker does.',
      },
      {
        q: 'Why is the chat bubble not visible on the live site yet?',
        options: ['It is broken', 'It only renders when VITE_CHAT_API_URL is set at build time, which needs the Worker deployed first', 'It only shows on Android', 'It shows after 10 visits'],
        answer: 1,
        why: 'The widget checks the build-time variable and stays hidden without it.',
      },
    ],
  },

  // ---------------------------------------------------------------- Shipping
  {
    id: 'deploy',
    module: 'shipping',
    title: 'Git, GitHub Actions and Pages',
    minutes: 11,
    commits: ['d1fd86a', 'e123564', 'd0d27a0', 'a77c041', '5258fec'],
    goals: ['Commits and branches in plain words', 'What the deploy workflow does, step by step', 'How a change reaches shivam-soni.com, and how shared links get a preview card'],
    body: () => (
      <>
        <P>
          <Term id="git">Git</Term> records every change as a <Term id="commit">commit</Term> with a message. The timeline on this platform is built from those commits. Work
          happens on a <Term id="branch">branch</Term> and is merged into <F>main</F> when ready.
        </P>
        <Steps
          title="From your laptop to the live site"
          steps={[
            { label: 'Change', body: 'Edit a file, e.g. a sentence in src/data/content.js. Check it with npm run dev, which serves the site at localhost:5173 and updates as you save.', code: 'npm run dev' },
            { label: 'Commit', body: 'Save a snapshot with a message that says what and why.', code: 'git add src/data/content.js\ngit commit -m "Update current role"' },
            { label: 'Push', body: 'Send your commits to GitHub. If you are on a branch, open a pull request and merge it into main.', code: 'git push' },
            { label: 'Actions builds', body: 'The push to main starts .github/workflows/deploy.yml on a fresh GitHub computer: it installs exactly the versions in package-lock.json (npm ci) and runs npm run build.' },
            { label: 'Paid lessons upload', body: 'With paid courses on, scripts/upload-paid.mjs puts the paid lesson files into private storage first, so the new site never points to files that are not there yet.' },
            { label: 'Pages serves', body: 'The dist/ folder is uploaded and published on GitHub Pages at shivam-soni.com. Usually live within a couple of minutes.' },
          ]}
        />
        <Code file=".github/workflows/deploy.yml (shortened)">{`
on:
  push:
    branches: [main]        # run on every push to main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5        # get the code
      - uses: actions/setup-node@v5      # Node 22 for the build
      - run: npm ci                      # install exact dependencies
      - run: npm run build               # create dist/
        env:
          VITE_PAYWALL: \${{ vars.PAYWALL }}           # "on" = paid courses
      - run: node scripts/upload-paid.mjs              # paid lessons → private storage
        env:
          SUPABASE_SECRET_KEY: \${{ secrets.SUPABASE_SECRET_KEY }}
      - uses: actions/upload-pages-artifact@v5
        with: { path: dist }
  deploy:
    needs: build
    steps:
      - uses: actions/deploy-pages@v5    # publish`}</Code>
        <Callout title="Variables and secrets">
          <F>vars.PAYWALL</F> is a plain repository setting anyone with access can read. <F>secrets.SUPABASE_SECRET_KEY</F> is a hidden secret: GitHub hands it to the
          workflow but never shows it in logs, and it is never written into the repository or the website.
        </Callout>
        <Callout title="Why the actions moved to v5 and v6 (d0d27a0)">
          Each <F>uses:</F> step is a small program that itself runs on Node.js. GitHub is retiring Node 20 for actions, so every action was moved to a version that runs on
          Node 24. Your own build still uses Node 22; that is a separate setting.
        </Callout>
        <H>Link previews</H>
        <P>
          When someone shares shivam-soni.com on WhatsApp, LinkedIn or X, the app reads <Term id="opengraph">Open Graph</Term> tags in the page's <F>{'<head>'}</F> to draw a
          card with a title, a description and a 1200×630 picture.
        </P>
        <Code file="index.html">{`
<meta property="og:title" content="Shivam Soni | Collection Strategy & Credit Risk Leader" />
<meta property="og:image" content="https://shivam-soni.com/assets/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />`}</Code>
        <Callout title="Why vite.config.js sets base: './'">
          Relative paths make the built files work wherever they are hosted: the custom domain today, or the old <F>/Shivam_Portfolio/</F> sub-folder address.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'What triggers a deploy of the live site?',
        options: ['Saving a file', 'A push (or merge) to the main branch', 'Running npm run dev', 'Opening the site'],
        answer: 1,
        why: 'The workflow runs on push to main (or manually via workflow_dispatch).',
      },
      {
        q: 'Why does the workflow use npm ci instead of npm install?',
        options: ['It is shorter', 'It installs exactly the versions in package-lock.json, so builds are repeatable', 'It skips React', 'It is required by Pages'],
        answer: 1,
        why: 'npm ci is the clean, exact install meant for automated builds.',
      },
    ],
  },
  {
    id: 'android',
    module: 'shipping',
    title: 'The Android app',
    minutes: 9,
    commits: ['1917bba', '94372b5', 'c22669d', 'a317d5e'],
    goals: ['How Capacitor turns the website into an app', 'What npm run apk does, including the automatic version number', 'Why the signing key decides whether an update installs'],
    body: () => (
      <>
        <P>
          The same website is also an installable Android app. <Term id="capacitor">Capacitor</Term> puts your built <F>dist/</F> folder inside a native app that shows it full
          screen. No code is rewritten.
        </P>
        <Code file="capacitor.config.json">{`
{
  "appId": "com.shivamsoni.portfolio",
  "appName": "Shivam Soni",
  "webDir": "dist",                  // the built website goes inside the app
  "backgroundColor": "#0a0b0e"       // dark launch screen
}`}</Code>
        <Steps
          title="What npm run apk does"
          steps={[
            {
              label: 'Bump the version',
              body: 'scripts/bump-android-version.mjs raises versionCode by 1 and the last number of versionName (1.9 → 1.10) in android/app/build.gradle, so every build installs as an update.',
              code: 'Android app version 1.10 (code 11)',
            },
            { label: 'vite build', body: 'Builds the website into dist/, exactly like for GitHub Pages.' },
            { label: 'cap sync android', body: 'Copies dist/ into the android/ project and updates its plugins.' },
            { label: 'Remove iCloud copies', body: 'iCloud Drive sometimes creates "name 2" duplicates that break Android builds; scripts/remove-icloud-duplicates.mjs deletes identical ones.' },
            { label: 'gradlew assembleDebug', body: 'Gradle, Android\'s build tool, compiles the app. Its output goes to ~/Library/Caches so iCloud never touches it.' },
            { label: 'APK', body: 'The installable file is copied to apk/Shivam-Soni-Portfolio.apk.' },
          ]}
        />
        <Callout tone="warn" title="Remember">
          The website is <B>inside</B> the <Term id="apk">APK</Term>. After changing the site, run <F>npm run apk</F> again and reinstall, or the app keeps showing the old
          version.
        </Callout>
        <H>Version numbers</H>
        <Code file="android/app/build.gradle">{`
defaultConfig {
    versionCode 10        // a whole number Android compares: higher = newer
    versionName "1.9"     // what people see in Settings → Apps
}`}</Code>
        <P>
          Android only installs a new APK over the old one if its <Term id="versioncode">versionCode</Term> is higher. Forgetting to raise it means "App not installed", so the
          bump is the first step of <F>npm run apk</F> and can never be skipped.
        </P>
        <H>The signing key</H>
        <P>
          Every APK is <Term id="signing">signed</Term> with a key. Android installs an update only if it is signed with the <B>same key</B> as the app already on the phone;
          otherwise you would have to uninstall first and lose the saved progress. Builds made on the Mac all share one key. The GitHub workflow{' '}
          <F>.github/workflows/android.yml</F> can also build the app, but on GitHub's computer the key is different, which is why app 1.7 was rebuilt on the Mac: it had to
          update the 1.5 already shared on Google Drive.
        </P>
        <Callout title="Build it like the live site">
          With paid courses on, the app must be built with <F>VITE_PAYWALL=on</F>, just like the live site, so its paid lessons are the same files that sit in private storage.
          A quick check: the app's <F>paid-manifest.json</F> should match the live one.
        </Callout>
        <P>
          The app icon (code-matrix cubes with "SHIVAM SONI" on stacked glass plaques) is drawn by a Swift script, <F>scripts/app-icon.swift</F>, which writes every icon size
          Android needs. The lesson "The shine that follows your tilt" explains the matching gleam on the welcome screen.
        </P>
      </>
    ),
    quiz: [
      {
        q: 'Which folder does Capacitor put inside the app?',
        options: ['src/', 'dist/', 'node_modules/', 'chat-worker/'],
        answer: 1,
        why: 'webDir is "dist", the built website.',
      },
      {
        q: 'You changed your job title on the site. What about the Android app?',
        options: ['It updates automatically', 'Rebuild with npm run apk and reinstall, because the site is bundled inside', 'Delete the app', 'Nothing can be done'],
        answer: 1,
        why: 'The APK contains a copy of the site from when it was built.',
      },
      {
        q: 'A new APK says "App not installed" over the old one. Which two things must match or rise?',
        options: ['The app name and icon', 'A higher versionCode, and the same signing key', 'The Android version and screen size', 'The Wi-Fi network'],
        answer: 1,
        why: 'Android accepts an update only from the same key and with a higher versionCode.',
      },
    ],
  },
  // ---------------------------------------------------------------- Learning Lab & Python
  {
    id: 'learning-lab',
    module: 'python-lab',
    title: 'How the Learning Lab is organised',
    minutes: 9,
    commits: ['e5f1b85', '1db9d8c'],
    goals: ['How one page holds several courses', 'How the address after # picks what to show', 'How progress is saved per course, and how old progress was kept'],
    body: () => (
      <>
        <P>
          The learning page started as one course (this one). To add Python, it became a <B>Learning Lab</B>: a landing page, a page listing courses, and inside every course its modules,
          lessons, exercises and quizzes. The trick is that the page code never mentions a specific course. It reads them all from one list.
        </P>
        <Code file="src/learn/courses.js" note="To add a third course, write its lessons and add one more entry to this list. The home page, menus and progress bars pick it up automatically.">{`
export const courses = [
  {
    id: 'site',
    title: 'Learn the Code',
    modules: siteModules,
    lessons: siteLessons,
    extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
  },
  pythonCourse,    // id: 'python', 6 modules, 22 lessons
];
export const lessonHash = (course, lesson) => \`#/c/\${course.id}/\${lesson.id}\`;`}</Code>
        <H>Addresses after the #</H>
        <P>
          The whole Lab is one HTML file. The part of the address after <F>#</F> (the "hash") decides what to show, and changing it does not reload the page. A small
          function, <F>parseHash</F>, turns the hash into a <Term id="state">state</Term> object that the app draws.
        </P>
        <RouteExplorer />
        <Code file="src/learn/LearnApp.jsx">{`
const parseHash = () => {
  const [view, a, b] = window.location.hash.replace(/^#\\/?/, '').split('/');
  if (view === 'c' && courseById[a]) { /* a course, or one of its lessons */ }
  // Links from before there were several courses: #/lesson/<id>
  if (view === 'lesson') { /* open that lesson in 'Learn the Code' */ }
  if (view === 'timeline' || view === 'glossary' || view === 'playground') return { view };
  if (view === 'courses') return { view: 'hub' };     // the course list
  return { view: 'landing' };                          // anything else: the landing page
};`}</Code>
        <H>Keeping your old progress</H>
        <P>
          Progress lives in <Term id="localstorage">localStorage</Term> under the key <F>learn-progress</F>. Before the Lab, a finished lesson was saved as just{' '}
          <F>big-picture</F>. With two courses, ids could clash, so keys now include the course: <F>site/big-picture</F>, <F>python/loops</F>. When the page loads it quietly
          renames old keys, so nothing you finished was lost.
        </P>
        <Code file="src/learn/LearnApp.jsx">{`
// Progress from the single-course version used bare lesson ids;
// those belong to "Learn the Code".
const withCourse = (obj = {}) => Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k.includes('/') ? k : \`site/\${k}\`, v]));`}</Code>
        <Callout title="A lesson completes itself">
          A lesson is marked done the moment every quiz answer is right <B>and</B> every coding exercise is solved. You can still tick or untick it yourself.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'What do you need to change to add a new course to the Lab?',
        options: ['Rewrite LearnApp.jsx', 'Write its lessons and add one entry to src/learn/courses.js', 'Create a new HTML page', 'Change the deploy workflow'],
        answer: 1,
        why: 'The pages are generic: they draw whatever courses the list contains.',
      },
      {
        q: 'Why are progress keys like "python/loops" instead of just "loops"?',
        options: ['It looks nicer', 'So two courses can have lessons with the same id without mixing up progress', 'GitHub requires it', 'It is faster'],
        answer: 1,
        why: 'Including the course id makes every key unique across courses.',
      },
    ],
  },
  {
    id: 'python-browser',
    module: 'python-lab',
    title: 'Running Python in the browser',
    minutes: 12,
    commits: ['1db9d8c'],
    goals: ['What Pyodide and WebAssembly are', 'Why Python runs in a web worker, and how messages flow', 'How Stop, the time limit and input() work'],
    body: () => (
      <>
        <P>
          Browsers only run <Term id="js">JavaScript</Term> and <Term id="wasm">WebAssembly</Term>. <Term id="pyodide">Pyodide</Term> is the real Python interpreter (the
          same C code you would install on a laptop) compiled to WebAssembly, plus Python's standard library. Nothing is sent to a server: your code runs on your device.
        </P>
        <H>Why a web worker?</H>
        <P>
          A page has one main thread that draws the screen and reacts to clicks. If Python ran there, a long or endless loop would freeze everything. So Python runs in a{' '}
          <Term id="webworker">web worker</Term>: a separate thread that can only talk to the page by sending messages. Try it:
        </P>
        <ThreadDemo />
        <H>The conversation between page and worker</H>
        <Steps
          title="What happens when you press Run"
          steps={[
            { label: 'Start', body: 'runtime.js creates the worker once and sends "init" with the address of the Python files. The worker loads Pyodide (about 12 MB the first time, cached after) and replies "ready".', code: "worker.postMessage({ type: 'init', indexURL })" },
            { label: 'Run', body: 'PyRunner sends your code, the Input box text and, for exercises, the tests. Only one program runs at a time; others wait in a queue.', code: "worker.postMessage({ type: 'run', id, code, stdin, tests })" },
            { label: 'Output', body: 'Every line Python prints is sent back straight away, so long programs show progress as they go.', code: "postMessage({ id, type: 'out', text })" },
            { label: 'Done', body: 'When the program ends the worker sends any error (type, message and line number) and the test results. The page shows them with a plain-English hint.', code: "postMessage({ id, type: 'done', error, results, ms })" },
          ]}
        />
        <H>Running your code safely</H>
        <P>Inside the worker, a few lines of Python wrap your code so every run starts fresh and errors come back as plain data:</P>
        <Code file="src/learn/python/worker.js (Python helpers)">{`
FILENAME = "<your code>"

def _exec(code, ns):
    try:
        exec(compile(code, FILENAME, "exec"), ns)   # ns = a brand-new namespace
        return None
    except BaseException as e:
        return _error(e)          # {"type", "message", "line", "text"}
    finally:
        sys.stdout.flush()        # show a last line printed with end=""

def _input(prompt=""):
    value = _real_input(prompt)   # reads the next line of the Input box
    print(value)                  # echo it, as a terminal would
    return value`}</Code>
        <H>Stop and the 15-second limit</H>
        <P>
          A worker cannot be interrupted politely in the middle of a loop, but it can be <B>terminated</B>. Stop throws the whole worker away and starts a fresh one; a
          timer does the same automatically after 15 seconds.
        </P>
        <Code file="src/learn/python/runtime.js">{`
export function stop(reason = 'stopped') {
  worker.terminate();          // kill the thread, endless loop and all
  worker = null;
  finish({ error: { type: reason === 'timeout' ? 'TimeoutError' : 'Stopped', ... } });
  start();                     // a fresh worker, ready for the next run
}`}</Code>
        <Callout title="Only the standard library">
          Pyodide can load extra packages like pandas, but each is many megabytes. The course sticks to Python's built-in library (math, statistics, csv, json, datetime…),
          which is already inside the 12 MB download.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why does Python run in a web worker instead of on the page?',
        options: ['Workers run Python faster', 'So a long or endless program cannot freeze the page', 'Browsers forbid WebAssembly on pages', 'To send code to a server'],
        answer: 1,
        why: 'The worker is a separate thread; the page keeps drawing and reacting while Python runs.',
      },
      {
        q: 'How does the Stop button end an endless loop?',
        options: ['It sends Python a KeyboardInterrupt', 'It terminates the worker and starts a new one', 'It reloads the page', 'It waits for the loop to finish'],
        answer: 1,
        why: 'worker.terminate() ends the thread immediately; a fresh worker replaces it.',
      },
      {
        q: 'Where does your Python code actually run?',
        options: ['On a GitHub server', 'On a Cloudflare Worker', 'In your own browser, on your device', 'On Anthropic\'s servers'],
        answer: 2,
        why: 'Pyodide is downloaded once and runs locally; no code leaves the device.',
      },
    ],
  },
  {
    id: 'python-tests',
    module: 'python-lab',
    title: 'How exercises are checked',
    minutes: 10,
    commits: ['1db9d8c'],
    goals: ['How an exercise is described as data', 'How tests use OUTPUT and SOURCE', 'How every solution and starter was verified before going live'],
    body: () => (
      <>
        <P>
          Every Python exercise is a plain object: what to ask, the starting code, the tests, a hint and a model solution. The tests are small pieces of Python with{' '}
          <F>assert</F>, run straight after your code in the same namespace, so they can call your functions and read your variables.
        </P>
        <Code file="src/learn/python/lessons-advanced.jsx (shortened)">{`
{
  id: 'bucket-fn',
  title: 'Bucket as a function',
  starter: py\`
def bucket(dpd):
    return "Current"
\`,
  tests: [
    { name: 'bucket(0) == "Current"',
      code: py\`assert bucket(0) == "Current", f"got {bucket(0)!r}"\` },
  ],
  hint: 'Use if / elif with return in each branch...',
  solution: py\`...\`,
}`}</Code>
        <P>
          The message after the comma in <F>assert</F> is what you see when a test fails, which is why each one says what it got. Try a tiny exercise built the same way:
        </P>
        <PyRunner
          title="Double it"
          code={'def double(x):\n    return x\n'}
          tests={[
            { name: 'double(2) == 4', code: 'assert double(2) == 4, f"got {double(2)!r}"' },
            { name: 'double(-3) == -6', code: 'assert double(-3) == -6, f"got {double(-3)!r}"' },
          ]}
          hint="Return x * 2."
          solution={'def double(x):\n    return x * 2\n'}
        />
        <H>OUTPUT and SOURCE</H>
        <P>
          Some exercises are about what you <B>print</B>, so the worker keeps everything printed in a variable called <F>OUTPUT</F> for the tests. A few re-run your code
          with other values, so the code itself is available as <F>SOURCE</F>.
        </P>
        <Code file="the DPD bucket test (lessons-beginner.jsx)" note="Your code sets dpd = 45. The test swaps that line for other values and runs your code again, so a hard-coded answer cannot pass.">{`
def bucket_for(value):
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()):     # hide the extra prints
        exec(re.sub(r"(?m)^dpd\\s*=.*$", f"dpd = {value}", SOURCE, count=1), ns)
    return ns.get("bucket")

expected = {0: "Current", 30: "1-30", 60: "31-60", 61: "61-90", 120: "90+"}
assert {v: bucket_for(v) for v in expected} == expected`}</Code>
        <H>Testing the tests</H>
        <P>Before anything went live, two checks ran on all 24 exercises:</P>
        <Steps
          title="How the course was verified"
          steps={[
            { label: 'In Python', body: 'A script pulled every exercise out of the lesson files and ran it in Python 3.13 (the same version as Pyodide): each model solution must pass every test, and each starter must fail at least one, so nobody passes without writing code. Result: 0 problems.' },
            { label: 'In a real browser', body: 'Playwright opened all 22 Python lessons with the real Pyodide, pressed Run on every example (only the one meant to show an error may fail), and for every exercise pressed Check on the starter (must fail), then Show solution and Check again (must pass). Result: 0 problems, no console errors.' },
            { label: 'The details', body: 'The same run checked Stop on an endless loop, input() with the Input box, code surviving a reload, a lesson completing itself, old links and old progress, and that a 390px-wide phone screen never scrolls sideways.' },
          ]}
        />
      </>
    ),
    quiz: [
      {
        q: 'When does a test fail?',
        options: ['When it prints something', 'When its assert condition is False or the code raises an error', 'When it takes more than 1 ms', 'Never'],
        answer: 1,
        why: 'assert raises AssertionError on False; any other error also fails the test.',
      },
      {
        q: 'Why must every starter fail at least one test?',
        options: ['To make exercises harder', 'So the exercise cannot be "passed" without writing any code', 'Because Python requires it', 'To save time'],
        answer: 1,
        why: 'If the starting code already passed, the exercise would teach nothing.',
      },
    ],
  },
  {
    id: 'python-deploy',
    module: 'python-lab',
    title: 'Shipping Python with the site',
    minutes: 9,
    commits: ['1db9d8c'],
    goals: ['Why Python is hosted on your own site instead of a CDN', 'What scripts/copy-pyodide.mjs does and when it runs', 'How the deploy includes it, and what visitors download'],
    body: () => (
      <>
        <P>
          The usual way to use Pyodide is to load it from a <Term id="cdn">CDN</Term> (a public file server). While building the course, the CDN turned out to be blocked
          from the build machine. Instead of fighting that, Python is now <B>served from your own site</B>, which has real advantages: no third-party server to trust or go
          down, and it works offline in the Android app.
        </P>
        <H>Copying Python into the site</H>
        <P>
          Pyodide is installed as an ordinary <Term id="npm">npm</Term> package. A small script copies the five files the browser needs from <F>node_modules</F> into{' '}
          <F>public/pyodide/</F>, and Vite copies <F>public/</F> into <F>dist/</F> as-is.
        </P>
        <Code file="scripts/copy-pyodide.mjs">{`
const from = '../node_modules/pyodide/';
const to = '../public/pyodide/';
const files = ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm',
               'python_stdlib.zip', 'pyodide-lock.json'];
for (const f of files) cpSync(from + f, to + f);`}</Code>
        <Code file="package.json" note='npm automatically runs a script called "prebuild" before "build" (and "predev" before "dev"), so nobody has to remember the copy step, including GitHub Actions.'>{`
"scripts": {
  "predev": "node scripts/copy-pyodide.mjs",
  "dev": "vite",
  "prebuild": "node scripts/copy-pyodide.mjs",
  "build": "vite build",
}`}</Code>
        <H>Adding pandas, NumPy, SQLite and Matplotlib</H>
        <P>
          The data courses need packages that are not in the npm download. The same script works out everything they depend on from Pyodide's own list (
          <F>pyodide-lock.json</F>), downloads each file once into <F>node_modules/.cache</F>, and refuses any file whose fingerprint (SHA-256) does not match the list.
          After that it copies from the cache, so builds stay quick.
        </P>
        <Code file="scripts/copy-pyodide.mjs (packages)">{`
const COURSE_PACKAGES = ['pandas', 'sqlite3', 'matplotlib'];
// pandas needs numpy, python-dateutil, pytz, six…: 14 packages in all
for (const name of needed) {
  const { file_name: file, sha256: expected } = lock[name];
  if (!cached || sha256(cached) !== expected) {
    const buf = await download(\`https://cdn.jsdelivr.net/pyodide/v\${version}/full/\${file}\`);
    if (sha256(buf) !== expected) throw new Error(\`Checksum mismatch for \${file}\`);
  }
  cpSync(cached, to + file);
}`}</Code>
        <P>
          In the worker, Python scans each program's <F>import</F> lines and loads only what it needs, the first time it is needed: a program without{' '}
          <F>import pandas</F> never downloads pandas.
        </P>
        <Callout title="Why public/pyodide/ is in .gitignore">
          The files (about 30 MB with the packages) can always be rebuilt, so they are not stored in Git. The exact versions are pinned by <F>package-lock.json</F> and
          the checksums in <F>pyodide-lock.json</F>.
        </Callout>
        <H>Finding the files at run time</H>
        <P>
          The site lives in a sub-folder on GitHub Pages, so the worker is told where Python is relative to the page itself, not to the domain. This works locally, on
          GitHub Pages and inside the Android app without any change.
        </P>
        <Code file="src/learn/python/runtime.js">{`
// pyodide/ sits next to learn.html (copied there by scripts/copy-pyodide.mjs)
worker.postMessage({ type: 'init', indexURL: new URL('pyodide/', document.baseURI).href });`}</Code>
        <H>The deploy, step by step</H>
        <Steps
          title="From merge to live Python"
          steps={[
            { label: 'Merge', body: 'Pull request #26 was merged into main, which starts the "Deploy to GitHub Pages" workflow.' },
            { label: 'npm ci', body: 'GitHub installs the exact versions in package-lock.json, including pyodide 0.29.5 and the CodeMirror editor.' },
            { label: 'prebuild', body: 'npm runs scripts/copy-pyodide.mjs first, copying Python into public/pyodide/.', code: 'Copied Pyodide 0.29.5 → public/pyodide/' },
            { label: 'vite build', body: 'Vite builds the site. The Learning Lab, the Python worker and the code editor become separate files, and public/pyodide/ is copied into dist/pyodide/.' },
            { label: 'Live', body: 'dist/ is uploaded to GitHub Pages. Run #18 finished with success in about 40 seconds.' },
          ]}
        />
        <H>What visitors download</H>
        <Code file="sizes (approximate)" note="Visiting the portfolio downloads none of this. Python files load only when someone opens a Python lesson or the Playground, and the browser caches them.">{`
learn page (all lessons)      245 KB   when you open learn.html
code editor (CodeMirror)      466 KB   when the first code box appears
Python worker                   3 KB   on the first Run
pyodide.asm.wasm              8.3 MB   the Python interpreter
python_stdlib.zip             2.4 MB   the standard library
pyodide.asm.js + others       1.2 MB
pandas + NumPy + helpers      8.5 MB   only when code imports pandas or numpy
sqlite3                       0.6 MB   only when code imports sqlite3
Matplotlib + its parts        9.1 MB   only when code imports matplotlib`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'When does scripts/copy-pyodide.mjs run?',
        options: ['Only when you run it by hand', 'Automatically before npm run dev and npm run build', 'When a visitor opens the page', 'Once a day on GitHub'],
        answer: 1,
        why: 'npm runs "predev" and "prebuild" scripts automatically before "dev" and "build".',
      },
      {
        q: 'Why are the Python files not committed to Git?',
        options: ['They are secret', 'They are large and can be rebuilt from node_modules at any time', 'GitHub forbids WebAssembly', 'They change every day'],
        answer: 1,
        why: 'package-lock.json pins the version, and the copy step recreates them on every build.',
      },
      {
        q: 'Does visiting the portfolio home page download Python?',
        options: ['Yes, always', 'No: Python loads only when a Python lesson or the Playground is opened', 'Only on phones', 'Only in dark mode'],
        answer: 1,
        why: 'The Python files are fetched by the worker, which starts only when needed.',
      },
    ],
  },

  // ---------------------------------------------------------------- Accounts & payments
  {
    id: 'accounts',
    module: 'accounts',
    title: 'Accounts and synced progress',
    minutes: 10,
    commits: ['1c66864', '40d5d32', 'c22669d'],
    goals: ['What Supabase does for the Lab', 'How row-level security keeps each learner\'s data private', 'How progress follows you between devices'],
    body: () => (
      <>
        <P>
          GitHub Pages can only serve files; it cannot remember who you are. Accounts come from <Term id="supabase">Supabase</Term>, a hosted database with sign-in built in.
          The website talks to it directly from the browser with a <B>public</B> key, which is safe because the database itself decides what each person may see.
        </P>
        <H>Three tables</H>
        <Code file="supabase/schema.sql (shortened)">{`
products   (id, title, price_paise, active)        -- 'python', 'pandas', … and 'all'
purchases  (user_id, product_id, amount_paise, status, razorpay_order_id, …)
progress   (user_id, data jsonb, updated_at)       -- your finished lessons and answers`}</Code>
        <H>Row-level security: the database guards itself</H>
        <P>
          Every table has <Term id="rls">row-level security</Term> switched on. A <B>policy</B> is a rule the database checks on every single read or write, using the
          signed-in person's id from their <Term id="token">access token</Term>.
        </P>
        <Code file="supabase/schema.sql">{`
-- anyone may read active prices
create policy "products are public" on products for select using (active);

-- you can read only your own purchases, and nobody can write them from the browser
create policy "read own purchases" on purchases for select to authenticated
  using (user_id = (select auth.uid()));

-- your progress row is yours alone, to read and write
create policy "own progress" on progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));`}</Code>
        <Callout tone="warn" title="Why purchases have no write policy">
          If the browser could insert a purchase, anyone could unlock a course from the console. Only the payment functions on the server, holding the{' '}
          <B>secret</B> key, can mark a purchase as paid (next lessons).
        </Callout>
        <H>Signing in without slowing anyone down</H>
        <Steps
          title="What happens when the Lab opens"
          steps={[
            { label: 'No account yet', body: 'If this browser has never signed in, the Supabase library is not downloaded at all. Free lessons open as fast as before.' },
            { label: 'Signed in before', body: 'A saved session is found, so the library loads in the background and checks it.', code: "import('./client')   // only now" },
            { label: 'Email links', body: 'Confirm-sign-up and reset-password emails come back to learn.html with a one-time token, which the page exchanges for a session. In the Android app, links point to shivam-soni.com, because a phone cannot open the app\'s internal https://localhost address from an email.' },
            { label: 'Back to learning', body: 'After signing in you return to the lesson you came from, not the account page.' },
          ]}
        />
        <H>Progress on every device</H>
        <P>
          Progress is still saved in <Term id="localstorage">localStorage</Term> first, so it works offline and without an account. Once you sign in, the browser's progress and
          the account's progress are <B>merged</B> (a lesson done on either device stays done), and every change is saved to the account a moment and a half after it happens.
        </P>
        <Code file="src/learn/LearnApp.jsx">{`
function mergeProgress(local, remote = {}) {
  return {
    done:   { ...remote.done,   ...onlyTrue(local.done) },   // done anywhere = done
    solved: { ...remote.solved, ...local.solved },
    answers: /* local answers win, remote ones are kept */,
  };
}
// afterwards: save 1.5 s after the last change (debounced)
setTimeout(() => saveRemoteProgress({ lessons: progress, kb }), 1500);`}</Code>
      </>
    ),
    quiz: [
      {
        q: 'The Supabase key in the website is public. Why can nobody read other learners\' purchases with it?',
        options: ['The key is encrypted', 'Row-level security policies only return rows whose user_id matches the signed-in person', 'GitHub hides it', 'Purchases are stored on the phone'],
        answer: 1,
        why: 'The database checks the policy on every query, whatever key is used.',
      },
      {
        q: 'Why is the Supabase library not loaded for a first-time visitor?',
        options: ['It is paid', 'They have no session, so there is nothing to check; free lessons stay fast', 'It does not work on phones', 'It is loaded from the Android app'],
        answer: 1,
        why: 'It loads only when a saved session or an email link exists, or the account page is opened.',
      },
      {
        q: 'You finished a lesson on your phone and a different one on your laptop. After signing in on both?',
        options: ['Only the phone\'s counts', 'Only the laptop\'s counts', 'Both are done: progress is merged', 'Both are reset'],
        answer: 2,
        why: 'mergeProgress keeps everything marked done on either side.',
      },
    ],
  },
  {
    id: 'paywall',
    module: 'accounts',
    title: 'Free and paid lessons',
    minutes: 11,
    commits: ['960d631', '5258fec', '1c66864'],
    goals: ['Which lessons are free', 'How the build splits paid lessons into separate files', 'How only owners can download them'],
    body: () => (
      <>
        <P>
          This course is free from start to finish, and so is the first module of every other course. A lock on a button is not enough on its own: anyone can open the
          browser's developer tools. So paid lessons are <B>not on the public website at all</B>.
        </P>
        <Code file="src/learn/paywall.config.js">{`
export const FREE_COURSES = ['site'];          // "Learn the Code" is always free

export const isLessonFree = (course, lesson) =>
  FREE_COURSES.includes(course.id) || lesson.module === course.modules[0].id;`}</Code>
        <Steps
          title="How a paid lesson leaves the public site"
          steps={[
            { label: 'One file per course', body: 'Each course keeps all its lessons in one file, so writing them stays easy.' },
            { label: 'Split while building', body: 'A small Vite plugin (scripts/vite-lesson-parts.mjs) serves each course file twice: ?part=free keeps only the free lessons, ?part=paid only the paid ones. Vite then builds the paid part into its own files.', code: "import course from './course.jsx?part=paid'" },
            { label: 'Move them out', body: 'After the build, scripts/split-paid.mjs follows the build manifest from every page, finds the files that only paid lessons need, moves them to dist-paid/ and writes a small paid-manifest.json listing them.' },
            { label: 'Private storage', body: 'During deploy, scripts/upload-paid.mjs uploads dist-paid/ to a private Supabase storage bucket, paid-lessons, then the public site is published without them.' },
            { label: 'Download for owners', body: 'When an owner opens a paid lesson, the Lab downloads the file with their access token, and runs it in the page like any other part of the site.' },
          ]}
        />
        <H>The storage bucket checks ownership</H>
        <Code file="supabase/schema.sql">{`
-- does the signed-in learner own this course (or the all-access pass)?
create function owns(course text) returns boolean as $$
  select exists (select 1 from purchases
    where user_id = auth.uid() and status = 'paid'
      and (product_id = course or product_id = 'all'));
$$;

-- files live at paid-lessons/<course>/<file>.js
create policy "owners read paid lessons" on storage.objects for select to authenticated
  using (bucket_id = 'paid-lessons' and owns(split_part(name, '/', 1)));`}</Code>
        <Code file="src/learn/access.js (simplified)">{`
const res = await fetch(PAID_BASE + course + '/' + file, {
  headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken },
});
if ([400, 401, 403, 404].includes(res.status)) throw new LockedError(course);
// point its imports at the public React, editor… files, then run it
return import(URL.createObjectURL(new Blob([text], { type: 'text/javascript' })));`}</Code>
        <Callout title="Testing it locally">
          Without <F>VITE_PAYWALL=on</F> everything is free and paid lessons load like normal files, which keeps everyday development simple.{' '}
          <F>VITE_PAYWALL_TEST_OWNED=react</F> pretends this browser owns a course, to test the unlocked view.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why are paid lessons removed from the public site instead of just hidden behind a lock?',
        options: ['To make the site smaller', 'Anything published can be downloaded by anyone; a lock in the page can be bypassed', 'GitHub Pages forbids it', 'For SEO'],
        answer: 1,
        why: 'Only files that are never published, and are handed out by the server to owners, are truly protected.',
      },
      {
        q: 'Who decides whether a learner may download python/lessons-abc123.js?',
        options: ['The lesson page', 'The storage policy, which calls owns(\'python\') with the learner\'s token', 'GitHub', 'The Android app'],
        answer: 1,
        why: 'The first folder of the file path is the course id, checked by owns() on every download.',
      },
      {
        q: 'What does paid-manifest.json contain?',
        options: ['Prices', 'Which paid file to request for each course', 'Learners\' emails', 'The secret key'],
        answer: 1,
        why: 'It lists file names only; the files themselves sit in private storage.',
      },
    ],
  },
  {
    id: 'payments',
    module: 'accounts',
    title: 'Taking payments with Razorpay',
    minutes: 12,
    commits: ['9382ad2', 'a0fc707', '8f04521', 'bb1e78e', '5ae85a8'],
    goals: ['Why the price and the secret key stay on the server', 'How a payment is proved genuine with a signature', 'The webhook safety net and the owner dashboard'],
    body: () => (
      <>
        <P>
          <Term id="razorpay">Razorpay</Term> takes the money. Three small server programs, <Term id="edgefunction">Edge Functions</Term> running on Supabase, sit between the
          page and Razorpay. They hold the secret keys, which must never reach a browser.
        </P>
        <Steps
          title="Buying a course"
          steps={[
            { label: 'create-order', body: 'The page sends only the course id. The function checks who you are, reads the price from the products table (never from the browser), refuses if you already own it, asks Razorpay for an order and records a "created" purchase.', code: "POST /functions/v1/create-order  { product: 'python' }" },
            { label: 'Payment window', body: 'Razorpay\'s own window opens with that order. Card, UPI and bank details go to Razorpay only; this site never sees them.' },
            { label: 'verify-payment', body: 'Razorpay hands the page an order id, a payment id and a signature. The function checks the signature, checks the order is yours, asks Razorpay what really happened (capturing the payment if needed), and only then marks the purchase paid.' },
            { label: 'Unlocked', body: 'The page re-reads your purchases, paid lessons become available, and a thank-you message appears.' },
          ]}
        />
        <H>The signature: proof that Razorpay sent it</H>
        <P>
          Anyone could send made-up payment ids to verify-payment. The <Term id="hmac">HMAC</Term> signature stops that: Razorpay mixes the order id and payment id with the{' '}
          <B>secret key</B>, which only Razorpay and the function know. If our own calculation gives the same result, the message is genuine.
        </P>
        <Code file="supabase/functions/verify-payment/index.ts">{`
const expected = await hmacHex(KEY_SECRET, orderId + '|' + paymentId);
if (!safeEqual(expected, signature)) return json(400, { error: 'signature mismatch' });

// then: is the order this learner's? does Razorpay agree on the amount and status?
if (payment.order_id !== orderId || payment.amount !== purchase.amount_paise) return json(400, …);
if (payment.status === 'authorized') payment = await capture(payment);
if (payment.status !== 'captured') return json(400, …);
// only now: status = 'paid'`}</Code>
        <Callout title="safeEqual, not ===">
          A normal comparison stops at the first different character, so how long it takes leaks how much of a guess was right. <F>safeEqual</F> always checks every
          character.
        </Callout>
        <H>The webhook: a safety net</H>
        <P>
          If you close the tab right after paying, verify-payment never runs. So Razorpay also calls a <Term id="webhook">webhook</Term>, <F>razorpay-webhook</F>, from its own
          servers when a payment is captured. It checks its own signature over the exact bytes received and marks the purchase paid. If saving fails it answers 500, and
          Razorpay simply tries again later.
        </P>
        <H>Lessons from setting it up</H>
        <P>
          The functions name missing settings without ever printing their values, strip stray spaces and quotes that sneak in when keys are pasted, and check the key id
          really starts with <F>rzp_test_</F> or <F>rzp_live_</F>, so a swapped id and secret is caught with a clear message.
        </P>
        <Callout title="The owner dashboard">
          A private admin page (<F>#/admin</F>) lists sales, accounts and course progress, refunds a payment through Razorpay, and can grant a course for free. The page shows
          nothing to anyone else, and the <F>admin</F> function checks the <F>admins</F> table again on every request, because hiding a page is never real security.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why does create-order read the price from the database instead of the page?',
        options: ['It is faster', 'A price sent by the browser could be changed to ₹1 by anyone', 'Razorpay requires it', 'To support discounts'],
        answer: 1,
        why: 'Anything coming from the browser can be edited. The server decides the amount.',
      },
      {
        q: 'What does the HMAC signature prove?',
        options: ['That the card is valid', 'That the order and payment ids came from Razorpay, who knows the secret key', 'That the learner is signed in', 'That the price is right'],
        answer: 1,
        why: 'Only someone with the secret can produce a matching signature.',
      },
      {
        q: 'A learner pays and immediately closes the tab. What unlocks the course?',
        options: ['Nothing; they must pay again', 'The razorpay-webhook function, which Razorpay calls server-to-server', 'The Android app', 'An email'],
        answer: 1,
        why: 'The webhook is the safety net for exactly this case.',
      },
    ],
  },
  {
    id: 'checkout-guard',
    module: 'accounts',
    title: 'A checkout that never gets stuck',
    minutes: 9,
    commits: ['d3335df'],
    goals: ['Why the page froze when "Unlock" was pressed', 'How time limits keep every step from waiting forever', 'How the page is put back if the payment window cannot open'],
    body: () => (
      <>
        <P>
          A learner pressed <B>Unlock</B> and the whole page froze. The cause was outside our code: Razorpay's script could not open its window (for example while the website
          is waiting for approval in the Razorpay account), so it showed a browser <F>alert()</F>, which blocks everything, and left the page with scrolling switched off and
          an invisible window on top. The fix makes every step of checkout <B>give up cleanly</B>.
        </P>
        <H>Rule 1: every wait has a time limit</H>
        <Code file="src/learn/account/checkout.js">{`
const SCRIPT_TIMEOUT_MS = 20000;   // loading Razorpay's script
const ORDER_TIMEOUT_MS  = 25000;   // creating the order
const VERIFY_TIMEOUT_MS = 60000;   // checking a finished payment: money has moved, wait longer
const WINDOW_TIMEOUT_MS = 15000;   // Razorpay's window appearing after open()

fetch(url, { …, signal: AbortSignal.timeout(timeoutMs) });   // the request is cancelled after the limit`}</Code>
        <P>
          <Term id="timeout">AbortSignal.timeout</Term> cancels a request that takes too long, and the learner sees a plain message instead of a spinner that never stops. A{' '}
          <F>busy</F> flag also stops a second click from starting a second payment.
        </P>
        <H>Rule 2: check that the window really opened</H>
        <Steps
          title="Opening the payment window safely"
          steps={[
            { label: 'Remember the page', body: 'Before opening, the page notes its scroll settings and temporarily catches alert() calls, so Razorpay cannot freeze the page with one.' },
            { label: 'Open and watch', body: 'Every quarter of a second the page checks whether Razorpay\'s window is actually on screen with a size.', code: "document.querySelectorAll('.razorpay-container')" },
            { label: 'It appeared', body: 'Normal alerts are given back to Razorpay, and the payment carries on as usual.' },
            { label: 'It did not', body: 'If Razorpay raised an alert, or nothing appeared within 15 seconds: close Razorpay, remove its invisible window, restore scrolling, and say "The payment window could not open … You have not been charged."' },
          ]}
        />
        <H>Rule 3: say exactly where the money is</H>
        <P>
          Every message says whether you have been charged. If the payment went through but checking it failed, the message gives the payment reference and says the course will
          unlock shortly, because the webhook from the last lesson will still mark it paid.
        </P>
        <Callout tone="warn" title="What this fix cannot do">
          It stops the page getting stuck; it cannot make Razorpay open. When the window refuses, the real fix is in the Razorpay account: the website must be approved under
          "Website and app details", and live mode switched on. Inside the Android app, Razorpay's alert comes from its own frame and cannot be caught, but pressing OK now
          leaves the page usable.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why did the page freeze when the payment window could not open?',
        options: ['The internet was down', 'Razorpay showed a blocking alert() and left scrolling locked with an invisible window on top', 'React crashed', 'The course was already owned'],
        answer: 1,
        why: 'alert() blocks the whole page, and the leftovers kept it unusable afterwards.',
      },
      {
        q: 'Why does verifying a payment get a longer time limit (60 s) than creating an order (25 s)?',
        options: ['It is a bigger request', 'Money has already moved, so it is worth waiting longer before giving up', 'Razorpay is slower at night', 'No reason'],
        answer: 1,
        why: 'Giving up early would leave a paid learner confused; patience is worth more there.',
      },
      {
        q: 'What does AbortSignal.timeout(25000) do to a fetch?',
        options: ['Retries it 25 times', 'Cancels it if no answer arrives within 25 seconds', 'Delays it by 25 seconds', 'Caches it for 25 seconds'],
        answer: 1,
        why: 'The request is aborted and throws a TimeoutError, which the code turns into a friendly message.',
      },
    ],
  },
];

export const lessonById = Object.fromEntries(lessons.map((l) => [l.id, l]));
