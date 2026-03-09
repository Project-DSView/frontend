'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { VariableInfo, VariableStatePanelProps } from '@/types';
import { isNodeLike, formatObjectValue } from '@/lib';

const VariableStatePanel: React.FC<VariableStatePanelProps> = ({
  steps,
  currentStepIndex,
  defaultWidth = 256,
  minWidth = 180,
  maxWidth = 500,
}) => {
  // Panel width state for resizing
  const [panelWidth, setPanelWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle resize mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = e.clientX - panelRect.left;

      // Clamp width within min/max bounds
      setPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while resizing
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  // Extract variable states from current step - DYNAMIC: display all backend variables
  const variableStates = useMemo((): VariableInfo[] => {
    if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
      return [];
    }

    const currentStep = steps[currentStepIndex];
    const previousStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

    // Get current and previous variable states
    const currentVars = (currentStep.state.variables || {}) as Record<string, unknown>;
    const previousVars = (previousStep?.state.variables || {}) as Record<string, unknown>;

    // Track all variables dynamically
    const trackedVariables: VariableInfo[] = [];

    // Iterate over ALL variables from backend
    for (const [name, value] of Object.entries(currentVars)) {
      // Skip internal/system variables
      if (
        name.startsWith('trace_') ||
        name.startsWith('__') ||
        name.startsWith('last_') ||
        name === 'input_values' ||
        name === 'input_index' ||
        name === 'active_instance' ||
        name === 'self' ||
        name === 'captured_stdout' ||
        name === 'compiled_code' ||
        name === 'exec' ||
        name === 'eval' ||
        name.startsWith('_')
      ) {
        continue;
      }

      // Format the value for display
      const formattedValue = formatObjectValue(value);

      // Skip values that are code objects or IO objects (internal Python objects)
      if (
        formattedValue?.includes('<code object') ||
        formattedValue?.includes('<_io.') ||
        formattedValue?.includes('object at 0x') ||
        formattedValue?.includes('<module') ||
        formattedValue?.includes('<function') ||
        formattedValue === 'Object'
      ) {
        continue;
      }

      // Check if value changed from previous step
      const prevValue = previousVars[name];
      const changed = JSON.stringify(value) !== JSON.stringify(prevValue);

      // Determine if this points to a node (use undefined instead of null for optional)
      const pointsToNode = isNodeLike(value) && formattedValue ? formattedValue : undefined;

      trackedVariables.push({
        name,
        value: formattedValue,
        pointsToNode,
        changed,
      });
    }

    // Sort: changed variables first, then alphabetically
    trackedVariables.sort((a, b) => {
      if (a.changed !== b.changed) return a.changed ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return trackedVariables;
  }, [steps, currentStepIndex]);

  // Format display value
  const formatValue = (value: string | null): string => {
    if (value === null || value === 'null' || value === 'None' || value === 'undefined') {
      return 'null';
    }
    return value;
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <aside
      ref={panelRef}
      className="relative w-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all lg:w-auto dark:border-gray-700 dark:bg-gray-800"
      style={{
        width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? panelWidth : '100%',
      }}
      aria-label="Variable State Panel"
    >
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <svg
          className="h-4 w-4 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Variables</span>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Step {currentStepIndex + 1}
        </span>
      </header>

      {/* Variable Table - Scrollable on mobile */}
      <div className="max-h-[200px] overflow-x-hidden overflow-y-auto lg:max-h-none lg:overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className="px-3 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">
                Name
              </th>
              <th className="px-3 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {variableStates.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-4 text-center text-xs text-gray-400">
                  No variables in scope
                </td>
              </tr>
            ) : (
              variableStates.map((variable) => (
                <tr
                  key={variable.name}
                  className={`border-b border-gray-100 transition-all duration-300 dark:border-gray-700/50 ${
                    variable.changed
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  {/* Variable Name */}
                  <td className="px-3 py-2">
                    <span
                      className={`font-mono text-xs ${
                        variable.changed
                          ? 'font-semibold text-yellow-700 dark:text-yellow-400'
                          : 'text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {variable.name}
                    </span>
                  </td>

                  {/* Variable Value */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate font-mono text-xs ${
                          variable.value === null || formatValue(variable.value) === 'null'
                            ? 'text-gray-400 italic dark:text-gray-500'
                            : variable.changed
                              ? 'font-semibold text-yellow-700 dark:text-yellow-400'
                              : 'text-gray-800 dark:text-gray-200'
                        }`}
                        title={variable.value ?? 'null'}
                      >
                        {formatValue(variable.value)}
                      </span>
                      {/* Show pointer arrow if pointing to a node */}
                      {variable.pointsToNode && (
                        <span className="flex-shrink-0 text-xs text-blue-500 dark:text-blue-400">
                          → Node
                        </span>
                      )}
                      {/* Change indicator */}
                      {variable.changed && (
                        <span className="inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Current Step Detail */}
      {steps[currentStepIndex]?.state?.step_detail?.operation && (
        <footer className="border-t border-gray-200 px-3 py-2 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Operation:</span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {steps[currentStepIndex].state.step_detail?.operation}
            </span>
          </div>
        </footer>
      )}

      {/* Resize Handle - Hidden on mobile */}
      <div
        className={`absolute top-0 right-0 hidden h-full w-1 cursor-ew-resize transition-colors lg:block ${
          isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-400'
        }`}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        {/* Visible grip indicator */}
        <div className="absolute top-1/2 right-0 flex h-8 w-1 -translate-y-1/2 flex-col items-center justify-center gap-0.5">
          <div className={`h-0.5 w-0.5 rounded-full ${isResizing ? 'bg-white' : 'bg-gray-400'}`} />
          <div className={`h-0.5 w-0.5 rounded-full ${isResizing ? 'bg-white' : 'bg-gray-400'}`} />
          <div className={`h-0.5 w-0.5 rounded-full ${isResizing ? 'bg-white' : 'bg-gray-400'}`} />
        </div>
      </div>
    </aside>
  );
};

export default VariableStatePanel;
