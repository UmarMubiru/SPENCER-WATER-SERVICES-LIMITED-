'use client';

import { useState } from 'react';
import GalleryLightbox from './GalleryLightbox';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

interface GallerySectionProps {
  images: GalleryImage[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  if (!images.length) return null;

  return (
    <>
      <section className="section">
        <div className="section-inner">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Project Gallery</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Hide Gallery' : 'View Gallery'}
            </button>
          </div>
          
          {isExpanded && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-h-[42rem] overflow-y-auto pr-2">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative h-52 bg-gray-200 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 flex-shrink-0"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && (
        <GalleryLightbox
          images={images}
          initialIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
