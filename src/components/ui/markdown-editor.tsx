'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { cn } from '@/lib';
import { useTheme } from '@/providers/ThemeProvider';

// Dynamically import MDEditor and commands to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="border-input bg-muted flex h-[300px] items-center justify-center rounded-md border">
      <p className="text-muted-foreground text-sm">กำลังโหลด editor...</p>
    </div>
  ),
});

// Import commands dynamically
const getCommands = async () => {
  try {
    const commands = await import('@uiw/react-md-editor/commands');
    // Handle both default and named exports
    return commands.default || commands;
  } catch (error) {
    console.error('Failed to import commands:', error);
    return null;
  }
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'เขียน markdown...',
  rows = 8,
  error,
  className,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [customCommands, setCustomCommands] = React.useState<unknown[] | null>(null);

  React.useEffect(() => {
    setMounted(true);
    // Load commands and filter out fullscreen
    getCommands()
      .then((cmdModule) => {
        if (!cmdModule) {
          console.warn('Commands module not found, using default toolbar');
          return;
        }

        // Handle both default and named exports
        const commandsModule =
          (cmdModule as { default?: unknown; [key: string]: unknown }).default || cmdModule;

        if (!commandsModule || typeof commandsModule !== 'object') {
          console.warn('Invalid commands module, using default toolbar');
          return;
        }

        const cmd = commandsModule as Record<string, unknown>;
        const commands = [
          cmd.bold,
          cmd.italic,
          cmd.strikethrough,
          cmd.hr,
          cmd.title,
          cmd.divider,
          cmd.link,
          cmd.quote,
          cmd.code,
          cmd.codeBlock,
          cmd.image,
          cmd.unorderedListCommand,
          cmd.orderedListCommand,
          cmd.checkedListCommand,
        ].filter(Boolean); // Filter out undefined commands

        if (commands.length > 0) {
          setCustomCommands(commands as unknown[]);
        }
      })
      .catch((error) => {
        console.error('Failed to load commands:', error);
        // Continue without custom commands (will use default toolbar)
      });
  }, []);

  if (!mounted) {
    return (
      <div className={cn('w-full', className)}>
        <div className="border-input bg-muted flex h-[300px] items-center justify-center rounded-md border">
          <p className="text-muted-foreground text-sm">กำลังโหลด editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('w-full', error && 'rounded-md border border-red-500')}
        data-color-mode={theme === 'dark' ? 'dark' : 'light'}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="live"
          hideToolbar={false}
          visibleDragbar={false}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          commands={(customCommands as any) || undefined}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              minHeight: `${rows * 24}px`,
            },
          }}
          data-color-mode={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export { MarkdownEditor };
