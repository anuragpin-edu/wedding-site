"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type MediaDisplayProps = {
  url: string;
  type: "image" | "video";
  alt?: string;
  className?: string;
  controls?: boolean; // Whether the video should have controls
  autoPlay?: boolean; // Whether the foreground video should autoplay
  onEnded?: () => void; // Callback when video finishes
};

export default function MediaDisplay({ 
  url, 
  type, 
  alt = "Media", 
  className = "",
  controls = true,
  autoPlay = false,
  onEnded
}: MediaDisplayProps) {
  const shouldLoop = !onEnded && autoPlay;
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === "video") {
      if (autoPlay) {
        // Use catch to prevent unhandled promise rejections if play is interrupted
        videoRef.current?.play().catch(() => {});
        bgVideoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
        bgVideoRef.current?.pause();
      }
    }
  }, [autoPlay, type]);

  return (
    <div className={`relative overflow-hidden bg-stone-950 ${className}`}>
      {/* Blurred Background Layer (Vibrant but slightly dim) */}
      <div className="absolute inset-0 z-0 opacity-60 blur-3xl scale-125">
        {type === "image" ? (
          <Image src={url} alt="" fill className="object-cover" />
        ) : (
          <video 
            ref={bgVideoRef}
            src={url} 
            autoPlay={autoPlay} 
            loop={shouldLoop} 
            muted 
            playsInline 
            className="h-full w-full object-cover" 
          />
        )}
      </div>

      {/* Foreground Layer (object-contain ensures portrait media is fully visible without cropping) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {type === "image" ? (
          <Image src={url} alt={alt} fill className="object-contain drop-shadow-2xl" />
        ) : (
          <video 
            ref={videoRef}
            src={url} 
            controls={controls} 
            autoPlay={autoPlay}
            loop={shouldLoop}
            muted={autoPlay}
            playsInline
            onEnded={onEnded}
            className="h-full w-full object-contain drop-shadow-2xl rounded-sm" 
          />
        )}
      </div>
    </div>
  );
}
