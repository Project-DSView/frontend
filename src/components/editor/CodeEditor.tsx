'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { python } from '@codemirror/lang-python';
import { vscodeLight, vscodeDark } from '@uiw/codemirror-theme-vscode';
import { highlightActiveLine, highlightActiveLineGutter, EditorView } from '@codemirror/view';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';
import { linter, lintGutter } from '@codemirror/lint';
import { Diagnostic } from '@codemirror/lint';

import { StepthroughCodeEditorProps } from '@/types';
import { useTheme } from '@/providers/ThemeProvider';

// Move CodeMirror import outside component to prevent re-creation
const CodeMirror = React.lazy(() =>
  import('@uiw/react-codemirror').then((module) => ({ default: module.default })),
);

// Python syntax checker function
const pythonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  const text = doc.toString();

  // Basic syntax error detection
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Check for unmatched parentheses (excluding those inside string literals)
    let openParens = 0;
    let closeParens = 0;
    let inString = false;
    let stringChar = '';
    let lastOpenPos = -1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && (i === 0 || line[i - 1] !== '\\')) {
        inString = false;
        stringChar = '';
      } else if (!inString) {
        if (char === '(') {
          openParens++;
          lastOpenPos = i;
        } else if (char === ')') {
          closeParens++;
        }
      }
    }

    if (openParens > closeParens && lastOpenPos !== -1) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).from + lastOpenPos,
        to: doc.line(lineIndex + 1).from + lastOpenPos + 1,
        severity: 'error',
        message: 'Unmatched opening parenthesis',
      });
    }

    // Check for unmatched brackets (excluding those inside string literals)
    let openBrackets = 0;
    let closeBrackets = 0;
    let inStringBrackets = false;
    let stringCharBrackets = '';
    let lastOpenBracketPos = -1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (!inStringBrackets && (char === '"' || char === "'")) {
        inStringBrackets = true;
        stringCharBrackets = char;
      } else if (
        inStringBrackets &&
        char === stringCharBrackets &&
        (i === 0 || line[i - 1] !== '\\')
      ) {
        inStringBrackets = false;
        stringCharBrackets = '';
      } else if (!inStringBrackets) {
        if (char === '[') {
          openBrackets++;
          lastOpenBracketPos = i;
        } else if (char === ']') {
          closeBrackets++;
        }
      }
    }

    if (openBrackets > closeBrackets && lastOpenBracketPos !== -1) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).from + lastOpenBracketPos,
        to: doc.line(lineIndex + 1).from + lastOpenBracketPos + 1,
        severity: 'error',
        message: 'Unmatched opening bracket',
      });
    }

    // Check for unmatched braces (excluding those inside string literals)
    let openBraces = 0;
    let closeBraces = 0;
    let inStringBraces = false;
    let stringCharBraces = '';
    let lastOpenBracePos = -1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (!inStringBraces && (char === '"' || char === "'")) {
        inStringBraces = true;
        stringCharBraces = char;
      } else if (inStringBraces && char === stringCharBraces && (i === 0 || line[i - 1] !== '\\')) {
        inStringBraces = false;
        stringCharBraces = '';
      } else if (!inStringBraces) {
        if (char === '{') {
          openBraces++;
          lastOpenBracePos = i;
        } else if (char === '}') {
          closeBraces++;
        }
      }
    }

    if (openBraces > closeBraces && lastOpenBracePos !== -1) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).from + lastOpenBracePos,
        to: doc.line(lineIndex + 1).from + lastOpenBracePos + 1,
        severity: 'error',
        message: 'Unmatched opening brace',
      });
    }

    // Check for unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      const lastQuotePos = line.lastIndexOf("'");
      if (lastQuotePos !== -1) {
        diagnostics.push({
          from: doc.line(lineIndex + 1).from + lastQuotePos,
          to: doc.line(lineIndex + 1).from + lastQuotePos + 1,
          severity: 'error',
          message: 'Unmatched single quote',
        });
      }
    }

    if (doubleQuotes % 2 !== 0) {
      const lastQuotePos = line.lastIndexOf('"');
      if (lastQuotePos !== -1) {
        diagnostics.push({
          from: doc.line(lineIndex + 1).from + lastQuotePos,
          to: doc.line(lineIndex + 1).from + lastQuotePos + 1,
          severity: 'error',
          message: 'Unmatched double quote',
        });
      }
    }

    // Check for incomplete statements
    if (trimmedLine.endsWith('=') && !trimmedLine.includes('==')) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).to - 1,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete assignment statement',
      });
    }

    // Check for incomplete function calls
    if (trimmedLine.includes('(') && !trimmedLine.includes(')') && !trimmedLine.includes('#')) {
      const openParenPos = line.lastIndexOf('(');

      // Check if the opening parenthesis is inside a string literal
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < openParenPos; i++) {
        const char = line[i];
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && (i === 0 || line[i - 1] !== '\\')) {
          inString = false;
          stringChar = '';
        }
      }

      // Only show error if the parenthesis is not inside a string
      if (!inString) {
        diagnostics.push({
          from: doc.line(lineIndex + 1).from + openParenPos,
          to: doc.line(lineIndex + 1).from + openParenPos + 1,
          severity: 'error',
          message: 'Incomplete function call - missing closing parenthesis',
        });
      }
    }

    // Check for incomplete list/dict comprehensions
    if (trimmedLine.includes('[') && !trimmedLine.includes(']') && !trimmedLine.includes('#')) {
      const openBracketPos = line.lastIndexOf('[');

      // Check if the opening bracket is inside a string literal
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < openBracketPos; i++) {
        const char = line[i];
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && (i === 0 || line[i - 1] !== '\\')) {
          inString = false;
          stringChar = '';
        }
      }

      // Only show error if the bracket is not inside a string
      if (!inString) {
        diagnostics.push({
          from: doc.line(lineIndex + 1).from + openBracketPos,
          to: doc.line(lineIndex + 1).from + openBracketPos + 1,
          severity: 'error',
          message: 'Incomplete list - missing closing bracket',
        });
      }
    }

    // Check for incomplete dictionary
    if (trimmedLine.includes('{') && !trimmedLine.includes('}') && !trimmedLine.includes('#')) {
      const openBracePos = line.lastIndexOf('{');

      // Check if the opening brace is inside a string literal
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < openBracePos; i++) {
        const char = line[i];
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && (i === 0 || line[i - 1] !== '\\')) {
          inString = false;
          stringChar = '';
        }
      }

      // Only show error if the brace is not inside a string
      if (!inString) {
        diagnostics.push({
          from: doc.line(lineIndex + 1).from + openBracePos,
          to: doc.line(lineIndex + 1).from + openBracePos + 1,
          severity: 'error',
          message: 'Incomplete dictionary - missing closing brace',
        });
      }
    }

    // Check for incomplete string literals
    if (trimmedLine.startsWith('"') && !trimmedLine.endsWith('"') && !trimmedLine.includes('#')) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).from,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete string literal - missing closing quote',
      });
    }

    if (trimmedLine.startsWith("'") && !trimmedLine.endsWith("'") && !trimmedLine.includes('#')) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).from,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete string literal - missing closing quote',
      });
    }

    // Check for incomplete if/for/while statements
    if (
      (trimmedLine.startsWith('if ') ||
        trimmedLine.startsWith('for ') ||
        trimmedLine.startsWith('while ')) &&
      !trimmedLine.includes(':') &&
      !trimmedLine.includes('#')
    ) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).to - 1,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete statement - missing colon (:)',
      });
    }

    // Check for incomplete try/except statements
    if (
      (trimmedLine.startsWith('try:') ||
        trimmedLine.startsWith('except') ||
        trimmedLine.startsWith('finally:')) &&
      !trimmedLine.includes(':') &&
      !trimmedLine.includes('#')
    ) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).to - 1,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete statement - missing colon (:)',
      });
    }

    // Check for incomplete def/class statements
    if (
      (trimmedLine.startsWith('def ') || trimmedLine.startsWith('class ')) &&
      !trimmedLine.includes(':') &&
      !trimmedLine.includes('#')
    ) {
      diagnostics.push({
        from: doc.line(lineIndex + 1).to - 1,
        to: doc.line(lineIndex + 1).to,
        severity: 'error',
        message: 'Incomplete function/class definition - missing colon (:)',
      });
    }
  });

  return diagnostics;
});

