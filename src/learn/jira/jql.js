// A teaching implementation of JQL (Jira Query Language) over the sample work items in data.js.
// Supports: field op value; AND / OR / NOT with brackets; = != > >= < <= ~ !~ IN, NOT IN, IS (NOT) EMPTY;
// functions currentUser(), now(), startOfDay(), startOfWeek(), startOfMonth(), openSprints(),
// closedSprints(), futureSprints(); relative dates like -7d / -2w; ORDER BY field ASC|DESC.
// Errors are worded like Jira's so learners recognise them later.

import { CURRENT_USER, PRIORITIES, SPRINTS, STATUSES, TODAY, TYPES, workItems } from './data';

// Field names (lower-case) → item property. Includes Jira's aliases.
const FIELDS = {
  project: 'project',
  issuetype: 'type',
  type: 'type',
  status: 'status',
  priority: 'priority',
  assignee: 'assignee',
  reporter: 'reporter',
  labels: 'labels',
  label: 'labels',
  sprint: 'sprint',
  'story points': 'points',
  storypoints: 'points',
  'story point estimate': 'points',
  created: 'created',
  createddate: 'created',
  updated: 'updated',
  updateddate: 'updated',
  due: 'due',
  duedate: 'due',
  summary: 'summary',
  description: 'description',
  text: 'text',
  key: 'key',
  issuekey: 'key',
  id: 'key',
  parent: 'parent',
  'epic link': 'parent',
  resolution: 'resolution',
};
const DATE_FIELDS = new Set(['created', 'updated', 'due']);
const ALLOWED = { status: STATUSES, type: TYPES, priority: PRIORITIES };

export class JqlError extends Error {}

// ---------------------------------------------------------------- tokens

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j++;
      if (j >= src.length) throw new JqlError(`A quote (${c}) is not closed.`);
      tokens.push({ t: 'str', v: src.slice(i + 1, j) });
      i = j + 1;
    } else if ('(),'.includes(c)) {
      tokens.push({ t: c });
      i++;
    } else if (src.startsWith('!=', i) || src.startsWith('!~', i) || src.startsWith('>=', i) || src.startsWith('<=', i)) {
      tokens.push({ t: 'op', v: src.slice(i, i + 2) });
      i += 2;
    } else if ('=<>~'.includes(c)) {
      tokens.push({ t: 'op', v: c });
      i++;
    } else {
      let j = i;
      while (j < src.length && !/[\s(),=!<>~"']/.test(src[j])) j++;
      if (j === i) throw new JqlError(`Unexpected character "${c}".`);
      tokens.push({ t: 'word', v: src.slice(i, j) });
      i = j;
    }
  }
  return tokens;
}

// ---------------------------------------------------------------- parser

