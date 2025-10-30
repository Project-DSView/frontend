'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

import { staggerContainerVariants, staggerItemVariants } from '@/lib';
import { showcaseStructures } from '@/data';

import { Button } from '@/components/ui/button';

const InteractiveShowcase = () => {
  const [activeStructure, setActiveStructure] = useState('bst');

  const handleSetActiveStructure = useCallback((id: string) => {
    setActiveStructure(id);
  }, []);

  return (
    <section className="from-background to-gradient-start w-full bg-gradient-to-b py-20 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        className="mx-auto max-w-screen-xl px-6"
        variants={staggerContainerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <motion.div className="mb-16 text-center" variants={staggerItemVariants}>
          <h2 className="text-primary mb-4 text-3xl font-bold md:text-4xl">
            ดูการทำงานแบบ Interactive
          </h2>
          <p className="text-neutral mx-auto max-w-2xl text-lg md:text-xl dark:text-gray-300">
            เลือกโครงสร้างข้อมูลที่สนใจและดูการทำงานแบบภาพเคลื่อนไหว
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 items-center gap-8 md:gap-10 xl:grid-cols-2 xl:gap-12"
          variants={staggerItemVariants}
        >
          {/* Structure Selection */}
          <div className="space-y-6">
            <h3 className="text-foreground mb-6 text-2xl font-bold">เลือกโครงสร้างข้อมูล</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showcaseStructures.map((structure) => {
                const Icon = structure.icon;
                const isActive = activeStructure === structure.id;

                return (
                  <motion.button
                    key={structure.id}
                    onClick={() => handleSetActiveStructure(structure.id)}
                    className={`group relative rounded-2xl border-2 p-6 transition-all duration-300 ${
                      isActive
                        ? 'border-primary from-primary/10 to-accent/10 dark:shadow-primary/20 bg-gradient-to-br shadow-lg'
                        : 'hover:border-primary/50 border-border/50 bg-card/50 hover:bg-card/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`rounded-xl bg-gradient-to-r p-3 ${structure.color} ${
                          isActive ? 'shadow-lg' : 'shadow-md'
                        }`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4
                          className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}
                        >
                          {structure.name}
                        </h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {structure.description}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-primary/5 absolute inset-0 rounded-2xl bg-gradient-to-r"
                        layoutId="activeStructure"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <motion.div className="pt-6" variants={staggerItemVariants}>
              <Link href="/dragdrop/linklist/singly">
                <Button
                  className="from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary w-full rounded-xl bg-gradient-to-r py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                >
                  ลองใช้เลย
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Preview Area */}
          <motion.div className="relative" variants={staggerItemVariants}>
            <div className="from-background to-muted relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-2xl dark:from-gray-900 dark:to-gray-800">
              {/* Browser Header */}
              <div className="bg-muted flex items-center space-x-2 px-4 py-3 dark:bg-gray-800">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-muted-foreground text-sm font-medium">
                    DSView Playground
                  </span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="from-muted/30 to-background flex aspect-video items-center justify-center bg-gradient-to-br p-8 dark:from-gray-800/50 dark:to-gray-900">
                <motion.div
                  key={activeStructure}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div
                    className={`mx-auto mb-4 h-32 w-32 rounded-2xl bg-gradient-to-r ${
                      showcaseStructures.find((s) => s.id === activeStructure)?.color ||
                      'from-gray-400 to-gray-600'
                    } flex items-center justify-center shadow-lg`}
                  >
                    {(() => {
                      const structure = showcaseStructures.find((s) => s.id === activeStructure);
                      const Icon = structure?.icon;
                      return Icon ? <Icon className="h-16 w-16 text-white" /> : null;
                    })()}
                  </div>
                  <h4 className="text-foreground mb-2 text-xl font-bold">
                    {showcaseStructures.find((s) => s.id === activeStructure)?.name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    คลิกเพื่อดูการทำงานแบบ Interactive
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="from-primary/20 to-accent/20 absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-r blur-sm"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="from-secondary/20 to-success/20 absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-r blur-sm"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InteractiveShowcase;