const CodeEditor: React.FC<StepthroughCodeEditorProps> = ({
  code,
  onCodeChange,
  disabled = false,
  currentStep,
  height = '100%',
}) => {
  const [isClient, setIsClient] = useState(false);
  const [editorView, setEditorView] = useState<unknown>(null);
  const { theme } = useTheme();

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
      pythonLinter,
      lintGutter(),
      EditorView.baseTheme({
        '& .cm-activeLine': {
          backgroundColor: '#FFFF0040 !important',
        },
        '& .cm-activeLineGutter': {
          backgroundColor: '#FFFF0040 !important',
        },
        // Error highlighting styles
        '& .cm-lint-marker-error': {
          background:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23dc2626' d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z'/%3E%3C/svg%3E\") no-repeat left center",
          backgroundSize: '12px 12px',
          width: '12px',
          height: '12px',
          display: 'inline-block',
          marginRight: '4px',
        },
        '& .cm-lint-marker-warning': {
          background:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23f59e0b' d='M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/%3E%3C/svg%3E\") no-repeat left center",
          backgroundSize: '12px 12px',
          width: '12px',
          height: '12px',
          display: 'inline-block',
          marginRight: '4px',
        },
        '& .cm-lint-marker-info': {
          background:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%233b82f6' d='M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'/%3E%3C/svg%3E\") no-repeat left center",
          backgroundSize: '12px 12px',
          width: '12px',
          height: '12px',
          display: 'inline-block',
          marginRight: '4px',
        },
        // Error underline styles
        '& .cm-lintRange-error': {
          background: 'linear-gradient(90deg, transparent 0%, transparent 100%)',
          borderBottom: '2px wavy #dc2626',
        },
        '& .cm-lintRange-warning': {
          background: 'linear-gradient(90deg, transparent 0%, transparent 100%)',
          borderBottom: '2px wavy #f59e0b',
        },
        '& .cm-lintRange-info': {
          background: 'linear-gradient(90deg, transparent 0%, transparent 100%)',
          borderBottom: '2px wavy #3b82f6',
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

  // Reset height when step changes to prevent height accumulation
  useEffect(() => {
    if (currentStep) {
      // Force a small delay to ensure the height calculation is accurate
      const timer = setTimeout(() => {
        // This will trigger a re-render with the correct height
        if (editorView) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const view = editorView as any;
          view.dispatch({
            effects: [],
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentStep, editorView]);

  if (!isClient) {
    // Fallback for SSR
    return (
      <div
        className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        style={{ height }}
        suppressHydrationWarning
      >
        <div
          className={`flex h-12 items-center justify-between border-b px-4 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2
            className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
          >
            Code Editor
          </h2>
          <button
            disabled
            className="rounded-lg bg-gray-400 px-4 py-2 text-sm font-medium text-white"
          >
            Run
          </button>
        </div>
        <div className="p-4">
          <div
            className={`h-64 rounded border p-4 ${
              theme === 'dark'
                ? 'border-gray-700 bg-gray-900'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Loading code editor...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" style={{ height }} suppressHydrationWarning>
      <React.Suspense
        fallback={
          <div
            className={`flex h-full items-center justify-center ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}
          >
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Loading code editor...
            </div>
          </div>
        }
      >
        <CodeMirror
          value={code}
          onChange={onCodeChange}
          height={typeof height === 'number' ? `${height}px` : height}
          theme={theme === 'dark' ? vscodeDark : vscodeLight}
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
            height: height,
            overflow: 'hidden',
          }}
          onCreateEditor={(view: unknown) => setEditorView(view)}
        />
      </React.Suspense>
    </div>
  );
};

export default CodeEditor;
