import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface PointerArrowProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  isAnimating: boolean;
  label?: string;
  color?: string;
  onAnimationComplete?: () => void;
}

/**
 * PointerArrow Component
 * Animated pointer arrow ที่เคลื่อนที่ได้เมื่อ traverse nodes
 * ใช้ GSAP สำหรับ smooth animation
 */
const PointerArrow: React.FC<PointerArrowProps> = ({
  fromPosition,
  toPosition,
  isAnimating,
  label = 'current',
  color = '#3B82F6', // Blue-500
  onAnimationComplete,
}) => {
  const arrowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arrowRef.current || !isAnimating) return;

    const arrow = arrowRef.current;
    const labelEl = labelRef.current;

    // Animate from fromPosition to toPosition
    const tl = gsap.timeline({
      onComplete: () => {
        onAnimationComplete?.();
      },
    });

    // Start from the current position
    gsap.set(arrow, {
      x: fromPosition.x,
      y: fromPosition.y,
      opacity: 1,
    });

    if (labelEl) {
      gsap.set(labelEl, {
        x: fromPosition.x,
        y: fromPosition.y + 40,
        opacity: 1,
      });
    }

    // Animate to new position with a smooth curve
    tl.to(arrow, {
      x: toPosition.x,
      y: toPosition.y,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    if (labelEl) {
      tl.to(
        labelEl,
        {
          x: toPosition.x,
          y: toPosition.y + 40,
          duration: 0.6,
          ease: 'power2.inOut',
        },
        '<',
      ); // Start at the same time
    }

    return () => {
      tl.kill();
    };
  }, [fromPosition, toPosition, isAnimating, onAnimationComplete]);

  if (!isAnimating) return null;

  return (
    <>
      {/* Arrow pointer */}
      <div
        ref={arrowRef}
        className="pointer-events-none absolute z-20"
        style={{
          transform: `translate(${fromPosition.x}px, ${fromPosition.y}px)`,
        }}
      >
        <div className="flex flex-col items-center">
          {/* Arrow head pointing up */}
          <div
            className="h-0 w-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `12px solid ${color}`,
            }}
          />
          {/* Arrow stem */}
          <div
            className="w-1 rounded-b"
            style={{
              height: '20px',
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute z-20 -translate-x-1/2"
        style={{
          transform: `translate(${fromPosition.x}px, ${fromPosition.y + 40}px)`,
        }}
      >
        <span
          className="rounded px-2 py-1 text-sm font-semibold whitespace-nowrap"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </>
  );
};

export default PointerArrow;
