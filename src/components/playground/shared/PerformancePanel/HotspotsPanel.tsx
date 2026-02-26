import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HotspotsPanelProps } from '@/types';
import {
  formatMemory,
  formatPerformanceTime as formatTime,
  truncateCode,
  SIGNIFICANT_MEMORY_THRESHOLD,
  SIGNIFICANT_TIME_THRESHOLD,
} from '@/lib';

const HotspotsPanel: React.FC<HotspotsPanelProps> = ({ steps }) => {
  const [activeSubTab, setActiveSubTab] = useState<'memory' | 'time'>('memory');

  const memoryHotspots = useMemo(() => {
    return steps
      .map((step, index) => ({
        step,
        index,
        delta: (step?.state?.memory_delta as number) || 0,
        memory: (step?.state?.memory as number) || 0,
        time: (step?.state?.execution_time as number) || 0,
        line: step?.line || 0,
        code: step?.code || '',
      }))
      .filter((item) => item.delta > SIGNIFICANT_MEMORY_THRESHOLD)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);
  }, [steps]);

  const timeHotspots = useMemo(() => {
    return steps
      .map((step, index) => ({
        step,
        index,
        delta: (step?.state?.memory_delta as number) || 0,
        memory: (step?.state?.memory as number) || 0,
        time: (step?.state?.execution_time as number) || 0,
        line: step?.line || 0,
        code: step?.code || '',
      }))
      .filter((item) => item.time > SIGNIFICANT_TIME_THRESHOLD)
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  }, [steps]);

  return (
    <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'memory' | 'time')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="memory">Memory Hotspots</TabsTrigger>
        <TabsTrigger value="time">Time Hotspots</TabsTrigger>
      </TabsList>

      <TabsContent value="memory">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm">บรรทัดที่กิน Memory มาก</CardTitle>
          </CardHeader>
          <CardContent>
            {memoryHotspots.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                ไม่มีบรรทัดที่ใช้ memory มากผิดปกติ
              </p>
            ) : (
              <div className="space-y-2">
                {memoryHotspots.map((item, idx) => (
                  <div key={idx} className="bg-background/60 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="bg-primary/20 text-primary rounded px-2 py-0.5 font-mono text-xs font-medium">
                          L{item.line}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {truncateCode(item.code, 30)}
                        </span>
                      </div>
                      <span className="text-primary text-sm font-bold">
                        +{formatMemory(item.delta)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time">
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-secondary text-sm">บรรทัดที่ใช้เวลานาน</CardTitle>
          </CardHeader>
          <CardContent>
            {timeHotspots.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                ไม่มีบรรทัดที่ใช้เวลานานผิดปกติ
              </p>
            ) : (
              <div className="space-y-2">
                {timeHotspots.map((item, idx) => (
                  <div key={idx} className="bg-background/60 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="bg-secondary/20 text-secondary rounded px-2 py-0.5 font-mono text-xs font-medium">
                          L{item.line}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {truncateCode(item.code, 30)}
                        </span>
                      </div>
                      <span className="text-secondary text-sm font-bold">
                        {formatTime(item.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default HotspotsPanel;
