'use client';
import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TutorialStepProps } from '@/types';



const TutorialStepComponent: React.FC<TutorialStepProps> = ({ 
  step, 
  hoverColor, 
  onImageClick 
}) => {
  return (
    <div className="space-y-3">
      <div 
        className={`relative w-full h-32 rounded-lg overflow-hidden border cursor-pointer hover:border-${hoverColor} transition-colors`}
        onClick={() => onImageClick(step.image)}
      >
        <Image
          src={step.image}
          alt={step.alt}
          fill
          className="object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex items-start gap-2">
        <Badge variant="outline" className="mt-1">{step.stepNumber}</Badge>
        <p className="text-sm">{step.description}</p>
      </div>
    </div>
  );
};

export default TutorialStepComponent;

