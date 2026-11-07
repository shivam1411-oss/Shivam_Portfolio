import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { Decoration, keymap } from '@codemirror/view';
import { Prec, StateEffect, StateField } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';

// Language support by name; Python is the default.
const LANGUAGES = { python: () => python(), jsx: () => javascript({ jsx: true }), yaml: () => yaml() };
import { tags as t } from '@lezer/highlight';

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

// Dark editor matching the lessons' code blocks (same colours as the highlighter in ui.jsx).
const theme = EditorView.theme(
  {
    '&': { backgroundColor: '#0d1014', color: '#d6f5f0', fontSize: '13px' },
    // No ligatures: beginners should see -> and != exactly as they type them
    '.cm-content': { fontFamily: MONO, fontVariantLigatures: 'none', caretColor: '#5eead4', padding: '12px 0' },
    '.cm-scroller': { fontFamily: MONO, lineHeight: '1.6' },
    '.cm-gutters': { backgroundColor: '#0d1014', color: 'rgba(255,255,255,0.25)', border: 'none' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.03)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)' },
    '&.cm-focused': { outline: 'none' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(63,209,191,0.25) !important' },
    '.cm-cursor': { borderLeftColor: '#5eead4' },
    '.cm-matchingBracket': { backgroundColor: 'rgba(63,209,191,0.2)', outline: 'none' },
    '.cm-tooltip': { backgroundColor: '#181b21', border: '1px solid rgba(255,255,255,0.1)', color: '#ecedef' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'rgba(63,209,191,0.25)', color: '#fff' },
    '.cm-step-line': { backgroundColor: 'rgba(252,210,141,0.16)', boxShadow: 'inset 3px 0 0 #fcd28d' },
    '.cm-foldPlaceholder': { backgroundColor: 'transparent', border: 'none', color: '#5eead4' },
  },
  { dark: true }
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: '#9196f6', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: '#fcd28d' },
  { tag: [t.number, t.bool, t.null], color: '#5eead4' },
  { tag: t.comment, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#7dd3fc' },
  { tag: t.definition(t.variableName), color: '#ecedef' },
  { tag: [t.className, t.definition(t.className)], color: '#f0abfc' },
  { tag: t.self, color: '#f9a8d4' },
  { tag: [t.tagName, t.angleBracket], color: '#7dd3fc' },
  { tag: t.attributeName, color: '#c4b5fd' },
  { tag: t.propertyName, color: '#d6f5f0' },
]);

// Step-through: the line about to run gets a highlighted background.
const setStepLine = StateEffect.define();
const stepLine = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setStepLine)) {
        if (!e.value || e.value > tr.state.doc.lines) return Decoration.none;
        return Decoration.set([Decoration.line({ class: 'cm-step-line' }).range(tr.state.doc.line(e.value).from)]);
      }
    }
    return tr.docChanged ? Decoration.none : deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

/** CodeMirror editor (Python, JSX or YAML). Ctrl/Cmd+Enter calls onRun; `highlightLine` marks a line for step-through. */
export default function Editor({ value, onChange, onRun, label = 'Python code', highlightLine = null, language = 'python' }) {
  const host = useRef(null);
  const view = useRef(null);
  const callbacks = useRef({ onChange, onRun });
  callbacks.current = { onChange, onRun };

  useEffect(() => {
    const v = new EditorView({
      parent: host.current,
      doc: value,
      extensions: [
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                callbacks.current.onRun?.();
                return true;
              },
            },
          ])
        ),
        basicSetup,
        stepLine,
        keymap.of([indentWithTab]), // Esc, then Tab, moves focus out of the editor
        indentUnit.of(language === 'python' ? '    ' : '  '), // Python uses 4 spaces; JSX and YAML 2
        (LANGUAGES[language] || LANGUAGES.python)(),
        syntaxHighlighting(highlight),
        theme,
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.updateListener.of((u) => u.docChanged && callbacks.current.onChange?.(u.state.doc.toString())),
      ],
    });
    view.current = v;
    return () => v.destroy();
    // The editor is created once; later `value` changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Outside changes (Reset, Show solution) replace the text.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const effects = [setStepLine.of(highlightLine)];
    if (highlightLine && highlightLine <= v.state.doc.lines) {
      effects.push(EditorView.scrollIntoView(v.state.doc.line(highlightLine).from, { y: 'nearest' }));
    }
    v.dispatch({ effects });
  }, [highlightLine]);

  return <div ref={host} className="text-left [&_.cm-editor]:max-h-[28rem]" />;
}
