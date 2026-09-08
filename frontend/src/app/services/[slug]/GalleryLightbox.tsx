'use client';

import { useState, useEffect } from 'react';

interface GalleryImage {
  id: number;
  url: string;
  name: string;
  alt_text: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
  initialIndex?: number;
  onClose: () => void;
}

export default function GalleryLightbox({ images, initialIndex = 0, onClose }: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    const currentImage = images[currentIndex];
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentImage.name || 'gallery-image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.10) 100%), rgba(0, 0, 0, 0.40)'
    }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-2 hover:bg-black/50"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-3 hover:bg-black/50"
        aria-label="Previous image"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-3 hover:bg-black/50"
        aria-label="Next image"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-5xl max-h-[90vh] w-full flex flex-col items-center relative z-10">
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/10">
          <img
            src={currentImage.url}
            alt={currentImage.alt_text || currentImage.name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-white text-sm font-medium">{currentImage.alt_text || currentImage.name}</p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
        <div className="mt-2 text-white/70 text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
