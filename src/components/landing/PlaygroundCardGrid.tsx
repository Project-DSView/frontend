'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { playgroundIcons, PARTICLE_POSITIONS } from '@/data';
import { getProcessedPlaygroundItems } from '@/lib';

const PlaygroundCardGrid = () => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const toggleCard = useCallback((index: number) => {
    setExpandedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }, []);

  // Use stable positions per card to avoid hydration issues
  // Reduce particles from 5 to 3 for better performance
  const cardParticlePositions = useMemo(() => PARTICLE_POSITIONS.slice(0, 3), []);

  // Use pre-processed items from lib
  const processedItems = useMemo(() => getProcessedPlaygroundItems(), []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {processedItems.map((item, index) => {
          const config = playgroundIcons[item.title as keyof typeof playgroundIcons];
          const { Icon, gradient, bgGradient } = config;
          const links = item.links;
          const isExpanded = expandedCards.includes(index);
          const showLinks = links.slice(0, 3);
          const hiddenLinks = links.slice(3);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border-2 border-white/40 bg-gradient-to-br from-white/30 via-white/20 to-white/10 shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-white/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:border-gray-700/50 dark:bg-gradient-to-br dark:from-gray-800/50 dark:via-gray-900/50 dark:to-gray-950/50"
            >
              {/* Animated Gradient Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Floating Particles Effect - Disabled if user prefers reduced motion */}
              {!shouldReduceMotion && (
                <div className="absolute inset-0 overflow-hidden">
                  {cardParticlePositions.map((pos, i) => (
                    <motion.div
                      key={`${index}-${i}`}
                      className={`absolute h-2 w-2 rounded-full bg-gradient-to-r ${gradient} opacity-30`}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, pos.offsetX, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: pos.duration,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut',
                      }}
                      style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Card Content */}
              <div className="relative z-10 flex h-full flex-col p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`rounded-2xl bg-gradient-to-br ${gradient} p-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    </motion.div>
                    <div>
                      <h3
                        className={`bg-gradient-to-r text-lg font-bold ${gradient} bg-clip-text text-transparent sm:text-xl`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex-1 space-y-2">
                  {showLinks.map((link, linkIndex) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + linkIndex * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`group/link block rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:shadow-lg sm:text-base ${
                          index === 0
                            ? 'text-foreground bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20'
                            : index === 1
                              ? 'text-foreground bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20'
                              : 'text-foreground bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradient} opacity-60 transition-opacity group-hover/link:opacity-100`}
                          />
                          <span className="font-medium">{link.label}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Expandable section */}
                  {hiddenLinks.length > 0 && (
                    <div className="overflow-hidden transition-all duration-300">
                      <div
                        className={`${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="space-y-2 pt-2">
                          {hiddenLinks.map((link, linkIndex) => (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
                              transition={{ duration: 0.3, delay: linkIndex * 0.05 }}
                            >
                              <Link
                                href={link.href}
                                className={`group/link block rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:shadow-lg sm:text-base ${
                                  index === 0
                                    ? 'text-foreground bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20'
                                    : index === 1
                                      ? 'text-foreground bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20'
                                      : 'text-foreground bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradient} opacity-60 transition-opacity group-hover/link:opacity-100`}
                                  />
                                  <span className="font-medium">{link.label}</span>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Toggle button */}
                  {hiddenLinks.length > 0 && (
                    <motion.button
                      onClick={() => toggleCard(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradient} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:text-base`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>Show More ({hiddenLinks.length})</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Shine effect on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaygroundCardGrid;
