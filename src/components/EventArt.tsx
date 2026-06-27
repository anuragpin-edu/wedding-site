// Simple line-art emblem per celebration, drawn in currentColor.
// Haldi → ceremonial turmeric bowl (mangalasnanam); Sangeeth & Mehendi →
// clinking glasses (cheers); Wedding → interlocked rings.

type Props = { className?: string };

function Frame({ className = "h-12 w-12", children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HaldiArt(p: Props) {
  return (
    <Frame {...p}>
      <path d="M22 27c-6 3-10 9-10 16c0 8.8 8.9 15 20 15s20-6.2 20-15c0-7-4-13-10-16"/>
      <path d="M20 27h24"/>
      <path d="M18 36h28"/>
      <path d="M21 55h22"/>
      <path d="M28 43h8"/>
      <path d="M25 27c-4.5-9-12-13-20-12c6.8 4 9.7 9.5 9 16"/>
      <path d="M39 27c4.5-9 12-13 20-12c-6.8 4-9.7 9.5-9 16"/>
      <path d="M32 27c-1-8-5.3-14.2-12-18c8.5.7 14.4 6.3 12 18z"/>
      <path d="M32 27c1-8 5.3-14.2 12-18c-8.5.7-14.4 6.3-12 18z"/>
      <path d="M26 12c2.5-4 4.5-5.8 6-7c1.5 1.2 3.5 3 6 7"/>
    </Frame>
  );
}

function SangeethArt(p: Props) {
  return (
    <Frame {...p}>
      <g transform="rotate(-14 24 31)">
        <path d="M18 8h14l-2 22c-.5 5.3-4.1 8.5-5 8.5s-4.5-3.2-5-8.5L18 8z"/>
        <path d="M19 18h12"/>
        <path d="M25 38v14"/>
        <path d="M18 56h14"/>
      </g>
      <g transform="rotate(14 40 31)">
        <path d="M32 8h14l-2 22c-.5 5.3-4.1 8.5-5 8.5s-4.5-3.2-5-8.5L32 8z"/>
        <path d="M33 18h12"/>
        <path d="M39 38v14"/>
        <path d="M32 56h14"/>
      </g>
      <path d="M30 24c1.6 1.4 3.2 1.4 4.8 0"/>
      <path d="M32 6V2"/>
      <path d="M20.8 7.5l-2-3.1"/>
      <path d="M43.2 7.5l2-3.1"/>
    </Frame>
  );
}

function WeddingArt(p: Props) {
  return (
    <Frame {...p}>
      {/* Diamond */}
      <path d="M26.5 12.5h11L42 18l-10 10-10-10 4.5-5.5Z"/>
      <path d="M22 18h20"/>
      <path d="M26.5 12.5 30 18l2-5.5L34 18l3.5-5.5"/>
      <path d="M30 18l2 10 2-10"/>

      {/* Rings */}
      <circle cx="23.5" cy="40" r="14.5"/>
      <circle cx="23.5" cy="40" r="9.2"/>
      <circle cx="40.5" cy="40" r="14.5"/>
      <circle cx="40.5" cy="40" r="9.2"/>

      {/* Interlocking cuts */}
      <path d="M32 26.9c5.1 2.9 8.5 7.7 8.5 13.1S37.1 50.2 32 53.1"/>
      <path d="M32 26.9c-5.1 2.9-8.5 7.7-8.5 13.1S26.9 50.2 32 53.1"/>

      {/* Sparkles */}
      <path d="M17 18.5l-3-3"/>
      <path d="M47 18.5l3-3"/>
      <path d="M32 8V4.5"/>
    </Frame>
  );
}

export default function EventArt({ name, className }: { name: string; className?: string }) {
  if (name === "Haldi") return <HaldiArt className={className} />;
  if (name === "Sangeeth") return <SangeethArt className={className} />;
  if (name === "Wedding") return <WeddingArt className={className} />;
  return null;
}
