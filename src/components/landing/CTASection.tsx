'use client';

import { motion } from 'framer-motion';
import { fadeInUpVariants, buttonVariants } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onGetStarted?: () => void;
}

const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary" />
      
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <div className="relative z-10 py-20 px-6">
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          variants={fadeInUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Main Heading */}
          <motion.div
            variants={fadeInUpVariants}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">พร้อมเริ่มต้นแล้ว</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              พร้อมเริ่มเรียนรู้
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-200">
                แล้วหรือยัง?
              </span>
            </h2>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            variants={fadeInUpVariants}
          >
            <motion.div variants={buttonVariants}>
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                 ดูตัวอย่างการใช้งาน
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Features List */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
            variants={fadeInUpVariants}
          >
            {[
              'ไม่ต้องติดตั้งซอฟต์แวร์',
              'ใช้งานได้ทันทีบนเบราว์เซอร์',
              'รองรับทุกอุปกรณ์'
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center space-x-2 text-white/90"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
