'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { memo, lazy, Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks';
import { AuthService } from '@/services';
import { heroVariants, heroChildVariants, buttonVariants } from '@/lib';

import { Button } from '@/components/ui/button';

// Lazy load components
const InteractiveShowcase = lazy(() => import('@/components/landing/InteractiveShowcase'));
const CTASection = lazy(() => import('@/components/landing/CTASection'));
const VisualizationCarousel = lazy(() => import('@/components/landing/VisualizationCarousel'));

const Landing = () => {
  const { profile, isInitialized } = useAuth();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation values based on scroll (clamp between 0 and 150)
  const scrollProgress = Math.min(scrollY / 150, 1);
  const logoScale = 1 - scrollProgress * 0.6; // Scale down to 40%
  const logoOpacity = Math.max(0, 1 - scrollProgress * 1.2); // Fade out faster
  const logoY = -scrollProgress * 30; // Move up slightly

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
          className="from-gradient-start to-gradient-end absolute inset-0 bg-gradient-to-br via-[#EEF2FF] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
          variants={heroVariants}
          initial="initial"
          animate="animate"
        />

        {/* Floating Elements */}
        <motion.div
          className="from-primary/20 to-accent/20 absolute top-20 left-10 h-20 w-20 rounded-full bg-gradient-to-r blur-xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="from-secondary/20 to-success/20 absolute right-10 bottom-20 h-32 w-32 rounded-full bg-gradient-to-r blur-xl"
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-10 mx-auto w-full max-w-screen-lg"
          variants={heroVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={heroChildVariants}
            animate={{
              scale: logoScale,
              opacity: logoOpacity,
              y: logoY,
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut',
            }}
          >
            <Image
              src="/logo.svg"
              alt="DSView Logo"
              width={600}
              height={150}
              className="animate-float mx-auto mb-8 h-auto max-w-[280px] object-contain md:max-w-[380px] lg:max-w-[480px]"
              priority
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 380px, 480px"
            />
          </motion.div>

          <motion.h1
            className="text-primary mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
            variants={heroChildVariants}
          >
            DSView
          </motion.h1>

          <motion.p
            className="text-neutral mb-2 text-xl font-medium md:text-2xl dark:text-gray-300"
            variants={heroChildVariants}
          >
            Interactive Data Structure Visualization
          </motion.p>

          <motion.p
            className="text-neutral/80 mx-auto mb-12 max-w-2xl text-lg md:text-xl dark:text-gray-400"
            variants={heroChildVariants}
          >
            เรียนรู้โครงสร้างข้อมูลด้วยภาพเคลื่อนไหวแบบ Interactive ที่เข้าใจง่ายและสนุกสนาน
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            variants={heroChildVariants}
          >
            {!isInitialized && (
              <div className="flex items-center justify-center">
                <span className="text-neutral dark:text-gray-300">กำลังตรวจสอบ...</span>
              </div>
            )}

            {isInitialized && !profile && (
              <>
                <motion.div variants={buttonVariants}>
                  <Button
                    onClick={handleLogin}
                    className="from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary rounded-xl bg-gradient-to-r px-10 py-5 text-xl text-white shadow-xl transition-all duration-300 hover:shadow-2xl"
                  >
                    <LogIn size={24} className="mr-2" />
                    เข้าสู่ระบบ
                  </Button>
                </motion.div>
              </>
            )}

            {isInitialized && profile && (
              <>
                <motion.div variants={buttonVariants}>
                  <Button
                    onClick={handleGoToCourse}
                    className="from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary rounded-xl bg-gradient-to-r px-10 py-5 text-xl text-white shadow-xl transition-all duration-300 hover:shadow-2xl"
                  >
                    <LogIn size={24} className="mr-2" />
                    เข้าคอร์สเรียน
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Visualization Carousel Section */}
      <Suspense fallback={<div className="h-96 bg-gradient-to-b from-white to-[#F8F9FC]" />}>
        <VisualizationCarousel />
      </Suspense>

      {/* Interactive Showcase Section */}
      <Suspense fallback={<div className="h-96 bg-gradient-to-b from-white to-[#F8F9FC]" />}>
        <InteractiveShowcase />
      </Suspense>

      {/* CTA Section */}
      <Suspense
        fallback={<div className="from-primary via-accent to-secondary h-64 bg-gradient-to-br" />}
      >
        <CTASection onGetStarted={profile ? handleGoToCourse : handleLogin} />
      </Suspense>
    </main>
  );
};

export default memo(Landing);
