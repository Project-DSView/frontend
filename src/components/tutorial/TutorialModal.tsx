'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageModal from './ImageModal';
import TutorialStepComponent from './TutorialStep';
import { TutorialModalProps, PlaygroundModeType } from '@/types/props/tutorial.types';
import { playgroundModes, tutorialSections } from '@/data/components/tutorial.data';

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, playgroundMode }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleImageClick = useCallback((imageSrc: string) => {
    setSelectedImage(imageSrc);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const getPlaygroundModeData = useCallback((mode: PlaygroundModeType) => {
    const modeMap = {
      dragdrop: playgroundModes[0], // Drag & Drop
      stepthrough: playgroundModes[1], // Step Through
      realtime: playgroundModes[2], // Real-time
    };
    return modeMap[mode];
  }, []);

  const getModeTitle = useCallback((mode: PlaygroundModeType) => {
    const titleMap = {
      dragdrop: 'Drag & Drop',
      stepthrough: 'Step Through',
      realtime: 'Real-time',
    };
    return titleMap[mode];
  }, []);

  const getModeDescription = useCallback((mode: PlaygroundModeType) => {
    const descMap = {
      dragdrop: 'การเรียนรู้แบบลากและวาง เหมาะสำหรับผู้เริ่มต้น',
      stepthrough: 'การเรียนรู้แบบควบคุมทีละขั้นตอน เหมาะสำหรับการเข้าใจรายละเอียด',
      realtime: 'การเรียนรู้แบบเรียลไทม์ เหมาะสำหรับการฝึกเขียนโปรแกรม',
    };
    return descMap[mode];
  }, []);

  const getHoverColor = useCallback((mode: PlaygroundModeType) => {
    const colorMap = {
      dragdrop: 'blue-400',
      stepthrough: 'green-400',
      realtime: 'purple-400',
    };
    return colorMap[mode];
  }, []);

  // Keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'Tab':
          // Trap focus within modal
          if (modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (event.shiftKey) {
              // Shift + Tab
              if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              }
            } else {
              // Tab
              if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          }
          break;
        case 'Enter':
          // Allow Enter to close modal when focus is on close button
          if (document.activeElement === closeButtonRef.current) {
            onClose();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modeData = getPlaygroundModeData(playgroundMode);
  const modeTitle = getModeTitle(playgroundMode);
  const modeDescription = getModeDescription(playgroundMode);
  const hoverColor = getHoverColor(playgroundMode);

  return (
    <>
      <ImageModal selectedImage={selectedImage} onClose={handleCloseModal} />

      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
      >
        <div
          className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
            <div>
              <h2 id="tutorial-modal-title" className="text-2xl font-bold text-gray-900">
                คู่มือการใช้งาน {modeTitle}
              </h2>
              <p className="mt-1 text-gray-600">{modeDescription}</p>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="ปิด modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Playground Mode Steps */}
            <div className="mb-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                ขั้นตอนการใช้งาน {modeTitle}
              </h3>
              <div className="space-y-6">
                {modeData.steps.map((step, index) => (
                  <TutorialStepComponent
                    key={index}
                    step={step}
                    hoverColor={hoverColor}
                    onImageClick={handleImageClick}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                  {tutorialSections[0].title}
                </CardTitle>
                <CardDescription>{tutorialSections[0].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="relative h-48 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-blue-400"
                  onClick={() => handleImageClick(tutorialSections[0].image)}
                >
                  <Image
                    src={tutorialSections[0].image}
                    alt={tutorialSections[0].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                    className="object-contain transition-transform hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  คลิกที่เมนู &quot;Playground&quot; เพื่อเข้าถึงเครื่องมือการเรียนรู้ทั้งหมด
                </p>
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-green-600" />
                  {tutorialSections[1].title}
                </CardTitle>
                <CardDescription>{tutorialSections[1].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="relative h-48 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-green-400"
                  onClick={() => handleImageClick(tutorialSections[1].image)}
                >
                  <Image
                    src={tutorialSections[1].image}
                    alt={tutorialSections[1].alt}
                    fill
                    className="object-contain transition-transform hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  กดปุ่ม Export เพื่อส่งออกผลลัพธ์ในรูปแบบต่างๆ สำหรับการบันทึกหรือแชร์
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <Button onClick={onClose} className="px-6">
                ปิด
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialModal;
