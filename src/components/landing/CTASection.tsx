'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUpVariants, buttonVariants } from '@/lib';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CTASectionProps } from '@/types';

const CTASection = ({}: CTASectionProps) => {
  const [particles, setParticles] = useState<Array<{ left: string; top: string }>>([]);

  useEffect(() => {
    // Generate particles positions on client side only
    const newParticles = Array.from({ length: 6 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="from-primary via-accent to-secondary absolute inset-0 bg-gradient-to-br" />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-white/20"
          style={{
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 px-6 py-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={fadeInUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Main Heading */}
          <motion.div variants={fadeInUpVariants} className="mb-8">
            <motion.div
              className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">พร้อมเริ่มต้นแล้ว</span>
            </motion.div>

            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              พร้อมเริ่มเรียนรู้
              <br />
              <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                แล้วหรือยัง?
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              เข้าร่วมกับนักเรียนหลายพันคนที่ใช้ DSView
              เพื่อเรียนรู้โครงสร้างข้อมูลอย่างมีประสิทธิภาพ
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeInUpVariants}
          >
            <motion.div variants={buttonVariants}>
              <Button
                asChild
                size="lg"
                className="text-primary group rounded-xl bg-white px-8 py-4 font-semibold shadow-xl transition-all duration-300 hover:bg-white/90 hover:shadow-2xl"
              >
                <Link href="/tutorial">
                  ดูตัวอย่างการใช้งาน
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3"
            variants={fadeInUpVariants}
          >
            {['ไม่ต้องติดตั้งซอฟต์แวร์', 'ใช้งานได้ทันทีบนเบราว์เซอร์', 'รองรับทุกอุปกรณ์'].map(
              (feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center space-x-2 text-white/90"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <span className="text-sm font-medium">{feature}</span>
                </motion.div>
              ),
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
