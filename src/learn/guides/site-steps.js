// Step-by-step material for the "Learn the Code" lessons, attached in content/site.js (see withGuide).
// Same shape as python-steps.js (terms, process, steps). This course has no code box: its steps are done in
// the playground each lesson already has, or by looking at the live site, so `stepsIntro` replaces the usual
// opening sentence. Every step names the control to use and what the learner should then see.

const PLAY = 'These steps use the playground higher up this page. Scroll up to it, do one step at a time, and tick each step when what you see matches.';
const CLICK = 'These steps use the click-through diagram higher up this page and the live site. Do one at a time, and tick each step when what you see matches.';
const withIntro = (stepsIntro, lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { stepsIntro, ...l }]));

export const siteSteps = withIntro(PLAY, {
  // ---------------------------------------------------------------- Foundations
  'big-picture': {
    stepsIntro: CLICK,
    terms: ['html', 'css', 'js', 'react', 'vite', 'npm', 'bundle'],
    process: {
      title: 'How source files become a website',
      stages: [
        ['You write small source files', 'Components, data and styles live in src/, each file doing one job.'],
        ['npm install fetches the libraries', 'React, Motion and the rest are downloaded into node_modules/.'],
        ['vite build combines everything', 'Hundreds of files are checked, joined and shrunk.'],
        ['The result lands in dist/', 'A few optimised files: this folder is the real website.'],
        ['dist/ is published', 'Visitors download those files, never your source.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram called "What happens when you run npm run build". Press the button "1. You write code".', see: 'A short explanation of what you write: components, data and styles in src/.' },
      { do: 'Press "Next step" to move to "2. npm install".', see: 'What npm install does, with the command shown in a dark box.' },
      { do: 'Press "Next step" twice more, reading each stage, until you reach "4. dist/".', see: 'An explanation that dist/ holds the few files visitors actually download.' },
      { do: 'Press "Next step" once more to reach "5. Published". The "Next step" button is now greyed out.', see: 'How the dist/ folder reaches the live site.' },
      { do: 'Now look at the real thing: open shivam-soni.com in a new tab, right-click the page and choose "View page source" (on a phone, skip this step).', see: 'A very short page: a nearly empty HTML file with one <div id="root"> and a script. React fills in everything else.' },
    ],
  },
  components: {
    terms: ['component', 'props', 'jsx', 'react', 'render'],
    process: {
      title: 'How a page is drawn from components',
      stages: [
        ['React starts at the top', 'It calls the App component.'],
        ['App returns other components', 'Such as <Site />, which returns <Navbar />, <Hero />, and so on.'],
        ['React calls each of those', 'Working down the tree until only plain tags (div, h1, button) are left.'],
        ['Props travel down', 'A parent passes values and functions to its children as props.'],
        ['The finished tree is put on screen', 'Each component drew only its own part.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Explore your site\'s component tree". Click <App /> at the top of the tree.', see: 'On the right: the file src/App.jsx and what App does (it shows the welcome screen, then the Site).' },
      { do: 'Click <Site />.', see: 'src/Site.jsx. Its description says it holds two pieces of state and passes "open" and "close" functions down as props.' },
      { do: 'Click <Navbar />, which is indented under Site.', see: 'src/components/Navbar.jsx. It receives onConnect and onResume as props from Site.' },
      { do: 'Now scroll to the playground "Change the props, watch the component update". Click in the title box and change the text to anything you like.', see: 'The card on the right shows your new title at once, and the code box shows the new value of title="…".' },
      { do: 'Untick the accent checkbox.', see: 'The card changes its look, and the code box now reads accent={false}. Same component, different props.' },
    ],
  },
  state: {
    terms: ['state', 'hook', 'render', 'effect', 'component'],
    process: {
      title: 'What happens when you drag a slider',
      stages: [
        ['The slider calls a setter', 'setValues stores the new number.'],
        ['React remembers the new state', 'It replaces the old value.'],
        ['React re-runs the component', 'The whole function runs again with the new state.'],
        ['Everything is recalculated', 'The collection-efficiency result is worked out afresh from the state.'],
        ['The screen is updated', 'Only the parts that changed are redrawn.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "State in action: the CEI calculator". Before touching anything, read the result.', see: 'Collection efficiency 64.9%, and a line saying how many times the component has rendered.' },
      { do: 'Drag the "Closing receivables" slider a little to the left.', see: 'The percentage goes up, the formula line shows the new number, and the render counter increases.' },
      { do: 'Look at the dark box labelled // current state while you move any slider.', see: 'The value of the matching name (open, billed, close or current) changes as you drag. That object is the state.' },
      { do: 'Drag "Closing receivables" all the way to the right (200).', see: 'Collection efficiency drops to 0.0%: more was left unpaid than could have been collected.' },
    ],
  },
  data: {
    terms: ['component', 'props', 'list', 'loop'],
    process: {
      title: 'How content gets from a data file to the page',
      stages: [
        ['Content is written in a data file', 'src/data/content.js holds lists of plain objects: period, title, company, points.'],
        ['A component imports the list', 'The Experience component reads it.'],
        ['It loops over the list', '.map() runs once for each entry.'],
        ['Each entry becomes a block of the page', 'The same layout is filled in with that entry\'s values.'],
        ['To change content, edit the data', 'The layout code is never touched.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Edit the data, not the design". On the left is one entry; on the right is how it is drawn. Click the title box and change Manager, Repayments to Senior Manager.', see: 'The heading in the preview on the right changes to Senior Manager.' },
      { do: 'Change the period box to 2023 – 2026.', see: 'The date line in the preview changes to match.' },
      { do: 'Change the points[0] box to any sentence of your own.', see: 'The bullet point in the preview shows your sentence. You changed content without touching any layout.' },
    ],
  },

  // ---------------------------------------------------------------- Look & feel
  styling: {
    terms: ['tailwind', 'css', 'cssvar'],
    process: {
      title: 'How one class recolours the whole site',
      stages: [
        ['Colours are stored as CSS variables', '--bg, --fg, --accent and a few more, defined once.'],
        ['Tailwind classes use the variables', 'bg-surface means "use the value of --surface".'],
        ['Every element points at a variable, not a colour', 'Nothing has a fixed colour written into it.'],
        ['The .dark class gives the variables new values', 'Same names, different colours.'],
        ['Everything changes together', 'Because every element looks up the variable again.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Repaint the site by changing six variables". Press the ".dark" preset.', see: 'The preview turns dark, and the code box now starts with .dark { and lists six new colour values.' },
      { do: 'Press ":root (light)" to go back.', see: 'The preview returns to the light colours.' },
      { do: 'Click the colour square next to --accent and pick a strong red.', see: 'The word Impact, half of the gradient on "strategy", and the "Let\'s connect" button all turn red together.' },
      { do: 'Click the colour square next to --bg and pick a pale yellow.', see: 'The preview\'s background changes, and so does the text on the button, because the button uses --bg for its text.' },
    ],
  },
  themes: {
    terms: ['localstorage', 'mediaquery', 'viewtransition', 'cssvar'],
    process: {
      title: 'How the theme is chosen before the page appears',
      stages: [
        ['A tiny script runs first', 'It sits in the <head>, before React and before anything is drawn.'],
        ['It looks for a saved choice', 'localStorage.getItem("theme")'],
        ['A saved choice wins', 'If you picked a theme before, that one is used.'],
        ['Otherwise the device decides', 'The script asks whether the phone or laptop prefers dark.'],
        ['The class is set on <html>', 'So the very first paint already has the right colours.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Which theme will a visitor see?". Set "Saved in localStorage" to nothing and "Device setting" to dark.', see: 'Result: dark. The highlighted line is the one that follows the device.' },
      { do: 'Change "Device setting" to light.', see: 'Result: light. With nothing saved, the device decides.' },
      { do: 'Set "Saved in localStorage" to dark, leaving the device on light.', see: 'Result: dark. The highlighted line is now the one that uses the saved choice: saved beats device.' },
      { do: 'Press the real theme toggle at the bottom of the playground.', see: 'This whole page switches theme, and the sentence beside the toggle names the new one.' },
      { do: 'Reload the page.', see: 'The page comes back in the theme you just chose, with no flash of the other one.' },
    ],
  },
  readable: {
    terms: ['textshadow', 'cssvar', 'canvas'],
    process: {
      title: 'How the halo keeps words readable',
      stages: [
        ['Moving code is drawn behind the page', 'On canvases that sit under all the text.'],
        ['One rule gives all text a soft shadow', 'Set once on main and footer; every line inside inherits it.'],
        ['The shadow is the page\'s own colour', 'So it quietly erases the code just around each letter.'],
        ['Solid backgrounds switch it off', 'Cards, buttons and dark panels have nothing showing through, so they need no halo.'],
        ['The wrong rule causes gloss', 'A white halo left on white text over a dark panel looks like a glow.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "The text halo". Set Theme to light, Halo to "No halo" and Where to "On the page".', see: 'The heading sits directly on the code behind it, and the two blur together. The box under it reads text-shadow: none.' },
      { do: 'Change Halo to "Halo".', see: 'A soft clear space appears around the letters, and the text-shadow box now shows three layers in the page colour.' },
      { do: 'Change Theme to dark.', see: 'The halo colour in the box changes to a near-black: it always follows the page colour.' },
      { do: 'Set Theme back to light, Where to "On a dark panel" and Halo to "Halo, old rule".', see: 'White text on a dark panel with a white glow around it: the glossy bug.' },
      { do: 'Change Halo back to "Halo".', see: 'The glow is gone and the box reads text-shadow: none. On a solid panel the halo is switched off.' },
    ],
  },
  animation: {
    terms: ['motion', 'reducedmotion', 'component'],
    process: {
      title: 'How an entrance animation plays',
      stages: [
        ['You describe the start', 'hidden: invisible and a little lower (opacity 0, y 16).'],
        ['You describe the end', 'show: visible and in place (opacity 1, y 0).'],
        ['Motion fills in the frames between', 'Over the duration, following the easing curve.'],
        ['A parent staggers its children', 'Each card starts a fraction of a second after the one before.'],
        ['Reduced motion skips it', 'Visitors who ask for less motion see the end state straight away.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Tune the entrance animation". Press Replay.', see: 'Four cards (CEI, Roll rate, DSO, Slippage) fade and rise into place, one after another.' },
      { do: 'Drag Duration to 2.0s, then press Replay.', see: 'The same animation in slow motion. The code box shows duration: 2.' },
      { do: 'Drag "Start lower by (y)" to 80px, set Duration back near 0.6s, then press Replay.', see: 'The cards now travel much further upwards as they appear.' },
      { do: 'Drag "Stagger between cards" to 0.00s, then press Replay.', see: 'All four cards move together instead of one after another.' },
      { do: 'Set Easing to spring, then press Replay.', see: 'The cards overshoot slightly and settle, like something on a spring.' },
    ],
  },

  // ---------------------------------------------------------------- The effects
  canvas: {
    terms: ['canvas', 'raf', 'dpr', 'gpu'],
    process: {
      title: 'How an animation loop draws the matrix',
      stages: [
        ['The browser asks for a frame', 'requestAnimationFrame calls your function just before the screen refreshes.'],
        ['Positions are moved', 'Each column\'s bright head moves down by the speed.'],
        ['The canvas is redrawn', 'Every character is painted again in its new brightness.'],
        ['The next frame is requested', 'The function asks to be called again, about 60 times a second.'],
        ['Drawing less often saves work', 'Skipping every other frame halves the cost and still looks smooth.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Drive a mini code matrix". Watch the two numbers under it for a few seconds.', see: 'Screen refresh shows a frame rate (often about 60 fps) and "Frames drawn" keeps counting up.' },
      { do: 'Press "Pause loop".', see: 'The matrix freezes and Frames drawn stops counting. The button now says "Run loop".' },
      { do: 'Press "Run loop", then drag Speed to its highest value.', see: 'The streams of code fall much faster.' },
      { do: 'Drag Trail length to its lowest value.', see: 'Each stream shrinks to a short bright tip with almost no tail.' },
      { do: 'Set Frame rate to "Every other frame".', see: 'Frames drawn now counts up half as fast, yet the animation still looks smooth. This is what the welcome screen does on purpose.' },
    ],
  },
  welcome: {
    terms: ['sessionstorage', 'localstorage', 'canvas', 'reducedmotion'],
    process: {
      title: 'How the welcome screen decides whether to show',
      stages: [
        ['The page loads', 'App checks sessionStorage for the key intro-seen.'],
        ['Not found: show the welcome screen', 'The matrix falls and the name decodes letter by letter.'],
        ['You click to enter', 'A portal grows from the click and reveals the site.'],
        ['intro-seen is saved', 'sessionStorage remembers it until this browser tab or session is closed.'],
        ['Next load skips the welcome', 'Until the session ends, you go straight to the site.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "The decoding name". Press Replay.', see: 'Random code symbols resolve, letter by letter, into SHIVAM SONI.' },
      { do: 'Type your own name in the text box.', see: 'The animation restarts and decodes your text.' },
      { do: 'Drag "Milliseconds per letter" to 200ms, then press Replay.', see: 'The letters now lock in slowly, one at a time.' },
      { do: 'Scroll to the playground "Look inside your browser\'s storage". Find the row for intro-seen and read its value.', see: 'The real value stored in your browser now, with a note on what it is for.' },
      { do: 'Press "Remove (show welcome again)" in that row, then open the portfolio (shivam-soni.com) in the same tab or a new one.', see: 'The welcome screen appears again, because the flag that skipped it is gone.' },
    ],
  },
  'tilt-shine': {
    terms: ['gyroscope', 'cssvar', 'raf', 'reducedmotion'],
    process: {
      title: 'How tilt moves the gleam',
      stages: [
        ['The phone reports its tilt', 'The deviceorientation event gives the angle many times a second.'],
        ['Tilt is measured from a baseline', 'How you were already holding the phone counts as "level".'],
        ['The change becomes a position', '50% is the middle; tilting moves it left or right.'],
        ['The position is written to a CSS variable', '--shine, straight onto the element.'],
        ['The gradient slides', 'The bright band moves across the letters to that position.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Tilt the phone". Drag the tilt slider slowly to the right.', see: 'A bright band slides across SHIVAM SONI, and the box under it shows --shine rising above 50%.' },
      { do: 'Drag the slider to the far left.', see: 'The band moves the other way and --shine drops; it stops at -20% however far you go.' },
      { do: 'Set the slider to about 20°, then press "Hold it like this".', see: 'The baseline becomes 20° and --shine returns to 50%: the gleam is back in the middle although the tilt has not changed.' },
      { do: 'Move the slider back to 0°.', see: '--shine is now below 50%. Tilt is measured from where you were holding the phone, not from flat.' },
    ],
  },
  reveal: {
    terms: ['canvas', 'raf', 'dpr'],
    process: {
      title: 'How the droplets reveal the hidden code',
      stages: [
        ['A full code matrix is always there', 'It is drawn but kept invisible.'],
        ['Your pointer leaves droplets', 'Soft dark circles are drawn where the cursor or finger moves. Together they form the mask.'],
        ['The matrix is drawn through the mask', 'With the setting source-in, new pixels are kept only where the mask already has pixels.'],
        ['Droplets fade', 'So the revealed code closes over again behind you.'],
        ['It repeats every frame', 'Which makes it follow your movement smoothly.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Reveal hidden code with a mask". With View on Result, move your mouse (or drag a finger) over the box.', see: 'Code appears in a trail where you move, then fades away behind you.' },
      { do: 'Change View to "1. The mask (droplets)" and move over the box again.', see: 'Only soft blobs following your pointer: this is the shape that decides where code may show.' },
      { do: 'Change View to "2. The hidden matrix".', see: 'The whole box filled with code: what is always there, waiting to be revealed.' },
      { do: 'Change View back to Result.', see: 'The matrix again shows only inside the droplets. Result = matrix seen through the mask.' },
    ],
  },
  stag: {
    terms: ['canvas', 'cssvar', 'dpr'],
    process: {
      title: 'How the stag gets into the code matrix',
      stages: [
        ['The stag is described as shapes', 'Facets for the head and tapered strokes for the antlers, in deerMask.js.'],
        ['It is painted once, off screen', 'On a small canvas nobody sees, in the theme\'s teal and indigo.'],
        ['Each cube asks how much it is covered', 'Its pixels are averaged into a coverage value and a colour.'],
        ['The hidden matrix tints covered cubes', 'In the stag\'s colour, with brighter code on top.'],
        ['The water reveal shows it', 'Only where the cursor\'s droplets are, so it is discovered, not shown.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "See the stag the way the matrix does". Set View to "Coverage only".', see: 'A grey stag: white where a cube is fully covered, darker where only partly, black outside.' },
      { do: 'Drag Cube size to 28px.', see: 'A coarse, blocky stag: fewer cubes means less detail, and the thin antler tips fade.' },
      { do: 'Drag Cube size down to 8px.', see: 'A much finer stag with clear gaps between the facets.' },
      { do: 'Switch View to "Light theme", then "Dark theme".', see: 'The same cubes coloured teal on the left, blending to indigo on the right: deeper on light, brighter on dark.' },
      { do: 'Open the portfolio (shivam-soni.com) and move your mouse slowly across the middle of the welcome screen.', see: 'Patches of teal and indigo cubes appear under the trail: parts of the stag, which fade as the water dries.' },
    ],
  },

  // ---------------------------------------------------------------- Speed & devices
  performance: {
    terms: ['gpu', 'mediaquery', 'dpr', 'raf'],
    process: {
      title: 'How the site adapts to the device',
      stages: [
        ['The page asks the browser about the device', 'Is the pointer a mouse or a finger? How sharp is the screen? Is reduced motion on?'],
        ['Touch screens get lighter settings', 'Bigger matrix cubes, fewer droplets, no blur, no grain.'],
        ['Expensive CSS was replaced', 'Blur filters became gradients, which cost almost nothing to draw.'],
        ['Canvases are capped', 'They are drawn at most 1.5 to 2 times the screen\'s density, not more.'],
        ['The result', 'Idle frames went from about 95 ms to about 20 ms on phones.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "What your site sees about this device". Read the row (pointer: …).', see: 'Whether your device uses a fine pointer (mouse) or a coarse one (finger), and which effects the site uses because of it.' },
      { do: 'Read the devicePixelRatio and window.innerWidth rows.', see: 'Your screen\'s density, and whether you are getting the phone, tablet or desktop layout.' },
      { do: 'Scroll to the playground "Blur filter vs radial gradient". Leave the technique on "radial-gradient (now)" and press Animate.', see: 'Soft glows moving, and a frame-rate reading.' },
      { do: 'Switch the technique to "filter: blur (before)" and drag "Number of glows" up to 24.', see: 'The glows look the same, but on a phone or an older laptop the frame rate drops. On a fast computer both may stay near 60.' },
      { do: 'Press Stop.', see: 'The animation stops and the button says Animate again.' },
    ],
  },
  splitting: {
    terms: ['bundle', 'chunk', 'vite', 'react'],
    process: {
      title: 'How the site loads in two pieces',
      stages: [
        ['The build makes two chunks', 'One small chunk for the welcome screen, one for the rest of the site.'],
        ['The browser downloads the first', 'It is small, so the welcome screen appears quickly.'],
        ['The second downloads meanwhile', 'It is fetched in the background while you look at the welcome screen.'],
        ['You click to enter', 'By then the site chunk has usually arrived.'],
        ['The site appears at once', 'Nothing was downloaded that was not needed yet.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Why the site loads as two pieces". Choose "Before: one bundle".', see: 'One long bar. The "welcome screen visible" marker sits at the very end: everything had to arrive first.' },
      { do: 'Choose "After: split".', see: 'Two bars. The marker now sits at the end of the first, shorter bar: the welcome screen appears sooner.' },
      { do: 'Press Replay and watch the second bar.', see: 'The site chunk loads while the welcome screen is already visible.' },
    ],
  },
  responsive: {
    terms: ['breakpoint', 'tailwind', 'mediaquery'],
    process: {
      title: 'How one layout fits every screen',
      stages: [
        ['Styles are written for phones first', 'Classes with no prefix apply everywhere.'],
        ['Prefixes add rules for wider screens', 'md: applies from 768px, lg: from 1024px.'],
        ['The browser checks its width', 'And switches on whichever prefixed classes now apply.'],
        ['The layout rearranges', 'One column on a phone; text and photo side by side on a desktop.'],
        ['No second website is needed', 'The same HTML serves every device.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Resize a pretend screen". Drag the Screen width slider all the way to the left (320px).', see: 'The label says phone. The photo is on top with the stat cards in a row under it.' },
      { do: 'Drag slowly right until the label changes to md (768px).', see: 'The tablet layout: more room, larger text.' },
      { do: 'Keep dragging until the label changes to lg (1024px).', see: 'The desktop layout: the text and the photo now sit side by side.' },
      { do: 'Now try the real page: on a computer, make this browser window narrow, then wide.', see: 'This page itself rearranges: the lesson list on the left disappears on a narrow window and returns on a wide one.' },
    ],
  },

  // ---------------------------------------------------------------- Features
  lab: {
    terms: ['ztest', 'state', 'component'],
    process: {
      title: 'How to tell a real improvement from luck',
      stages: [
        ['Run two strategies side by side', 'A champion (current) and a challenger (new), on similar accounts.'],
        ['Count the cures in each', 'The cure rate is cured accounts divided by all accounts.'],
        ['Work out the difference', 'The lift is the challenger\'s rate minus the champion\'s.'],
        ['Ask how surprising it is', 'The z-score compares the lift with the wobble you would expect by chance.'],
        ['Decide', '|z| of 1.96 or more means the result is very unlikely to be luck (95% confidence).'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Is the challenger really better?". Read the result with the starting numbers (5,000 accounts each; 1,500 and 1,650 cured).', see: 'A verdict that the result is significant at 95%: scale the challenger.' },
      { do: 'Drag "Challenger cured" down until it is close to 1,500, the same as the champion.', see: 'The verdict changes to "could be luck: keep testing". There is no real difference to detect.' },
      { do: 'Set "Challenger cured" back to about 1,650. Then shrink both groups: set both accounts sliders to 500, Champion cured to 150 and Challenger cured to 170.', see: 'The lift is even bigger than at the start (30% against 34%), but the verdict is now "could be luck". Small groups cannot prove a small lift.' },
      { do: 'Open the portfolio (shivam-soni.com), scroll to The Analytical Lab and drag any slider there.', see: 'The same kind of live calculator, on the real site, recalculating as you drag.' },
    ],
  },
  contact: {
    terms: ['state', 'props', 'api', 'component'],
    process: {
      title: 'How the Connect pop-up opens and closes',
      stages: [
        ['Site holds one piece of state', 'Is the contact pop-up open? It starts as false.'],
        ['Buttons receive a function as a prop', 'The Navbar and Footer each get onConnect.'],
        ['A click calls that function', 'Which sets the state to true.'],
        ['Site re-renders', 'And now draws the pop-up.'],
        ['Closing sets it back to false', 'The pop-up is removed from the page.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Masking a phone number". Read the two boxes.', see: 'What visitors read (a number with some digits hidden) and where the tap goes (a link holding the full number).' },
      { do: 'Change the number in the input to any other phone number.', see: 'Both boxes update: the middle digits are hidden in the first, and the link in the second holds every digit.' },
      { do: 'Open the portfolio (shivam-soni.com) and press Connect in the top bar.', see: 'The "Let\'s Connect" pop-up opens, with phone numbers shown masked.' },
      { do: 'Close the pop-up with its close button or by clicking outside it.', see: 'The pop-up disappears and the page is as it was.' },
    ],
  },
  chat: {
    terms: ['api', 'apikey', 'worker', 'cors', 'ratelimit', 'streaming'],
    process: {
      title: 'How one chat message travels',
      stages: [
        ['The visitor types a question', 'The chat widget sends it to the Worker, not to Claude.'],
        ['The Worker checks who is calling', 'Only shivam-soni.com is allowed (CORS), and only so many messages a minute (rate limit).'],
        ['The Worker adds the secret key', 'The key lives only on the Worker, never in the website.'],
        ['Claude writes the answer', 'And sends it back word by word.'],
        ['The words are passed straight on', 'Streaming: the visitor sees the answer type itself out.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Follow one chat message". Press "Ask a question".', see: 'The message travels from the visitor\'s browser to the Cloudflare Worker, then to the Claude API, and the answer comes back the same way.' },
      { do: 'Press "Call it from another website".', see: 'The request is stopped at the Worker: a different website is not on the allowed list.' },
      { do: 'Press "Send 11 messages in a minute".', see: 'The request is stopped at the Worker again: this time by the rate limit.' },
      { do: 'Press "What if the key were in the site?".', see: 'An explanation of the leak: anyone could read the key from the website\'s files and use it. That is why the Worker exists.' },
    ],
  },

  // ---------------------------------------------------------------- Shipping it
  deploy: {
    stepsIntro: CLICK,
    terms: ['git', 'commit', 'branch', 'actions', 'pages', 'opengraph'],
    process: {
      title: 'How a change reaches the live site',
      stages: [
        ['You change a file and commit', 'A commit is a saved snapshot with a message.'],
        ['You push to GitHub', 'The commit lands on the main branch.'],
        ['GitHub Actions starts by itself', 'A fresh computer installs the libraries and runs the build.'],
        ['Paid lessons go to private storage', 'Before the public site is published.'],
        ['GitHub Pages serves dist/', 'The new version is live at shivam-soni.com within a couple of minutes.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "From your laptop to the live site". Press "1. Change", then "Next step" to read Commit and Push.', see: 'Each stage shows what you do, with the command in a dark box.' },
      { do: 'Keep pressing "Next step" through "Actions builds" and "Paid lessons upload" to "Pages serves".', see: 'The last stage explains that dist/ is published at shivam-soni.com.' },
      { do: 'See real commits: open the Learn the Code course page and press "What changed, in order" at the bottom. On the timeline, click any commit code such as d1fd86a.', see: 'GitHub opens that exact change, showing which lines were added and removed.' },
      { do: 'Come back here and look at the small pills under this lesson\'s title.', see: 'The commit codes of the changes this lesson explains. Each links to the timeline.' },
    ],
  },
  android: {
    stepsIntro: CLICK,
    terms: ['capacitor', 'apk', 'versioncode', 'signing'],
    process: {
      title: 'How the website becomes an app',
      stages: [
        ['The version number goes up', 'So Android will accept the new build as an update.'],
        ['The website is built', 'The same dist/ folder that goes to the live site.'],
        ['Capacitor copies it into the Android project', 'cap sync android'],
        ['Gradle builds the app', 'Compiling and packing everything into one file.'],
        ['The APK is signed and ready', 'Signed with the same key as before, so it installs over the old version.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "What npm run apk does". Press "1. Bump the version".', see: 'The script that raises versionCode and versionName, with a sample of what it prints.' },
      { do: 'Press "Next step" through vite build, cap sync android and Remove iCloud copies.', see: 'Each stage explains one command in the chain.' },
      { do: 'Press "Next step" to gradlew assembleDebug and then APK.', see: 'Where the finished, installable file ends up: apk/Shivam-Soni-Portfolio.apk.' },
      { do: 'If you have the app installed: open your phone\'s Settings, find the app under Apps, and look at its version.', see: 'A version name such as 1.10. Each new build shows a higher number than the last.' },
    ],
  },

  // ---------------------------------------------------------------- Learning Lab & Python
  'learning-lab': {
    terms: ['localstorage', 'state', 'component'],
    process: {
      title: 'How an address becomes a page',
      stages: [
        ['You click a link', 'Only the part of the address after # changes; the page does not reload.'],
        ['The Lab notices the change', 'It listens for the hashchange event.'],
        ['parseHash reads the address', 'It splits #/c/python/loops into its parts: a course and a lesson.'],
        ['The result is stored as state', 'Something like { view: "lesson", course: "python", lesson: "loops" }.'],
        ['The matching page is drawn', 'The same code draws every course, from one list.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "How an address becomes a page". Click the address #/courses.', see: 'What you see: every course with its progress.' },
      { do: 'Click #/c/python/loops.', see: 'One lesson, and under "Progress key" the key python/loops: the course and the lesson joined together.' },
      { do: 'Click #/lesson/canvas.', see: 'A note that this is an old link from before there were courses, and that it still opens the right lesson, saved as site/canvas.' },
      { do: 'Look at the address bar of this page.', see: 'It ends in #/c/site/learning-lab: this lesson\'s own course and id.' },
    ],
  },
  'python-browser': {
    terms: ['python', 'pyodide', 'wasm', 'webworker'],
    process: {
      title: 'What happens when you press Run on Python code',
      stages: [
        ['The page sends your code to a worker', 'A worker is a separate background thread.'],
        ['The worker runs it in Pyodide', 'Real Python, compiled to WebAssembly.'],
        ['Output is sent back as messages', 'Each print() becomes a message to the page.'],
        ['The page shows the output', 'While staying free to scroll and respond.'],
        ['Stop replaces the worker', 'Ending any program, however stuck.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the playground "Why Python runs in a web worker". Press "Busy loop on the page" and watch the moving dot.', see: 'The dot freezes for about 2 seconds, and scrolling does not work until the loop ends.' },
      { do: 'Press "Same loop in the Python worker" and watch the dot again.', see: 'The dot keeps moving and the page scrolls normally. The first time, it also waits a moment for Python to load.' },
      { do: 'Read the two result lines under the buttons.', see: '"On the page": the dot froze. "In the worker": the dot kept moving, because the loop ran on another thread.' },
      { do: 'Scroll to the diagram "What happens when you press Run" and press "Next step" through Start, Run, Output and Done.', see: 'The messages the page and the worker send each other, in order.' },
    ],
  },
  'python-tests': {
    terms: ['test', 'python', 'pyodide'],
    process: {
      title: 'How an exercise is checked',
      stages: [
        ['Your code runs first', 'Everything it prints is captured.'],
        ['Two values are handed to the tests', 'OUTPUT is what you printed; SOURCE is the code you wrote.'],
        ['Each test is a small check', 'An assert that must be true, such as "the first line is Hello".'],
        ['Tests run one by one', 'Each reports a pass, or a message saying what was different.'],
        ['All pass: the exercise is solved', 'And it is ticked on your lesson checklist.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the code box titled "Double it". It holds a function that returns x unchanged. Press "Check my answer".', see: 'Both tests fail, each with a message showing what the function returned, such as got 2.' },
      { do: 'Fix the function: change return x to return x * 2. Press "Check my answer" again.', see: 'Both tests pass: double(2) == 4 and double(-3) == -6.' },
      { do: 'Try to cheat: change the line to return 4. Press "Check my answer".', see: 'The first test passes but double(-3) == -6 fails: the tests try more than one input, so a hard-coded answer cannot pass.' },
      { do: 'Put return x * 2 back and press "Check my answer" once more.', see: 'Both tests pass again.' },
    ],
  },
  'python-deploy': {
    stepsIntro: CLICK,
    terms: ['cdn', 'npm', 'actions', 'pyodide'],
    process: {
      title: 'How Python ships with the site',
      stages: [
        ['Python is listed as a library', 'package.json names pyodide and its exact version.'],
        ['A script copies it before every build', 'Into public/pyodide/, along with pandas, SQLite and Matplotlib.'],
        ['Each file is checked', 'Against a fingerprint, so a damaged download is caught.'],
        ['The build puts it in dist/', 'Next to the rest of the site.'],
        ['Visitors download it only when needed', 'When they open a lesson that runs Python.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "From merge to live Python". Press "1. Merge", then "Next step" to reach "3. prebuild".', see: 'The line the copy script prints: Copied Pyodide … → public/pyodide/.' },
      { do: 'Press "Next step" through "vite build" to "Live".', see: 'How dist/, including the Python files, reaches GitHub Pages.' },
      { do: 'Read the table "sizes (approximate)" under the diagram and find the line for pandas.', see: 'About 8.5 MB, downloaded only when code imports pandas or numpy.' },
      { do: 'See it happen: open the Playground from the top menu and press Run.', see: 'A short wait the first time while Python downloads, then the output. Run again and it is instant: the browser kept the files.' },
    ],
  },

  // ---------------------------------------------------------------- Accounts & payments
  accounts: {
    stepsIntro: CLICK,
    terms: ['supabase', 'rls', 'token', 'localstorage'],
    process: {
      title: 'How your progress follows you',
      stages: [
        ['Progress is saved in this browser first', 'So lessons work offline and without an account.'],
        ['You sign in', 'Supabase checks your email and password and hands back an access token.'],
        ['The two copies are merged', 'A lesson finished on either device counts as finished.'],
        ['Changes are saved to your account', 'A moment after each one, with your token as proof of who you are.'],
        ['The database checks every request', 'Row-level security lets you read and write only your own row.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "What happens when the Lab opens". Press "1. No account yet".', see: 'For a first-time visitor the sign-in library is not even downloaded, so free lessons stay fast.' },
      { do: 'Press "Next step" through "Signed in before", "Email links" and "Back to learning".', see: 'What happens for a returning learner, how email links come back to this page, and where you land after signing in.' },
      { do: 'Press "Sign in" at the top right of this page (or your name, if you are signed in).', see: 'The account page: sign in or create an account, or your details if you already have one.' },
      { do: 'Use your browser\'s Back button to return to this lesson.', see: 'You are back here, exactly where you left off.' },
    ],
  },
  paywall: {
    stepsIntro: CLICK,
    terms: ['chunk', 'bundle', 'supabase', 'rls'],
    process: {
      title: 'How a paid lesson stays private',
      stages: [
        ['The build splits each course', 'Free lessons into public files, paid lessons into their own files.'],
        ['Paid files are moved out', 'They never go into the folder that becomes the public website.'],
        ['They are uploaded to private storage', 'A storage bucket that refuses anonymous downloads.'],
        ['An owner opens a paid lesson', 'The Lab asks storage for the file, sending the learner\'s access token.'],
        ['Storage checks ownership', 'Only if a paid purchase exists for that course is the file handed over.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "How a paid lesson leaves the public site". Press "1. One file per course", then "Next step" to "2. Split while building".', see: 'How one course file is served twice: once with only its free lessons, once with only its paid ones.' },
      { do: 'Press "Next step" through "Move them out" and "Private storage" to "Download for owners".', see: 'The last stage: an owner\'s lesson is downloaded with their access token and run in the page.' },
      { do: 'Open the Courses page from the top menu and open the Python course.', see: 'The first module, Getting started, is open to everyone. On the live site, later lessons show a lock unless you own the course.' },
      { do: 'Come back to Learn the Code and look at its lesson list.', see: 'No locks anywhere: this course is free from start to finish.' },
    ],
  },
  payments: {
    stepsIntro: CLICK,
    terms: ['razorpay', 'edgefunction', 'hmac', 'webhook'],
    process: {
      title: 'How a payment unlocks a course',
      stages: [
        ['The page asks to buy', 'It sends only the course id. The price is never sent from the browser.'],
        ['A server function creates the order', 'It reads the price from the database and asks Razorpay for an order.'],
        ['You pay in Razorpay\'s window', 'Card and UPI details go to Razorpay only.'],
        ['Razorpay returns a signed receipt', 'An order id, a payment id and a signature.'],
        ['A second function checks the signature', 'And asks Razorpay to confirm the payment.'],
        ['Only then is the course unlocked', 'The purchase is marked paid, and the paid lessons can be downloaded.'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "Buying a course". Press "1. create-order".', see: 'What the first server function does: checks who you are, reads the price from the database, and creates the order.' },
      { do: 'Press "Next step" to "2. Payment window".', see: 'Card, UPI and bank details go to Razorpay only; this site never sees them.' },
      { do: 'Press "Next step" to "3. verify-payment", then "4. Unlocked".', see: 'The signature check, the confirmation with Razorpay, and what happens on the page once the purchase is marked paid.' },
      { do: 'Read the section "The webhook: a safety net" above and answer for yourself: what unlocks the course if you close the tab right after paying?', see: 'Razorpay calls the razorpay-webhook function from its own servers, which marks the purchase paid.' },
    ],
  },
  'checkout-guard': {
    stepsIntro: CLICK,
    terms: ['timeout', 'razorpay', 'error'],
    process: {
      title: 'How checkout recovers when the payment window fails',
      stages: [
        ['Unlock is pressed', 'A busy flag stops a second click from starting a second payment.'],
        ['Each wait has a time limit', 'Loading the script, creating the order, and the window appearing.'],
        ['The page watches for the window', 'Every quarter of a second it checks whether Razorpay\'s window is really on screen.'],
        ['If it never appears, the page gives up cleanly', 'It closes Razorpay, removes anything left behind and turns scrolling back on.'],
        ['A clear message is shown', '"The payment window could not open. You have not been charged."'],
      ],
    },
    steps: [
      { do: 'Scroll up to the diagram "Opening the payment window safely". Press "1. Remember the page".', see: 'Before opening, the page notes its scroll settings and catches blocking alerts.' },
      { do: 'Press "Next step" to "2. Open and watch".', see: 'The check that runs every quarter of a second to see whether the window is really showing.' },
      { do: 'Press "Next step" to "3. It appeared" and then "4. It did not".', see: 'The two endings: the payment carries on, or the page is put back and says you have not been charged.' },
      { do: 'Look at the four time limits in the code box under "Rule 1" and find the longest.', see: 'VERIFY_TIMEOUT_MS, 60 seconds: checking a finished payment waits longest, because money has already moved.' },
    ],
  },
});
