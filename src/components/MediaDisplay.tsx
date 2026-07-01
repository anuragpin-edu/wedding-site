"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

type MediaDisplayProps = {
  url: string;
  type: "image" | "video";
  alt?: string;
  className?: string;
  controls?: boolean; // Whether the video should have controls
  autoPlay?: boolean; // Whether the foreground video should autoplay
  preload?: "auto" | "metadata" | "none"; // Preload mode for video
  onEnded?: () => void; // Callback when video finishes
  onError?: () => void; // Callback when video errors
};

export default function MediaDisplay({ 
  url, 
  type, 
  alt = "Media", 
  className = "",
  controls = true,
  autoPlay = false,
  preload = "none",
  onEnded,
  onError
}: MediaDisplayProps) {
  const shouldLoop = !onEnded && autoPlay;
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(type === "video");

  useEffect(() => {
    if (type === "video") {
      if (autoPlay) {
        videoRef.current?.play().catch(() => {
          if (onError) onError();
        });
        bgVideoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
        bgVideoRef.current?.pause();
      }
    }
  }, [autoPlay, type, onError]);

  return (
    <div 
      className={`relative overflow-hidden bg-stone-950 ${className} select-none`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Blurred Background Layer (Vibrant but slightly dim) */}
      <div className="absolute inset-0 z-0 opacity-60 blur-3xl scale-125">
        {type === "image" ? (
          <Image src={url} alt="" fill className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} priority={autoPlay} />
        ) : (
          <video 
            ref={bgVideoRef}
            src={url} 
            autoPlay={autoPlay} 
            loop={shouldLoop} 
            muted 
            playsInline 
            controlsList="nodownload"
            disablePictureInPicture
            preload={preload}
            className="h-full w-full object-cover" 
          />
        )}
      </div>

      {/* Foreground Layer (object-contain ensures portrait media is fully visible without cropping) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {type === "image" ? (
          <Image src={url} alt={alt} fill className="object-contain drop-shadow-2xl" placeholder="blur" blurDataURL={BLUR_DATA_URL} priority={autoPlay} />
        ) : (
          <div className="relative h-full w-full flex items-center justify-center">
            <video 
              ref={videoRef}
              src={`${url}#t=0.001`} 
              controls={controls} 
              autoPlay={autoPlay}
              loop={shouldLoop}
              muted
              playsInline
              controlsList="nodownload"
              disablePictureInPicture
              preload={preload}
              onEnded={onEnded}
              onError={onError}
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => setIsBuffering(false)}
              className="h-full w-full object-contain drop-shadow-2xl rounded-sm" 
            />
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-10 h-10 border-4 border-marigold/30 border-t-marigold rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
