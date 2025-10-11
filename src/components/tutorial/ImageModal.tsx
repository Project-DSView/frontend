'use client';
import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageModalProps } from '@/types/components/tutorial.types';

const ImageModal: React.FC<ImageModalProps> = ({ selectedImage, onClose }) => {
  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="relative max-w-7xl max-h-[95vh] p-4">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-20 p-4 bg-gray-100 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
        <div className="relative w-full h-full">
          <Image
            src={selectedImage}
            alt="Tutorial Image"
            width={1200}
            height={800}
            className="w-full h-full object-contain rounded-lg shadow-2xl"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

