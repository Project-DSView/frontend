'use client';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageModalProps } from '@/types/components/tutorial.types';

const ImageModal: React.FC<ImageModalProps> = ({ selectedImage, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    if (selectedImage) {
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
  }, [selectedImage, onClose]);

  if (!selectedImage) return null;

  const modalContent = (
    <div 
      ref={modalRef}
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative max-h-[95vh] max-w-7xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="fixed top-4 right-4 z-20 rounded-full bg-gray-100 p-4 shadow-lg transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close modal (Press Escape or Enter)"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
        <div className="relative h-full w-full">
          <Image
            src={selectedImage}
            alt="Tutorial Image"
            width={1200}
            height={800}
            className="h-full w-full rounded-lg object-contain shadow-2xl"
            sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 70vw"
            priority
          />
        </div>
        <div className="mt-4 text-center text-sm text-white">
          <p>Press <kbd className="px-2 py-1 bg-gray-800 rounded">Esc</kbd> to close or <kbd className="px-2 py-1 bg-gray-800 rounded">Tab</kbd> to navigate</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
