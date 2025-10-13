'use client';
import React, { memo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TutorialStepProps } from '@/types';

const TutorialStepComponent: React.FC<TutorialStepProps> = memo(({ step, hoverColor, onImageClick }) => {
  return (
    <div className="space-y-3">
      <div
        className={`relative h-32 w-full cursor-pointer overflow-hidden rounded-lg border hover:border-${hoverColor} transition-colors`}
        onClick={() => onImageClick(step.image)}
      >
        <Image
          src={step.image}
          alt={step.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>
      <div className="flex items-start gap-2">
        <Badge variant="outline" className="mt-1">
          {step.stepNumber}
        </Badge>
        <p className="text-sm">{step.description}</p>
      </div>
    </div>
  );
});

TutorialStepComponent.displayName = 'TutorialStepComponent';

export default TutorialStepComponent;