function parse(src) {
  const tokens = tokenize(src);
  let p = 0;
  const peek = () => tokens[p];
  const isWord = (tok, w) => tok && tok.t === 'word' && tok.v.toUpperCase() === w;
  const expect = (t, what) => {
    const tok = tokens[p];
    if (!tok || tok.t !== t) throw new JqlError(`Expecting ${what} but got ${tok ? `"${tok.v ?? tok.t}"` : 'the end of the query'}.`);
    p++;
    return tok;
  };

  function fieldName() {
    const tok = peek();
    if (!tok) throw new JqlError('Expecting a field name but the query ended.');
    if (tok.t === 'str') {
      p++;
      return tok.v;
    }
    if (tok.t !== 'word') throw new JqlError(`Expecting a field name but got "${tok.v ?? tok.t}".`);
    p++;
    // Two-word fields written without quotes, e.g. story points
    const two = `${tok.v} ${peek()?.v ?? ''}`.toLowerCase();
    if (FIELDS[two] && peek()?.t === 'word') {
      p++;
      return two;
    }
    return tok.v;
  }

  function value() {
    const tok = peek();
    if (!tok) throw new JqlError('Expecting a value but the query ended.');
    if (tok.t === 'str') {
      p++;
      return { kind: 'lit', v: tok.v };
    }
    if (tok.t === 'word') {
      p++;
      if (peek()?.t === '(') {
        p++;
        expect(')', 'a closing bracket ")" after the function');
        return { kind: 'fn', name: tok.v.toLowerCase() };
      }
      return { kind: 'lit', v: tok.v };
    }
    throw new JqlError(`Expecting a value but got "${tok.v ?? tok.t}".`);
  }

  function clause() {
    const name = fieldName();
    const field = FIELDS[name.toLowerCase()];
    if (!field) throw new JqlError(`Field '${name}' does not exist or you do not have permission to view it.`);
    const tok = peek();
    if (isWord(tok, 'IS')) {
      p++;
      let not = false;
      if (isWord(peek(), 'NOT')) {
        p++;
        not = true;
      }
      const v = peek();
      if (!v || !(isWord(v, 'EMPTY') || isWord(v, 'NULL'))) throw new JqlError('After IS / IS NOT, use EMPTY (or NULL).');
      p++;
      return { kind: 'empty', field, not };
    }
    let op;
    if (isWord(tok, 'NOT') && isWord(tokens[p + 1], 'IN')) {
      p += 2;
      op = 'not in';
    } else if (isWord(tok, 'IN')) {
      p++;
      op = 'in';
    } else if (tok?.t === 'op') {
      p++;
      op = tok.v;
    } else throw new JqlError(`Expecting an operator after '${name}' (such as =, !=, ~, IN, IS) but got ${tok ? `"${tok.v ?? tok.t}"` : 'the end of the query'}.`);

    if (op === 'in' || op === 'not in') {
      if (peek()?.t !== '(') {
        const fn = value();
        if (fn.kind !== 'fn') throw new JqlError(`Expecting a list in brackets after IN, e.g. ${name} IN ("A", "B").`);
        return { kind: 'cmp', field, op, values: [fn] };
      }
      p++;
      const values = [value()];
      while (peek()?.t === ',') {
        p++;
        values.push(value());
      }
      expect(')', 'a closing bracket ")" to end the list');
      return { kind: 'cmp', field, op, values };
    }
    return { kind: 'cmp', field, op, values: [value()] };
  }

  function primary() {
    if (peek()?.t === '(') {
      p++;
      const e = orExpr();
      expect(')', 'a closing bracket ")"');
      return e;
    }
    if (isWord(peek(), 'NOT')) {
      p++;
      return { kind: 'not', e: primary() };
    }
    return clause();
  }
  function andExpr() {
    let e = primary();
    while (isWord(peek(), 'AND')) {
      p++;
      e = { kind: 'and', a: e, b: primary() };
    }
    return e;
  }
  function orExpr() {
    let e = andExpr();
    while (isWord(peek(), 'OR')) {
      p++;
      e = { kind: 'or', a: e, b: andExpr() };
    }
    return e;
  }

  let where = null;
  if (peek() && !(isWord(peek(), 'ORDER'))) where = orExpr();
  const order = [];
  if (isWord(peek(), 'ORDER')) {
    p++;
    if (!isWord(peek(), 'BY')) throw new JqlError('Expecting BY after ORDER.');
    p++;
    do {
      if (peek()?.t === ',') p++;
      const name = fieldName();
      const field = FIELDS[name.toLowerCase()];
      if (!field) throw new JqlError(`Field '${name}' does not exist and cannot be used in ORDER BY.`);
      let dir = 'asc';
      if (isWord(peek(), 'ASC') || isWord(peek(), 'DESC')) {
        dir = peek().v.toLowerCase();
        p++;
      }
      order.push({ field, dir });
    } while (peek()?.t === ',');
  }
  if (p < tokens.length) {
    const tok = tokens[p];
    throw new JqlError(`Expecting AND, OR or ORDER BY but got "${tok.v ?? tok.t}". Text values with spaces need quotes, e.g. status = "In Progress".`);
  }
  return { where, order };
}

// ---------------------------------------------------------------- evaluation

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const dayOfWeek = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = Sunday

