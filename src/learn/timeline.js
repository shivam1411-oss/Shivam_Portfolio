// The Learning Lab's "What changed" page uses the same changelog as the portfolio's "Site updates" section.
import { changelog } from '../data/changelog';

export { commitUrl } from '../data/changelog';
export const timeline = changelog.map((e) => ({ ...e, hash: e.commits[0] || '', lessons: e.lessons || [] }));
