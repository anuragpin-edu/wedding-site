"use client";

import { useEffect, useRef, useState } from "react";
import { Stream } from "@cloudflare/stream-react";

type StreamVideoProps = {
  videoId: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  title?: string;
};

export default function StreamVideo({
  videoId,
  autoplay = false,
  loop = false,
  muted = true,
  controls = false,
  className = "",
  title = "Video",
}: StreamVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!autoplay); // If not autoplaying, we can just load it.

  useEffect(() => {
    if (!autoplay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            // Optionally pause or unload when out of view.
            // For now, we'll just keep it in view once loaded, 
            // the Stream player handles pausing automatically in some cases,
            // or we could pause it if we had a ref to the player.
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [autoplay]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {inView && (
        <Stream
          src={videoId}
          autoplay={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          responsive={true}
          title={title}
          className="absolute top-0 left-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
