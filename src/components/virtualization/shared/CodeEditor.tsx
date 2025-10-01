'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { StepthroughCodeEditorProps } from '@/types';
import { python } from '@codemirror/lang-python';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { highlightActiveLine, highlightActiveLineGutter, EditorView } from '@codemirror/view';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';

// Move CodeMirror import outside component to prevent re-creation
const CodeMirror = React.lazy(() =>
  import('@uiw/react-codemirror').then((module) => ({ default: module.default })),
);

const CodeEditor: React.FC<StepthroughCodeEditorProps> = ({
  code,
  onCodeChange,
  disabled = false,
  currentStep,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [editorView, setEditorView] = useState<unknown>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize extensions to prevent re-creation
  const extensions = useMemo(
    () => [
      python(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      autocompletion(),
      keymap.of(completionKeymap),
      EditorView.baseTheme({
        '& .cm-activeLine': {
          backgroundColor: '#FFFF0040 !important',
        },
        '& .cm-activeLineGutter': {
          backgroundColor: '#FFFF0040 !important',
        },
      }),
    ],
    [],
  );

  // Scroll to and highlight current step line
  useEffect(() => {
    if (currentStep?.line && editorView) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = editorView as any; // Type assertion for CodeMirror view
      const lineNumber = currentStep.line - 1; // Convert to 0-based index
      const lineStart = view.state.doc.line(lineNumber + 1).from;

      // Scroll to line and select it
      view.dispatch({
        selection: { anchor: lineStart, head: lineStart },
        scrollIntoView: true,
      });
    }
  }, [currentStep?.line, editorView]);

  if (!isClient) {
    // Fallback for SSR
    return (
      <div className="h-full rounded-lg bg-white shadow">
        <div className="flex h-12 items-center justify-between border-b border-gray-200 px-4">
          <h2 className="text-lg font-semibold text-gray-800">Code Editor</h2>
          <button
            disabled
            className="rounded-lg bg-gray-400 px-4 py-2 text-sm font-medium text-white"
          >
            Run
          </button>
        </div>
        <div className="p-4">
          <div className="h-64 rounded border bg-gray-50 p-4">
            <div className="text-gray-500">Loading code editor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <React.Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-gray-50">
            <div className="text-gray-500">Loading code editor...</div>
          </div>
        }
      >
        <CodeMirror
          value={code}
          onChange={onCodeChange}
          height="100%"
          theme={vscodeLight}
          editable={!disabled}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: false,
          }}
          extensions={extensions}
          className="h-full"
          style={{
            fontSize: '16px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            height: '100%',
            overflow: 'hidden',
          }}
          onCreateEditor={(view: unknown) => setEditorView(view)}
        />
      </React.Suspense>
    </div>
  );
};

export default CodeEditor;
