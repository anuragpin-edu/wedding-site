"use client";

import Link from "next/link";
import { useState } from "react";

type LinkItem = {
  href: string;
  label: string;
};

export default function NavMenu({ links }: { links: LinkItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-2 text-[15px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block p-3 text-foreground/75 transition-colors hover:text-maroon"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile Hamburger Toggle */}
      <button
        className="md:hidden p-3 text-foreground/75 hover:text-maroon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-gold/15 bg-white/95 backdrop-blur-md shadow-lg md:hidden">
          <ul className="flex flex-col py-4 px-5 gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 text-lg text-foreground/80 font-medium hover:text-maroon"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
