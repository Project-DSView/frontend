import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TimelinePanelProps } from '@/types';
import {
  formatMemory,
  formatPerformanceTime,
  truncateCode,
  SIGNIFICANT_MEMORY_THRESHOLD,
  SIGNIFICANT_TIME_THRESHOLD,
} from '@/lib';

const TimelinePanel: React.FC<TimelinePanelProps> = ({ steps, currentStepIndex }) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'memory' | 'time'>('memory');

  const filteredSteps = useMemo(() => {
    const mapped = steps.map((step, index) => ({
      step,
      index,
      delta: (step?.state?.memory_delta as number) || 0,
      memory: (step?.state?.memory as number) || 0,
      time: (step?.state?.execution_time as number) || 0,
      line: step?.line || 0,
      code: step?.code || '',
    }));

    if (showAllSteps) return mapped;

    if (activeFilter === 'memory') {
      return mapped.filter((item) => Math.abs(item.delta) > SIGNIFICANT_MEMORY_THRESHOLD);
    } else {
      return mapped.filter((item) => item.time > SIGNIFICANT_TIME_THRESHOLD);
    }
  }, [steps, showAllSteps, activeFilter]);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Timeline</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border p-0.5">
              <button
                onClick={() => setActiveFilter('memory')}
                className={`rounded-sm px-2 py-0.5 text-[10px] transition-colors ${
                  activeFilter === 'memory'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Memory
              </button>
              <button
                onClick={() => setActiveFilter('time')}
                className={`rounded-sm px-2 py-0.5 text-[10px] transition-colors ${
                  activeFilter === 'time'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Time
              </button>
            </div>
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showAllSteps}
                onChange={(e) => setShowAllSteps(e.target.checked)}
                className="border-input text-primary focus:ring-primary h-3.5 w-3.5 rounded"
              />
              Show all
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSteps.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            ไม่มี steps ที่มีการเปลี่ยนแปลงมาก ({activeFilter})
          </p>
        ) : (
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {filteredSteps.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 text-xs ${
                  item.index === currentStepIndex
                    ? 'bg-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono">
                      L{item.line}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {truncateCode(item.code, 20)}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-primary">{formatMemory(item.memory)}</span>
                    <span className="text-secondary">{formatPerformanceTime(item.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelinePanel;
