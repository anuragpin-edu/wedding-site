"use client";

import { useState, useEffect } from "react";
import MediaDisplay from "./MediaDisplay";

type MediaItem = {
  url: string;
  type: "image" | "video";
};

export default function HeroSlideshow({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  useEffect(() => {
    if (media.length === 0) return;
    const current = media[currentIndex];
    
    if (current.type === "image") {
      // 3 second timer for images
      const timer = setTimeout(() => {
        nextSlide();
      }, 3000);
      return () => clearTimeout(timer);
    }
    // For videos, we rely on the onEnded callback passed to MediaDisplay
  }, [currentIndex, media]);

  if (media.length === 0) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-950">
      {media.map((item, index) => {
        const isVisible = index === currentIndex;
        // Keep the previous and next slides in the DOM to allow for smooth 1-second crossfading
        const isPrev = index === (currentIndex - 1 + media.length) % media.length;
        const isNext = index === (currentIndex + 1) % media.length;
        const shouldRender = isVisible || isPrev || isNext;

        return (
          <div 
            key={item.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isVisible ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {shouldRender && (
              <MediaDisplay 
                url={item.url}
                type={item.type}
                autoPlay={isVisible}
                controls={false}
                onEnded={isVisible && item.type === "video" ? nextSlide : undefined}
                className="h-full w-full"
              />
            )}
          </div>
        );
      })}
      
      {/* Dark Scrim overlay for readability of elements scrolling up over it */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-20 pointer-events-none" />

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce text-white/90 pointer-events-none drop-shadow-lg">
        <span className="text-xs uppercase tracking-widest font-medium mb-2">Scroll to explore</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
