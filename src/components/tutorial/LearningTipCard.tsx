'use client';
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningTipCardProps } from '@/types';

const LearningTipCard: React.FC<LearningTipCardProps> = memo(({ tip }) => {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">{tip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{tip.description}</p>
      </CardContent>
    </Card>
  );
});

LearningTipCard.displayName = 'LearningTipCard';

export default LearningTipCard;