function resolveValue(v, field) {
  if (v.kind === 'fn') {
    switch (v.name) {
      case 'currentuser':
        return [CURRENT_USER];
      case 'now':
      case 'startofday':
        return [TODAY];
      case 'startofweek':
        return [addDays(TODAY, -dayOfWeek(TODAY))]; // Jira weeks start on Sunday by default
      case 'endofweek':
        return [addDays(TODAY, 6 - dayOfWeek(TODAY))];
      case 'startofmonth':
        return [`${TODAY.slice(0, 8)}01`];
      case 'opensprints':
        return SPRINTS.open;
      case 'closedsprints':
        return SPRINTS.closed;
      case 'futuresprints':
        return SPRINTS.future;
      default:
        throw new JqlError(`Unable to find JQL function '${v.name}()'.`);
    }
  }
  let s = String(v.v);
  if (DATE_FIELDS.has(field)) {
    const rel = s.match(/^([+-]?\d+)([dw])$/i);
    if (rel) return [addDays(TODAY, Number(rel[1]) * (rel[2].toLowerCase() === 'w' ? 7 : 1))];
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(s)) return [s.replace(/\//g, '-')];
    throw new JqlError(`Date value '${s}' for field '${field}' is invalid. Use "2026-11-01" or a relative date like -7d.`);
  }
  if (ALLOWED[field]) {
    const match = ALLOWED[field].find((x) => x.toLowerCase() === s.toLowerCase());
    if (!match) throw new JqlError(`The value '${s}' does not exist for the field '${field === 'type' ? 'issuetype' : field}'. Try one of: ${ALLOWED[field].join(', ')}.`);
    s = match;
  }
  return [s];
}

const norm = (x) => (x === null || x === undefined ? null : String(x).toLowerCase());

function fieldValue(item, field) {
  if (field === 'text') return `${item.summary} ${item.description}`;
  return item[field];
}

function compare(item, field, op, raw) {
  const value = fieldValue(item, field);
  if (op === '~' || op === '!~') {
    const words = norm(raw).split(/\s+/).filter(Boolean);
    const hay = norm(value) || '';
    const hit = words.every((w) => hay.includes(w));
    return op === '~' ? hit : !hit;
  }
  if (Array.isArray(value)) {
    const has = value.some((x) => norm(x) === norm(raw));
    if (op === '=') return has;
    if (op === '!=') return !has;
    throw new JqlError(`The operator '${op}' is not supported by the field '${field}'.`);
  }
  if (value === null || value === undefined) return false; // like Jira: empty values never match comparisons
  if (op === '=') return norm(value) === norm(raw);
  if (op === '!=') return norm(value) !== norm(raw);
  let a = value;
  let b = raw;
  if (field === 'priority') {
    a = PRIORITIES.indexOf(value);
    b = PRIORITIES.indexOf(raw);
  } else if (field === 'points') {
    a = Number(value);
    b = Number(raw);
    if (Number.isNaN(b)) throw new JqlError(`Story points must be a number, not '${raw}'.`);
  } else if (!DATE_FIELDS.has(field)) {
    throw new JqlError(`The operator '${op}' is not supported by the field '${field}'. Use =, !=, ~ or IN.`);
  }
  if (op === '>') return a > b;
  if (op === '>=') return a >= b;
  if (op === '<') return a < b;
  if (op === '<=') return a <= b;
  return false;
}

function test(node, item) {
  switch (node.kind) {
    case 'and':
      return test(node.a, item) && test(node.b, item);
    case 'or':
      return test(node.a, item) || test(node.b, item);
    case 'not':
      return !test(node.e, item);
    case 'empty': {
      const v = fieldValue(item, node.field);
      const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
      return node.not ? !empty : empty;
    }
    case 'cmp': {
      const values = node.values.flatMap((v) => resolveValue(v, node.field));
      if (node.op === 'in') return values.some((v) => compare(item, node.field, '=', v));
      if (node.op === 'not in') {
        const v = fieldValue(item, node.field);
        if (v === null || v === undefined) return false;
        return !values.some((x) => compare(item, node.field, '=', x));
      }
      return compare(item, node.field, node.op, values[0]);
    }
    default:
      return true;
  }
}

const keyNumber = (k) => [k.split('-')[0], Number(k.split('-')[1])];
function sortItems(items, order) {
  const rules = order.length ? order : [{ field: 'key', dir: 'asc' }];
  const val = (item, field) => (field === 'priority' ? PRIORITIES.indexOf(item.priority) : field === 'key' ? keyNumber(item.key) : item[field]);
  return [...items].sort((x, y) => {
    for (const { field, dir } of rules) {
      let a = val(x, field);
      let b = val(y, field);
      if (Array.isArray(a)) {
        // keys: project, then number
        const c = a[0] === b[0] ? a[1] - b[1] : a[0] < b[0] ? -1 : 1;
        if (c) return dir === 'asc' ? c : -c;
        continue;
      }
      if (a === b) continue;
      if (a === null || a === undefined) return 1; // empty values last, like Jira
      if (b === null || b === undefined) return -1;
      const c = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
      if (c) return dir === 'asc' ? c : -c;
    }
    return 0;
  });
}

/** Run a JQL query. Returns the matching work items (sorted) or throws JqlError. */
export function runJql(query, items = workItems) {
  const { where, order } = parse(query.trim());
  const matched = where ? items.filter((it) => test(where, it)) : items;
  return sortItems(matched, order);
}
