'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

// Import components
import ImageModal from '@/components/tutorial/ImageModal';
import PlaygroundModeCard from '@/components/tutorial/PlaygroundModeCard';
import DataStructureCard from '@/components/tutorial/DataStructureCard';
import LearningTipCard from '@/components/tutorial/LearningTipCard';

// Import data
import {
  dataStructures,
  learningTips,
  playgroundModes,
  tutorialSections,
} from '@/data/components/tutorial.data';

const TutorialPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <ImageModal selectedImage={selectedImage} onClose={handleCloseModal} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">คู่มือการใช้งาน Playground</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            เรียนรู้โครงสร้างข้อมูลผ่านการทดลองจริงด้วยเครื่องมือที่หลากหลาย
          </p>
        </div>

        {/* Navigation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-blue-600" />
              {tutorialSections[0].title}
            </CardTitle>
            <CardDescription>{tutorialSections[0].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-64 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-blue-400"
              onClick={() => handleImageClick(tutorialSections[0].image)}
            >
              <Image
                src={tutorialSections[0].image}
                alt={tutorialSections[0].alt}
                fill
                className="object-contain transition-transform hover:scale-105"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              คลิกที่เมนู &quot;Playground&quot; เพื่อเข้าถึงเครื่องมือการเรียนรู้ทั้งหมด
            </p>
          </CardContent>
        </Card>

        {/* Playground Modes */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            โหมดการใช้งาน Playground
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {playgroundModes.map((mode, index) => (
              <PlaygroundModeCard key={index} mode={mode} onImageClick={handleImageClick} />
            ))}
          </div>
        </div>

        {/* Export Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-green-600" />
              {tutorialSections[1].title}
            </CardTitle>
            <CardDescription>{tutorialSections[1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-64 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-green-400"
              onClick={() => handleImageClick(tutorialSections[1].image)}
            >
              <Image
                src={tutorialSections[1].image}
                alt={tutorialSections[1].alt}
                fill
                className="object-contain transition-transform hover:scale-105"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              กดปุ่ม Export เพื่อส่งออกผลลัพธ์ในรูปแบบต่างๆ สำหรับการบันทึกหรือแชร์
            </p>
          </CardContent>
        </Card>

        {/* Data Structures Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            โครงสร้างข้อมูลที่มีในระบบ
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dataStructures.map((structure, index) => (
              <DataStructureCard key={index} structure={structure} />
            ))}
          </div>
        </div>

        {/* Learning Tips Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            วิธีการเรียนรู้ที่มีประสิทธิภาพ
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {learningTips.map((tip, index) => (
              <LearningTipCard key={index} tip={tip} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
