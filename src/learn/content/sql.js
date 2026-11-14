import { sqlCourse } from '../data/sql';
import { sqlGuide } from '../guides/data';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...sqlCourse,
    audience: 'Anyone who needs data from a database, the most-requested skill in analyst roles.',
    needs: 'Python lessons 1–6 help but are not required for the SQL itself.',
    outcomes: ['Write SELECT, GROUP BY and JOIN queries', 'Change data safely with parameters and transactions', 'Use window functions and move results into pandas'],
    start: startGuide({
      intro:
        'SQL is how you ask a database for exactly the rows you want. Here you write real SQL against a small practice database of accounts and payments that is rebuilt on every Run, so nothing you do can break it. Read each query out loud in plain words before you run it.',
      need: [
        'Nothing to install: the database runs inside this page.',
        'The first six Python lessons help, because queries are sent from a few lines of Python, but you can follow the SQL without them.',
        'About 30 minutes for each lesson.',
        'Type SQL keywords in capitals (SELECT, FROM, WHERE). It is not required, but it makes queries much easier to read.',
      ],
      order: [
        'Start with "Databases, tables and rows" to learn what a table is.',
        'Then "Your first queries" and "Aggregates, GROUP BY and CASE": most everyday SQL is in these two.',
        'Then JOINs, and changing data safely.',
        'Finish with window functions and using SQL together with pandas.',
      ],
      doing: 'A numbered walkthrough in a practice box that already has the practice database loaded: one small action per step, exactly what to type, and what you should see. Tick each step as you go.',
    }),
  },
  sqlGuide
);
