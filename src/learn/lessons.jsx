import { Callout, Code, Term } from './ui';
import { ComponentTree, DataToUI, MotionPlayground, PropsPlayground, StateCalculator, Steps, ThemeDecider, TokenEditor } from './widgets/basics';
import { BlurVsGradient, BreakpointPreview, ChunkTimeline, DecodeDemo, DeviceInspector, MaskDemo, MatrixMini, StorageInspector } from './widgets/effects';
import { ChatFlow, MaskPhone, ZTestStepper } from './widgets/features';

// Every lesson explains one part of how the portfolio was built, with the real code, a playground and a quiz.
// `commits` link a lesson to the changes in the timeline (src/learn/timeline.js).

export const modules = [
  { id: 'foundations', title: 'Foundations', blurb: 'How the site is put together: React, components, state and data files.' },
  { id: 'look', title: 'Look & feel', blurb: 'Styling with Tailwind, light and dark themes, and animations.' },
  { id: 'effects', title: 'The effects', blurb: 'The code matrix, cursor trail, welcome screen and water reveal.' },
  { id: 'speed', title: 'Speed & devices', blurb: 'Making it fast on phones and laying it out for every screen.' },
  { id: 'features', title: 'Features', blurb: 'The Analytical Lab maths, contact pop-up, resume and AI chat.' },
  { id: 'shipping', title: 'Shipping it', blurb: 'Git, automatic deploys to GitHub Pages, and the Android app.' },
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
    minutes: 9,
    commits: ['d1fd86a', 'e123564'],
    goals: ['Commits and branches in plain words', 'What the deploy workflow does, step by step', 'How a change reaches the live site'],
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
            { label: 'Pages serves', body: 'The dist/ folder is uploaded and published at shivam1411-oss.github.io/Shivam_Portfolio. Usually live within a couple of minutes.' },
          ]}
        />
        <Code file=".github/workflows/deploy.yml">{`
on:
  push:
    branches: [main]        # run on every push to main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4        # get the code
      - uses: actions/setup-node@v4      # install Node 22
      - run: npm ci                      # install exact dependencies
      - run: npm run build               # create dist/
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    steps:
      - uses: actions/deploy-pages@v4    # publish`}</Code>
        <Callout title="Why vite.config.js sets base: './'">
          Your site lives in a sub-folder (<F>/Shivam_Portfolio/</F>), not at the domain root. Relative paths make the built files work wherever they are hosted.
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
    minutes: 6,
    commits: ['1917bba'],
    goals: ['How Capacitor turns the website into an app', 'What npm run apk does', 'Why you rebuild the app after site changes'],
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
        <P>
          The app icon (code-matrix cubes spelling "SHIVAM SONI") is drawn by a Swift script, <F>scripts/app-icon.swift</F>, which writes every icon size Android needs.
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
    ],
  },
];

export const lessonById = Object.fromEntries(lessons.map((l) => [l.id, l]));
