import { pythonCourse } from '../python/course';
import { pythonGuide } from '../guides/python';
import { withGuide } from './util';

export default withGuide(
  {
    ...pythonCourse,
    audience: 'Complete beginners, and Excel users who want to automate their work.',
    needs: 'Nothing. Start at lesson 1 and run every example.',
    outcomes: ['Write Python programs with variables, loops, functions and classes', 'Read and write files, CSV and JSON', 'Test your code and structure a small project'],
    start: {
      intro:
        'New to coding? This page tells you exactly what to do, in order. You do not need to install anything or know any maths beyond adding and dividing. Go slowly, type everything yourself, and expect to see errors: they are part of learning, not a sign you are doing it wrong.',
      need: [
        'A phone, tablet or computer with a web browser. A keyboard makes typing code easier, but it is not required.',
        'About 20 to 30 minutes for each lesson. One lesson a day is a good pace.',
        'No installs and no account for the first module: Python runs inside this page.',
        'The first time you press Run, Python takes a few seconds to load. After that it is quick.',
      ],
      order: [
        'Open lesson 1, "Hello, Python", and finish it before moving on. Each lesson uses what the one before taught.',
        'Work through the modules from top to bottom: Getting started, then Decisions and loops, then Collections.',
        'Stuck on a word? Every keyword is defined at the top of its lesson, and all of them are in the Glossary.',
        'Finished a lesson? The next one is linked at the bottom of the page.',
      ],
      lesson: [
        ['Learn the words', 'Each lesson starts with its keywords, a plain-English meaning for each, and an everyday comparison. Read them first.'],
        ['See how it works', 'A short numbered list shows what Python does, in order, for the idea being taught.'],
        ['Read and run', 'Short explanations with code boxes. Press Run on every one, change a number or a word, and run it again to see what changes.'],
        ['Do it yourself, step by step', 'A numbered walkthrough in a practice box: one small action per step, exactly what to type, and what you should see. Tick each step as you go.'],
        ['Solve the exercises', 'Small tasks checked automatically. A hint is always available, and the solution if you are truly stuck.'],
        ['Pass the quiz', 'A few questions to check the idea has landed. When the exercises and quiz are right, the lesson is marked complete.'],
      ],
      tip: 'Every lesson has a checklist at the top called "Your path through this lesson". Follow it from step 1 and you will never wonder what to do next.',
    },
  },
  pythonGuide
);
