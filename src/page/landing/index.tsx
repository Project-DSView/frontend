'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LogIn } from 'lucide-react';
import { memo, lazy, Suspense } from 'react';
import { features } from '@/data';

// Lazy load components
const FeatureCard = lazy(() => import('@/components/card'));

const Landing = () => {

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base-100">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-grow px-6 py-16 bg-gradient-to-b from-white to-base-100">
        <div className="max-w-screen-lg mx-auto w-full">
          <Image
            src="/logo.svg"
            alt="DSView Logo"
            width={600}
            height={150}
            className="mb-6 h-auto max-w-[240px] md:max-w-[340px] lg:max-w-[420px] object-contain mx-auto"
            priority
          />
          <p className="mt-2 text-lg text-neutral md:text-xl">
            Interactive Data Structure Visualization
          </p>
          <div className="mt-6 flex gap-6 justify-center">
            <Button className="bg-secondary hover:bg-orange-600 text-white px-8 py-4 text-lg shadow-lg rounded-xl">
              เข้าคอร์สเรียน
              <LogIn size={24} />
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl"
            >
              Playground
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 items-stretch">
          <Suspense fallback={
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          }>
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* DSView Content Section */}
      <section className="w-full bg-base-100">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-20 px-6 py-16">
          {/* Block 1 */}
          <div className="flex flex-col items-center gap-10 lg:flex-row">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <Image
                src="/landing/LearnPicture.png"
                alt="เรียนรู้โครงสร้างข้อมูลด้วยภาพ"
                width={600}
                height={400}
                className="rounded-lg object-contain mx-auto max-w-[300px]"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            {/* Text */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-primary">
                เรียนรู้โครงสร้างข้อมูลด้วยภาพ
              </h2>
              <p className="text-neutral text-base md:text-lg leading-relaxed">
                ระบบ DSView ช่วยให้ผู้เรียนเข้าใจโครงสร้างข้อมูลซับซ้อนผ่านภาพและแอนิเมชันแบบ
                Interactive ซึ่งช่วยลดความยากและทำให้การเรียนสนุกขึ้น
              </p>
            </div>
          </div>

          {/* Block 2 */}
          <div className="flex flex-col items-center gap-10 lg:flex-row-reverse">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <Image
                src="/landing/Understand.png"
                alt="ฝึกซ้ำและตรวจสอบความเข้าใจ"
                width={600}
                height={400}
                className="rounded-lg object-contain mx-auto max-w-[300px]"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            {/* Text */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-primary">
                ฝึกซ้ำและตรวจสอบความเข้าใจ
              </h2>
              <p className="text-neutral text-base md:text-lg leading-relaxed">
                นักเรียนสามารถฝึกซ้ำได้หลายครั้ง พร้อมระบบติดตามความก้าวหน้าและการประเมินผล
                ทำให้มั่นใจได้ว่ามีความเข้าใจจริง
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(Landing);
