'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Play, Zap } from 'lucide-react';
import { PlaygroundModeCardProps } from '@/types';
import TutorialStepComponent from './TutorialStep';



const PlaygroundModeCard: React.FC<PlaygroundModeCardProps> = ({ 
  mode, 
  onImageClick 
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ArrowRight': return <ArrowRight className="h-5 w-5" />;
      case 'Play': return <Play className="h-5 w-5" />;
      case 'Zap': return <Zap className="h-5 w-5" />;
      default: return <ArrowRight className="h-5 w-5" />;
    }
  };

  const getHoverColor = (modeTitle: string) => {
    switch (modeTitle) {
      case 'Drag & Drop': return 'blue-400';
      case 'Step Through': return 'green-400';
      case 'Real-time': return 'purple-400';
      default: return 'blue-400';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${mode.iconColor}`}>
            {getIcon(mode.iconName)}
          </div>
          {mode.title}
        </CardTitle>
        <CardDescription>
          {mode.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode.steps.map((step, index) => (
          <TutorialStepComponent
            key={index}
            step={step}
            hoverColor={getHoverColor(mode.title)}
            onImageClick={onImageClick}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default PlaygroundModeCard;
