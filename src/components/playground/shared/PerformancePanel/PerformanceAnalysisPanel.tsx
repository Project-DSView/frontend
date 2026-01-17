'use client';

import React from 'react';
import { PerformanceAnalysisPanelProps } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Sub-components
import PerformanceSummaryMetrics from './PerformanceSummaryMetrics';
import PerformanceMetricsCards from './PerformanceMetricsCards';
import PerformanceChart from './PerformanceChart';
import HotspotsPanel from './HotspotsPanel';
import TimelinePanel from './TimelinePanel';
import { MemoryUsageBar, TimeUsageBar } from './ResourceUsageBar';
import BigOOverview from './BigOOverview';
import BigOAnalysisDetails from './BigOAnalysisDetails';
import PerFunctionComplexity from './PerFunctionComplexity';
import BigOChart from './BigOChart';

const PerformanceAnalysisPanel: React.FC<PerformanceAnalysisPanelProps> = ({
  steps,
  currentStepIndex,
  complexity,
}) => {
  const currentStep =
    steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  const memoryUsage: number = (currentStep?.state?.memory as number) || 0;

  const maxMemoryUsed = steps.reduce((max, step) => {
    const mem = (step?.state?.memory as number) || 0;
    return mem > max ? mem : max;
  }, 0);

  const totalExecutionTime = steps.reduce((total, step) => {
    const time = (step?.state?.execution_time as number) || 0;
    return total + time;
  }, 0);

  if (steps.length === 0) {
    return null;
  }

  return (
    <Card className="from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10 mt-4 border-0 bg-gradient-to-r shadow-md">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PerformanceSummaryMetrics
            memoryUsage={memoryUsage}
            totalExecutionTime={totalExecutionTime}
            complexity={complexity}
          />

          {/* Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto sm:max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Performance Analysis</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="bigo">Big O</TabsTrigger>
                </TabsList>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
                  <PerformanceMetricsCards
                    memoryUsage={memoryUsage}
                    maxMemoryUsed={maxMemoryUsed}
                    totalExecutionTime={totalExecutionTime}
                    stepCount={steps.length}
                  />

                  <PerformanceChart steps={steps} currentStepIndex={currentStepIndex} />

                  <HotspotsPanel steps={steps} />

                  <TimelinePanel steps={steps} currentStepIndex={currentStepIndex} />

                  <MemoryUsageBar memoryUsage={memoryUsage} />
                  <TimeUsageBar totalExecutionTime={totalExecutionTime} />
                </TabsContent>

                {/* Big O Tab */}
                <TabsContent value="bigo" className="space-y-4">
                  {complexity ? (
                    <>
                      <BigOOverview complexity={complexity} />

                      {complexity.analysisDetails && (
                        <BigOAnalysisDetails details={complexity.analysisDetails} />
                      )}

                      {complexity.functionComplexities &&
                        complexity.functionComplexities.length > 0 && (
                          <PerFunctionComplexity
                            functionComplexities={complexity.functionComplexities}
                          />
                        )}

                      <BigOChart timeComplexity={complexity.timeComplexity} />
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">ไม่มีข้อมูล Big O Complexity</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

PerformanceAnalysisPanel.displayName = 'PerformanceAnalysisPanel';

export default PerformanceAnalysisPanel;
