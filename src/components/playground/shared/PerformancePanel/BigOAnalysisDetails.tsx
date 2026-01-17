import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BigOAnalysisDetailsProps } from '@/types';

const BigOAnalysisDetails: React.FC<BigOAnalysisDetailsProps> = ({ details }) => {
  if (!details) return null;

  return (
    <Card className="border-secondary/20 bg-secondary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-secondary text-sm">รายละเอียดการวิเคราะห์</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {details.loop_count !== undefined && (
            <div className="bg-background/60 rounded-lg p-2">
              <p className="text-foreground text-xs font-bold">Loops</p>
              <p className="text-muted-foreground">{details.loop_count}</p>
            </div>
          )}
          {details.max_nesting !== undefined && (
            <div className="bg-background/60 rounded-lg p-2">
              <p className="text-foreground text-xs font-bold">Max Depth</p>
              <p className="text-muted-foreground">{details.max_nesting} ชั้น</p>
            </div>
          )}
          {details.has_recursion !== undefined && (
            <div className="bg-background/60 rounded-lg p-2">
              <p className="text-foreground text-xs font-bold">Recursion</p>
              <p className="text-muted-foreground">{details.has_recursion ? 'ใช่' : 'ไม่'}</p>
            </div>
          )}
          {details.has_growing_structures !== undefined && (
            <div className="bg-background/60 rounded-lg p-2">
              <p className="text-foreground text-xs font-bold">Growing Data</p>
              <p className="text-muted-foreground">
                {details.has_growing_structures ? 'ใช่' : 'ไม่'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BigOAnalysisDetails;
