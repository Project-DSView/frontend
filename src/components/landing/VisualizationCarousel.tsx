'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { visualizationModes, AUTO_SWITCH_INTERVAL, IMAGE_SWITCH_INTERVAL } from '@/data';

const VisualizationCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const modeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMode = visualizationModes[activeIndex];

  // Reset progress when mode or image changes
  const resetProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  }, []);

  // Auto switch between modes
  useEffect(() => {
    if (modeIntervalRef.current) {
      clearInterval(modeIntervalRef.current);
    }

    modeIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visualizationModes.length);
      setImageIndex(0);
      resetProgress();
    }, AUTO_SWITCH_INTERVAL);

    return () => {
      if (modeIntervalRef.current) {
        clearInterval(modeIntervalRef.current);
      }
    };
  }, [resetProgress]);

  // Progress bar animation
  useEffect(() => {
    resetProgress();

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / AUTO_SWITCH_INTERVAL) * 100; // Percentage per 100ms
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [activeIndex, resetProgress]);

  // Auto switch images within current mode
  useEffect(() => {
    if (currentMode.images.length <= 1) return;

    const imageInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % currentMode.images.length);
    }, IMAGE_SWITCH_INTERVAL);

    return () => clearInterval(imageInterval);
  }, [activeIndex, currentMode.images.length]);

  const handleModeClick = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setImageIndex(0);
      resetProgress();
    },
    [resetProgress],
  );

  return (
    <section className="from-background to-gradient-start w-full bg-gradient-to-b py-20 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-screen-2xl px-6">
        {/* Mode Selector */}
        <motion.div
          className="mx-auto mb-8 flex max-w-4xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {visualizationModes.map((mode, index) => {
            const Icon = mode.icon;
            const isActive = activeIndex === index;
            return (
              <motion.button
                key={mode.id}
                onClick={() => handleModeClick(index)}
                className={`relative flex flex-1 flex-row items-center justify-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300 sm:px-3 sm:py-2 ${
                  isActive
                    ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 shadow-md'
                    : 'text-neutral/60 hover:bg-secondary/5 hover:text-secondary dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    isActive ? 'text-secondary' : 'text-neutral/60 dark:text-gray-400'
                  }`}
                />
                <h3 className="text-xs font-semibold sm:text-sm">{mode.title}</h3>
                {/* Progress Bar on active button */}
                {isActive && (
                  <div className="absolute right-0 -bottom-1 left-0 h-1 overflow-hidden rounded-full bg-gray-200/30 dark:bg-gray-700/30">
                    <motion.div
                      className="from-secondary to-secondary/80 h-full bg-gradient-to-r"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Image Carousel */}
        <motion.div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeIndex}-${imageIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative aspect-[3/2] w-full"
            >
              <Image
                src={currentMode.images[imageIndex]}
                alt={`${currentMode.title} - ${imageIndex + 1}`}
                fill
                className="object-contain p-4"
                priority={activeIndex === 0 && imageIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
              />
            </motion.div>
          </AnimatePresence>

          {/* Image Indicators (if multiple images) */}
          {currentMode.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {currentMode.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setImageIndex(idx);
                    resetProgress();
                  }}
                  className={`h-2 rounded-full transition-all ${
                    imageIndex === idx
                      ? 'w-8 bg-white shadow-lg'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Mode Indicators */}
        <motion.div
          className="mt-8 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {visualizationModes.map((_, index) => (
            <button
              key={index}
              onClick={() => handleModeClick(index)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index
                  ? 'bg-primary w-8 shadow-md'
                  : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
              }`}
              aria-label={`Switch to ${visualizationModes[index].title}`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VisualizationCarousel;
