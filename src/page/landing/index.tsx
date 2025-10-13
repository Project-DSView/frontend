'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LogIn, ChevronDown } from 'lucide-react';
import { memo, lazy, Suspense } from 'react';
import { features } from '@/data';
import useAuth from '@/hooks/auth/useAuth';
import { AuthService } from '@/services';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { heroVariants, heroChildVariants, buttonVariants } from '@/lib/animations';

// Lazy load components
const FeatureCard = lazy(() => import('@/components/card'));
const InteractiveShowcase = lazy(() => import('@/components/landing/InteractiveShowcase'));
const CTASection = lazy(() => import('@/components/landing/CTASection'));

const Landing = () => {
  const { profile, isInitialized } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await AuthService.getGoogleAuthUrl();
      if (response.success && response.data.auth_url) {
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoToCourse = () => {
    router.push('/course');
  };

  return (
    <main className="bg-base-100 flex min-h-screen flex-col font-sans">
      {/* Hero Section */}
      <section className="relative flex flex-grow flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        {/* Animated Gradient Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#F8F9FC] via-[#EEF2FF] to-[#F8F9FC]"
          variants={heroVariants}
          initial="initial"
          animate="animate"
        />
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-secondary/20 to-success/20 rounded-full blur-xl"
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          className="relative mx-auto w-full max-w-screen-lg z-10"
          variants={heroVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={heroChildVariants}>
            <Image
              src="/logo.svg"
              alt="DSView Logo"
              width={600}
              height={150}
              className="mx-auto mb-8 h-auto max-w-[280px] object-contain md:max-w-[380px] lg:max-w-[480px] animate-float"
              priority
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 380px, 480px"
            />
          </motion.div>
          
          <motion.h1 
            className="gradient-text mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
            variants={heroChildVariants}
          >
            DSView
          </motion.h1>
          
          <motion.p 
            className="text-neutral mb-2 text-xl font-medium md:text-2xl"
            variants={heroChildVariants}
          >
            Interactive Data Structure Visualization
          </motion.p>
          
          <motion.p 
            className="text-neutral/80 mb-12 text-lg md:text-xl max-w-2xl mx-auto"
            variants={heroChildVariants}
          >
            เรียนรู้โครงสร้างข้อมูลด้วยภาพเคลื่อนไหวแบบ Interactive ที่เข้าใจง่ายและสนุกสนาน
          </motion.p>
          
          <motion.div 
            className="flex justify-center gap-6"
            variants={heroChildVariants}
          >
            {!isInitialized && (
              <div className="flex items-center justify-center">
                <span className="text-neutral">กำลังตรวจสอบ...</span>
              </div>
            )}

            {isInitialized && !profile && (
              <motion.div variants={buttonVariants}>
                <Button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary rounded-xl px-10 py-5 text-xl text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  เข้าสู่ระบบ
                  <LogIn size={24} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {isInitialized && profile && (
              <motion.div variants={buttonVariants}>
                <Button
                  onClick={handleGoToCourse}
                  className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary rounded-xl px-10 py-5 text-xl text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  เข้าคอร์สเรียน
                  <LogIn size={24} className="ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-neutral/60 w-8 h-8" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gradient-to-b from-[#F8F9FC] to-white py-20">
        <motion.div 
          className="mx-auto max-w-screen-xl px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="gradient-text text-3xl font-bold mb-4 md:text-4xl">
              ทำไมต้องเลือก DSView?
            </h2>
            <p className="text-neutral text-lg md:text-xl max-w-2xl mx-auto">
              เครื่องมือที่ออกแบบมาเพื่อการเรียนรู้โครงสร้างข้อมูลอย่างมีประสิทธิภาพ
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Suspense
              fallback={
                <div className="col-span-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-48 w-full animate-pulse rounded-2xl bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-sm border border-white/30"></div>
                  ))}
                </div>
              }
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <FeatureCard feature={feature} index={idx} />
                </motion.div>
              ))}
            </Suspense>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Showcase Section */}
      <Suspense fallback={<div className="h-96 bg-gradient-to-b from-white to-[#F8F9FC]" />}>
        <InteractiveShowcase />
      </Suspense>


      {/* CTA Section */}
      <Suspense fallback={<div className="h-64 bg-gradient-to-br from-primary via-accent to-secondary" />}>
        <CTASection onGetStarted={profile ? handleGoToCourse : handleLogin} />
      </Suspense>
    </main>
  );
};

export default memo(Landing);
