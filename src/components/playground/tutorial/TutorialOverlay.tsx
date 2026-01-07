'use client';

import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { X, ArrowRight, ArrowLeft, ChevronDown, ChevronRight, Code2, Hash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { namingGuides } from '@/data';
import { TutorialOverlayProps } from '@/types';


// Inline NamingGuideDropdown component for naming guide step
const NamingGuideDropdown: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto">
      {namingGuides.map((guide) => (
        <div key={guide.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleItem(guide.id)}
            className="flex w-full items-center justify-between p-2 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="font-bold text-gray-800 dark:text-gray-200">{guide.name}</span>
            {expandedItems[guide.id] ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedItems[guide.id] && (
            <div className="space-y-2 border-t border-gray-200 p-2 dark:border-gray-700">
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Hash className="h-3 w-3" /> Class:
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {guide.supportedClassNames.join(', ')}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Code2 className="h-3 w-3" /> Methods:
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {guide.supportedMethods.map(m => `${m}()`).join(', ')}
                </p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ ใช้ชื่อ Class หรือ Method อย่างใดอย่างหนึ่งจากด้านบน รูปจะสามารถขึ้นมาได้
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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

  const handleComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'completed');
    }
    onClose();
  }, [onClose, storageKey]);

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
  }, [currentStep, steps.length, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep]);

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
            : isAnimating
              ? 'scale(0.98)'
              : 'scale(1)',
        }}
        className="w-full max-w-2xl transition-all duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
      >
        <Card className="border-primary/20 border-2 shadow-2xl">
          {/* Progress */}
          <div className="bg-muted absolute top-0 right-0 left-0 h-1 overflow-hidden rounded-t-lg">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="mt-1 text-xs">
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
            {step.customContent === 'naming-guide' && <NamingGuideDropdown />}
            {step.image && (
              <div className="bg-muted relative h-32 w-full overflow-hidden rounded-md">
                <Image src={step.image} alt={step.title} fill className="object-contain" />
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 pt-0">
            <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={currentStep === 0}>
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
