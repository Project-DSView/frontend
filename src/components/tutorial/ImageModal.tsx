'use client';
import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageModalProps } from '@/types/components/tutorial.types';

const ImageModal: React.FC<ImageModalProps> = ({ selectedImage, onClose }) => {
  if (!selectedImage) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative max-h-[95vh] max-w-7xl p-4">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-20 rounded-full bg-gray-100 p-4 shadow-lg transition-colors hover:bg-gray-200"
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
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
