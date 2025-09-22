'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const features = [
  {
    icon: (
      <Image
        src="/landing/Easytouse.png"
        alt="ใช้งานง่าย"
        width={80}
        height={80}
        className="object-contain"
      />
    ),
    title: 'ใช้งานง่าย',
    desc: 'DSView ออกแบบมาเพื่อให้ผู้เรียนสามารถใช้งานได้ทันที ไม่ซับซ้อน',
  },
  {
    icon: (
      <Image
        src="/landing/Picture2.png"
        alt="ตรวจสอบโค้ด"
        width={80}
        height={80}
        className="object-contain"
      />
    ),
    title: 'ตรวจสอบโค้ด',
    desc: 'ระบบตรวจโครงสร้างอัตโนมัติ ช่วยลดระยะการตรวจของผู้สอน',
  },
  {
    icon: (
      <Image
        src="/landing/Picture3.png"
        alt="ฟีเจอร์ครบครัน"
        width={80}
        height={80}
        className="object-contain"
      />
    ),
    title: 'ฟีเจอร์ครบครัน',
    desc: 'ช่วยจัดการผู้เรียนได้ง่าย ตรวจสอบผู้เรียนได้ง่าย และจัดการงานแต่ละงานได้ง่าย',
  },
  {
    icon: (
      <Image
        src="/landing/Picture4.png"
        alt="เพิ่มประสิทธิภาพ"
        width={80}
        height={80}
        className="object-contain"
      />
    ),
    title: 'เพิ่มประสิทธิภาพ',
    desc: 'เพิ่มประสิทธิภาพให้กับผู้เรียน และช่วยผู้สอนสามารถติดตามได้ทั่วถึง',
  },
];

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
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-base-100 border rounded-2xl shadow-sm hover:shadow-lg flex flex-col items-center text-center h-full"
            >
              {f.icon}
              <h3 className="font-semibold text-lg mt-4 mb-2 text-primary">
                {f.title}
              </h3>
              <p className="text-sm text-neutral">{f.desc}</p>
            </motion.div>
          ))}
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

export default Landing;
