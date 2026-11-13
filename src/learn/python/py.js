/** Tag for Python code samples in lessons: keeps backslashes as written and drops the first newline. */
export const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '');
