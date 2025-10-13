'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUpVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Code, GitBranch, Layers, Network } from 'lucide-react';

const structures = [
  {
    id: 'bst',
    name: 'Binary Search Tree',
    icon: GitBranch,
    description: 'โครงสร้างข้อมูลแบบต้นไม้ที่ช่วยในการค้นหาอย่างมีประสิทธิภาพ',
    preview: '/landing/LearnPicture.png',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'graph',
    name: 'Graph',
    icon: Network,
    description: 'โครงสร้างข้อมูลแบบกราฟสำหรับแสดงความสัมพันธ์ระหว่างข้อมูล',
    preview: '/landing/Understand.png',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'linkedlist',
    name: 'Linked List',
    icon: GitBranch,
    description: 'โครงสร้างข้อมูลแบบลิงก์ลิสต์ที่เชื่อมต่อข้อมูลแบบต่อเนื่อง',
    preview: '/landing/Easytouse.png',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'stack',
    name: 'Stack',
    icon: Layers,
    description: 'โครงสร้างข้อมูลแบบสแต็กที่ทำงานแบบ LIFO (Last In First Out)',
    preview: '/landing/Picture2.png',
    color: 'from-orange-500 to-red-500'
  }
];

const InteractiveShowcase = () => {
  const [activeStructure, setActiveStructure] = useState('bst');

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#F8F9FC] py-20">
      <motion.div 
        className="mx-auto max-w-screen-xl px-6"
        variants={staggerContainerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <motion.div 
          className="text-center mb-16"
          variants={staggerItemVariants}
        >
          <h2 className="gradient-text text-3xl font-bold mb-4 md:text-4xl">
            ดูการทำงานแบบ Interactive
          </h2>
          <p className="text-neutral text-lg md:text-xl max-w-2xl mx-auto">
            เลือกโครงสร้างข้อมูลที่สนใจและดูการทำงานแบบภาพเคลื่อนไหว
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={staggerItemVariants}
        >
          {/* Structure Selection */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary mb-6">
              เลือกโครงสร้างข้อมูล
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {structures.map((structure) => {
                const Icon = structure.icon;
                const isActive = activeStructure === structure.id;
                
                return (
                  <motion.button
                    key={structure.id}
                    onClick={() => setActiveStructure(structure.id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg' 
                        : 'border-white/20 bg-white/50 hover:border-primary/50 hover:bg-white/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${structure.color} ${
                        isActive ? 'shadow-lg' : 'shadow-md'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className={`font-semibold ${
                          isActive ? 'text-primary' : 'text-neutral'
                        }`}>
                          {structure.name}
                        </h4>
                        <p className="text-sm text-neutral/70 mt-1">
                          {structure.description}
                        </p>
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5"
                        layoutId="activeStructure"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <motion.div 
              className="pt-6"
              variants={staggerItemVariants}
            >
              <Button 
                className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Code className="w-5 h-5 mr-2" />
                ลองใช้เลย
              </Button>
            </motion.div>
          </div>

          {/* Preview Area */}
          <motion.div 
            className="relative"
            variants={staggerItemVariants}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50">
              {/* Browser Header */}
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-600 font-medium">
                    DSView Playground
                  </span>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-white p-8 flex items-center justify-center">
                <motion.div
                  key={activeStructure}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`w-32 h-32 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${
                    structures.find(s => s.id === activeStructure)?.color || 'from-gray-400 to-gray-600'
                  } flex items-center justify-center shadow-lg`}>
                    {(() => {
                      const structure = structures.find(s => s.id === activeStructure);
                      const Icon = structure?.icon || Code;
                      return <Icon className="w-16 h-16 text-white" />;
                    })()}
                  </div>
                  <h4 className="text-xl font-bold text-primary mb-2">
                    {structures.find(s => s.id === activeStructure)?.name}
                  </h4>
                  <p className="text-neutral text-sm">
                    คลิกเพื่อดูการทำงานแบบ Interactive
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-sm"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-secondary/20 to-success/20 rounded-full blur-sm"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
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
