'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PythonCodeBlockProps {
  code: string;
}

const vscodeLightStyles = {
  ...oneLight,

  // ฟอนต์ + background
  'code[class*="language-"], pre[class*="language-"]': {
    ...oneLight['code[class*="language-"], pre[class*="language-"]'],
    fontFamily: `"Cascadia Code", Consolas, monospace`,
    fontSize: '14px',
    background: '#ffffff',
  },

  // ✔ Keyword - น้ำเงินเข้มเหมือน VSCode
  keyword: { color: '#0000FF' },

  // ✔ Function name - น้ำตาล VSCode
  function: { color: '#795E26' },

  // ✔ Builtin / Boolean / None - ม่วงเหมือน VSCode
  builtin: { color: '#68217A' },

  // ✔ String - แดง VSCode
  string: { color: '#A31515' },

  // ✔ Number - เขียว
  number: { color: '#098658' },

  // ✔ Comment - เขียวเข้มแบบ VSCode
  comment: { color: '#008000' },

  // ✔ Operator / punctuation
  operator: { color: '#000000' },
  punctuation: { color: '#000000' },
};

const PythonCodeBlock: React.FC<PythonCodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copy code สำเร็จแล้ว');
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      toast.error('Copy code ไม่สำเร็จ');
    }
  };

  return (
    <div className="w-full">
      {/* Code Container */}
      <div
        className="
          rounded-xl
          border border-gray-200
          bg-white
          shadow-sm
          overflow-auto
        "
      >
        <SyntaxHighlighter
          language="python"
          style={vscodeLightStyles}
          showLineNumbers
          wrapLines
          customStyle={{
            background: '#ffffff',
            padding: '20px',
            margin: 0,
            borderRadius: '12px',
            fontFamily: `"Cascadia Code", Consolas, monospace`,
          }}
          lineNumberStyle={{
            color: '#6e7681',
            marginRight: '16px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Copy Button (เหมือนตัวอย่าง) */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleCopy}
          className="
            rounded-lg
            bg-blue-600
            px-5 py-2.5
            text-sm font-semibold
            text-white
            transition
            hover:bg-blue-700
            active:scale-[0.98]
          "
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
};

export default PythonCodeBlock;
