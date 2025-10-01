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
    <main className="bg-base-100 flex min-h-screen flex-col font-sans">
      {/* Hero Section */}
      <section className="to-base-100 flex flex-grow flex-col items-center justify-center bg-gradient-to-b from-white px-6 py-16 text-center">
        <div className="mx-auto w-full max-w-screen-lg">
          <Image
            src="/logo.svg"
            alt="DSView Logo"
            width={600}
            height={150}
            className="mx-auto mb-6 h-auto max-w-[240px] object-contain md:max-w-[340px] lg:max-w-[420px]"
            priority
          />
          <p className="text-neutral mt-2 text-lg md:text-xl">
            Interactive Data Structure Visualization
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Button className="bg-secondary rounded-xl px-8 py-4 text-lg text-white shadow-lg hover:bg-orange-600">
              เข้าคอร์สเรียน
              <LogIn size={24} />
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary rounded-xl border-2 px-8 py-4 text-lg hover:text-white"
            >
              Playground
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-16">
        <article className="mx-auto grid max-w-screen-lg grid-cols-1 items-stretch gap-8 px-6 md:grid-cols-2 lg:grid-cols-4">
          <Suspense
            fallback={
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="flex space-x-2">
                  <div className="bg-primary h-3 w-3 animate-bounce rounded-full"></div>
                  <div
                    className="bg-primary h-3 w-3 animate-bounce rounded-full"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="bg-primary h-3 w-3 animate-bounce rounded-full"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            }
          >
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </Suspense>
        </article>
      </section>

      {/* DSView Content Section */}
      <section className="bg-base-100 w-full">
        <article className="mx-auto flex max-w-screen-xl flex-col gap-20 px-6 py-16">
          {/* Block 1 */}
          <div className="flex flex-col items-center gap-10 lg:flex-row">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <Image
                src="/landing/LearnPicture.png"
                alt="เรียนรู้โครงสร้างข้อมูลด้วยภาพ"
                width={600}
                height={400}
                className="mx-auto max-w-[300px] rounded-lg object-contain"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            {/* Text */}
            <div className="w-full text-center lg:w-1/2 lg:text-left">
              <h2 className="text-primary mb-4 text-xl font-bold md:text-2xl">
                เรียนรู้โครงสร้างข้อมูลด้วยภาพ
              </h2>
              <p className="text-neutral text-base leading-relaxed md:text-lg">
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
                className="mx-auto max-w-[300px] rounded-lg object-contain"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            {/* Text */}
            <div className="w-full text-center lg:w-1/2 lg:text-left">
              <h2 className="text-primary mb-4 text-xl font-bold md:text-2xl">
                ฝึกซ้ำและตรวจสอบความเข้าใจ
              </h2>
              <p className="text-neutral text-base leading-relaxed md:text-lg">
                นักเรียนสามารถฝึกซ้ำได้หลายครั้ง พร้อมระบบติดตามความก้าวหน้าและการประเมินผล
                ทำให้มั่นใจได้ว่ามีความเข้าใจจริง
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default memo(Landing);
