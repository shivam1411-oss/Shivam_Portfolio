import { pandasCourse } from '../data/pandas';
import { pandasGuide } from '../guides/data';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...pandasCourse,
    audience: 'Analysts who work in Excel and want to do the same work faster and repeatably in Python.',
    needs: 'Python modules 1–4 (variables to functions). Excel experience helps.',
    outcomes: ['Load, clean and explore real data files', 'Filter, group, pivot and join tables', 'Build a monthly portfolio report with one function'],
    start: startGuide({
      intro:
        'This course turns the things you already do in Excel (open, filter, sort, SUMIF, VLOOKUP, pivot) into short lines of Python. Every example uses the same made-up collections data, so you always know what you are looking at. Type the code yourself and read each result before moving on.',
      need: [
        'The first four modules of the Python course, up to functions. If print(), variables, lists and loops feel familiar, you are ready.',
        'Nothing to install: pandas runs inside this page. The first Run in a lesson takes a few seconds while pandas loads.',
        'About 30 minutes for each lesson.',
        'Excel experience helps, because each idea is compared with the Excel way of doing it.',
      ],
      order: [
        'Start with "From Excel to pandas". It shows the whole course in miniature.',
        'Then the two NumPy lessons: pandas is built on them, and they are short.',
        'Then work down the modules in order: DataFrames, selecting, cleaning, grouping, combining.',
        'Finish with the project, which uses everything once more on raw files.',
      ],
      doing: 'A numbered walkthrough in a practice box that already has the data loaded: one small action per step, exactly what to type, and what you should see. Tick each step as you go.',
    }),
  },
  pandasGuide
);
