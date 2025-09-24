'use client';

import React, { useEffect, useState } from 'react';
import { CodeEditorProps } from '@/types';
import { python } from '@codemirror/lang-python';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';

const CodeMirrorEditor: React.FC<CodeEditorProps> = ({
  code,
  currentLine = -1,
  title = 'Generated Code',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Fallback for SSR
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="relative">
            {/* Line numbers */}
            <div className="absolute top-0 bottom-0 left-0 w-12 border-r border-gray-200 bg-gray-50 font-mono text-xs text-gray-400">
              {code.split('\n').map((_, index) => (
                <div key={index} className="h-5 px-2 text-right leading-5">
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <pre className="max-h-[400px] overflow-auto bg-white py-2 pr-4 pl-14 font-mono text-sm whitespace-pre-wrap text-gray-800">
              {code.split('\n').map((line, index) => (
                <div
                  key={index}
                  className={`h-5 leading-5 ${
                    currentLine >= 0 && index === currentLine - 1
                      ? '-ml-2 animate-pulse border-l-4 border-yellow-400 bg-yellow-100 pl-2'
                      : ''
                  }`}
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic import for CodeMirror
  const CodeMirror = React.lazy(() =>
    import('@uiw/react-codemirror').then((module) => ({ default: module.default })),
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
      <div className="overflow-hidden rounded-lg border">
        <React.Suspense
          fallback={
            <div className="flex h-64 items-center justify-center bg-gray-50">
              <div className="text-gray-500">Loading code editor...</div>
            </div>
          }
        >
          <CodeMirror
            value={code}
            height="400px"
            theme={vscodeLight}
            editable={false}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: false,
              highlightSelectionMatches: false,
              searchKeymap: false,
            }}
            extensions={[python()]}
            className="text-sm"
            style={{
              fontSize: '14px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            }}
          />
        </React.Suspense>
      </div>
    </div>
  );
};

export default CodeMirrorEditor;
