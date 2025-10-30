'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="border-border bg-background text-foreground hover:bg-muted focus:ring-ring relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
      aria-label="Toggle theme"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === 'dark' ? 'scale-100 -rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
        }`}
      />
    </button>
  );
};
