'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningTip } from '@/types/components/tutorial.types';

interface LearningTipCardProps {
  tip: LearningTip;
}

const LearningTipCard: React.FC<LearningTipCardProps> = ({ tip }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {tip.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{tip.description}</p>
      </CardContent>
    </Card>
  );
};

export default LearningTipCard;

