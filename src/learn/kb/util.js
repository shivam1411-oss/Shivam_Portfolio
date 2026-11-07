// Helpers for writing knowledge-base content.

/** Tag for code samples: keeps backslashes as written and removes the common indentation. */
export const code = (strings, ...values) => {
  const raw = String.raw({ raw: strings.raw }, ...values).replace(/^\n/, '').replace(/\s+$/, '');
  const lines = raw.split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
};

export const LEVELS = [
  { id: 'beginner', title: 'Beginner', blurb: 'No experience needed. What it is, why it matters, and your first steps.' },
  { id: 'intermediate', title: 'Intermediate', blurb: 'The everyday tools you will use on real work.' },
  { id: 'advanced', title: 'Advanced', blurb: 'Techniques that make your work faster, cleaner and more reliable.' },
  { id: 'expert', title: 'Expert', blurb: 'How it works under the hood, and how professionals run it at scale.' },
];
