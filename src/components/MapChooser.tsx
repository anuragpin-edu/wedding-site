"use client";

import { useState, useEffect } from "react";
import { mapsLink } from "@/lib/eventFormat";
import { MapPinIcon } from "@/components/icons";

type OS = "ios" | "android" | "desktop" | "unknown";

export default function MapChooser({
  address,
  venue,
  buttonClassName = "inline-flex items-center gap-1.5 text-xs text-maroon hover:underline",
  children,
}: {
  address: string;
  venue: string;
  buttonClassName?: string;
  children?: React.ReactNode;
}) {
  const [os, setOs] = useState<OS>("unknown");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Basic user agent sniffing to detect mobile OS
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setOs("ios");
    } else if (/android/.test(ua)) {
      setOs("android");
    } else {
      setOs("desktop");
    }
  }, []);

  const encodedAddress = encodeURIComponent(`${venue}, ${address}`);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (os === "ios" || os === "android") {
      setIsOpen(true);
    } else {
      // Desktop / unknown: default to Google Maps new tab
      window.open(mapsLink(address), "_blank", "noopener,noreferrer");
    }
  };

  const mapOptions = [
    ...(os === "ios"
      ? [
          {
            name: "Apple Maps",
            // Universal link for Apple Maps
            url: `https://maps.apple.com/?q=${encodedAddress}`,
          },
        ]
      : []),
    {
      name: "Google Maps",
      // Universal link for Google Maps
      url: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    },
    {
      name: "Waze",
      // Universal link for Waze
      url: `https://waze.com/ul?q=${encodedAddress}`,
    },
  ];

  return (
    <div className="relative inline-block">
      <button onClick={handleOpen} className={buttonClassName}>
        {children || (
          <>
            <MapPinIcon className="h-4 w-4" />
            Get Directions
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          {/* Invisible backdrop to catch clicks outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
          />
          
          <div
            className="absolute left-0 top-full mt-2 z-50 w-48 bg-white border border-gold/20 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gold/15 bg-cream/30">
              <p className="text-[10px] font-medium uppercase tracking-widest text-maroon/70">Open in Maps</p>
            </div>
            <div className="flex flex-col p-1.5">
              {mapOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(() => setIsOpen(false), 500)}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:bg-black/5 rounded-lg transition-colors flex items-center justify-between group"
                >
                  {option.name}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gold/60 group-hover:text-maroon transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
