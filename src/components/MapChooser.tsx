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
    <>
      <button onClick={handleOpen} className={buttonClassName}>
        {children || (
          <>
            <MapPinIcon className="h-4 w-4" />
            Get Directions
          </>
        )}
      </button>

      {/* Bottom Sheet / Modal Chooser */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-background border border-gold/20 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gold/15 bg-cream/40 flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-maroon">Get Directions</h3>
                <p className="text-xs text-foreground/70 truncate max-w-[250px]">{venue}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-foreground/60 hover:bg-black/5 hover:text-maroon transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col p-2">
              {mapOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3.5 text-base font-medium text-foreground hover:bg-black/5 rounded-xl transition-colors flex items-center justify-between group"
                >
                  {option.name}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold/60 group-hover:text-maroon transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
            <div className="px-4 py-3 bg-black/5 sm:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white text-maroon font-medium shadow-sm active:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
