import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
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
]);

/** CodeMirror editor for Python. Ctrl/Cmd+Enter calls onRun. */
export default function Editor({ value, onChange, onRun, label = 'Python code' }) {
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
        keymap.of([indentWithTab]), // Esc, then Tab, moves focus out of the editor
        indentUnit.of('    '),
        python(),
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

  return <div ref={host} className="text-left [&_.cm-editor]:max-h-[28rem]" />;
}
