'use client';

import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlightSelector?: string; // CSS selector for highlighter
  placement?: 'top' | 'bottom' | 'left' | 'right'; // Preferred placement
  spotlightPadding?: number; // Padding for the spotlight (default 8)
  disableNextUntilVisible?: boolean; // If true, stays in "loading" state until element found
}

export interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  storageKey: string;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  onClose,
  steps,
  storageKey,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsAnimating(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Set initial window size
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Resize
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Find Target Element logic with retry
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    if (!step.highlightSelector) {
      setTargetRect(null);
      return;
    }

    let retryCount = 0;
    const maxRetries = 20; // 10 seconds approx

    const findElement = () => {
      const el = document.querySelector(step.highlightSelector!);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Check if visible (not zero sized)
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
          return true;
        }
      }
      return false;
    };

    // Immediate try
    if (findElement()) return;

    // Retry interval
    const interval = setInterval(() => {
      retryCount++;
      if (findElement() || retryCount >= maxRetries) {
        clearInterval(interval);
        if (retryCount >= maxRetries && step.disableNextUntilVisible) {
             // Failed to find required element
             console.warn(`Tutorial: Could not find element ${step.highlightSelector}`);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, currentStep, steps, windowSize]); // windowSize dependency re-checks position on resize

  // Measure Card
  useLayoutEffect(() => {
    if (cardRef.current) {
      setCardRect(cardRef.current.getBoundingClientRect());
    }
  }, [currentStep, isOpen, targetRect, windowSize]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep]);

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'completed');
    }
    onClose();
  };

  // Skip
  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Calculate Positions
  let style: React.CSSProperties = {};
  const padding = step.spotlightPadding || 8;
  const placement = step.placement || 'bottom'; // Default preference

  // Fallback to centered if no target or target not found yet
  const isCentered = !targetRect;

  if (targetRect && cardRect) {
    // Manual positioning logic
    const gap = 12; // Gap between spotlight and card

    // Center coordinates of target
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    let idxTop = 0;
    let idxLeft = 0;

    switch (placement) {
      case 'top':
        idxTop = targetRect.top - padding - cardRect.height - gap;
        idxLeft = targetCenterX - cardRect.width / 2;
        break;
      case 'bottom':
        idxTop = targetRect.bottom + padding + gap;
        idxLeft = targetCenterX - cardRect.width / 2;
        break;
      case 'left':
        idxTop = targetCenterY - cardRect.height / 2;
        idxLeft = targetRect.left - padding - cardRect.width - gap;
        break;
      case 'right':
        idxTop = targetCenterY - cardRect.height / 2;
        idxLeft = targetRect.right + padding + gap;
        break;
    }

    // Boundary checks (Basic viewport containment)
    // Horizontal check
    if (idxLeft < 10) idxLeft = 10;
    if (idxLeft + cardRect.width > windowSize.width - 10) {
      idxLeft = windowSize.width - 10 - cardRect.width;
    }

    // Vertical check
    if (idxTop < 10) idxTop = 10;
    if (idxTop + cardRect.height > windowSize.height - 10) {
      idxTop = windowSize.height - 10 - cardRect.height;
    }

    style = {
      position: 'fixed',
      top: idxTop,
      left: idxLeft,
      zIndex: 10000,
    };

    // Calculate Arrow Position relative to CARD
    // This is simplified; accurate arrow positioning requires more math
    // We'll hide arrow if we had to shift the card significantly
  } else {
    // Centered style
    style = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000,
    };
  }

  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
        borderRadius: '6px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)', // Spotlight effect
        zIndex: 9999,
        pointerEvents: 'none', // Visual only
      }
    : {};

  return (
    <>
      {/* 1. Backdrop / Spotlight */}
      {isCentered ? (
         // Full dim background for centered steps
        <div
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      ) : (
        // Spotlight Element (The Shadow creates the backdrop)
        // Also add a transparent blocker to prevent clicks everywhere
        <>
           <div className="fixed inset-0 z-[9998] cursor-default" aria-hidden="true" />
           <div style={spotlightStyle} className="transition-all duration-300 ease-in-out" />
        </>
      )}

      {/* 2. Card */}
      <div
        ref={cardRef}
        style={{
             ...style,
             // Apply slight scale animation
             transform: isCentered
                ? 'translate(-50%, -50%)' + (isAnimating ? ' scale(0.95)' : ' scale(1)')
                : (isAnimating ? 'scale(0.98)' : 'scale(1)'),
        }}
        className="w-full max-w-md transition-all duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          {/* Progress */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg overflow-hidden">
             <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <CardHeader className="pb-2">
             <div className="flex justify-between items-start gap-2">
                <div>
                   <CardTitle className="text-lg">{step.title}</CardTitle>
                   <CardDescription className="text-xs mt-1">
                      Step {currentStep + 1} of {steps.length}
                   </CardDescription>
                </div>
                {!isLastStep && (
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSkip}>
                      <X className="h-4 w-4" />
                   </Button>
                )}
             </div>
          </CardHeader>

          <CardContent className="space-y-4">
             <p className="text-sm leading-relaxed">{step.description}</p>
             {step.image && (
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                   <Image src={step.image} alt={step.title} fill className="object-contain" />
                </div>
             )}
          </CardContent>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 pt-0">
             <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
             >
                <ArrowLeft className="mr-2 h-4 w-4" /> Prev
             </Button>

             <Button size="sm" onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
             </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TutorialOverlay;

