import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const safeImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const activeImage = safeImages[activeIndex] || safeImages[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
      {/* Thumbnail column (desktop left or mobile bottom) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[600px] no-scrollbar py-1">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 w-16 sm:w-20 aspect-[3/4] overflow-hidden rounded-xs border transition-all cursor-pointer ${
              activeIndex === idx
                ? 'border-stone-900 dark:border-white opacity-100 ring-1 ring-stone-900 dark:ring-white shadow-md'
                : 'border-stone-200 dark:border-white/10 opacity-50 hover:opacity-90'
            }`}
            aria-label={`View image ${idx + 1}`}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main image stage with zoom */}
      <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-zinc-950 border border-stone-200 dark:border-white/10 rounded-xs group shadow-md dark:shadow-2xl">
        <div
          className="w-full h-full cursor-crosshair relative overflow-hidden"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={activeImage}
            alt={`${productName} - View ${activeIndex + 1}`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
            }}
            className={`w-full h-full object-cover object-center transition-transform duration-200 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Hover Zoom Prompt Badge */}
        <div className="absolute bottom-3 right-3 hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-white/15 backdrop-blur-xs text-stone-300 text-[10px] uppercase tracking-wider font-medium rounded-xs pointer-events-none transition-opacity group-hover:opacity-0">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Hover to zoom</span>
        </div>

        {/* Mobile / Tablet Next & Prev Controls */}
        {safeImages.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none lg:hidden">
            <button
              type="button"
              onClick={prevImage}
              className="pointer-events-auto w-9 h-9 rounded-full bg-black/80 border border-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-md active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="pointer-events-auto w-9 h-9 rounded-full bg-black/80 border border-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-md active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile dots indicator */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 lg:hidden">
          {safeImages.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeIndex === idx
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
