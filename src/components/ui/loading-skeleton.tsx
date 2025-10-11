import React from 'react';
import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width,
  height,
  children,
}) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '100%',
      }}
    >
      {children}
    </div>
  );
};

// Predefined skeleton components for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton className={clsx('h-64', className)} />
);

export const ImageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton className={clsx('h-32 w-full', className)} />
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <LoadingSkeleton
        key={i}
        height="1rem"
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton className={clsx('h-10 w-24', className)} />
);

export default LoadingSkeleton;
