// Simple line-art emblem per celebration, drawn in currentColor.
// Haldi → ceremonial turmeric bowl (mangalasnanam); Sangeeth & Mehendi →
// clinking glasses (cheers); Wedding → interlocked rings.

type Props = { className?: string };

function Frame({ className = "h-12 w-12", children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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
      {/* turmeric drops */}
      <path d="M24 6c1.6 2.2 2.6 3.6 2.6 5a2.6 2.6 0 1 1-5.2 0c0-1.4 1-2.8 2.6-5Z" />
      <path d="M15 12c1 1.4 1.7 2.3 1.7 3.2a1.7 1.7 0 1 1-3.4 0c0-.9.7-1.8 1.7-3.2Z" />
      <path d="M33 12c1 1.4 1.7 2.3 1.7 3.2a1.7 1.7 0 1 1-3.4 0c0-.9.7-1.8 1.7-3.2Z" />
      {/* bowl */}
      <path d="M10 24h28" />
      <path d="M12 24a12 9 0 0 0 24 0" />
    </Frame>
  );
}

function SangeethArt(p: Props) {
  return (
    <Frame {...p}>
      {/* two clinking glasses */}
      <path d="M11 14a6 5 0 0 0 12 0" />
      <path d="M17 19V33" />
      <path d="M12 33H22" />
      <path d="M25 14a6 5 0 0 0 12 0" />
      <path d="M31 19V33" />
      <path d="M26 33H36" />
      {/* spark */}
      <path d="M24 9V13M22 11H26" />
    </Frame>
  );
}

function WeddingArt(p: Props) {
  return (
    <Frame {...p}>
      <circle cx="19" cy="28" r="9" />
      <circle cx="30" cy="28" r="9" />
      {/* little gem on the overlap */}
      <path d="M24.5 13l2 2-2 2-2-2z" />
    </Frame>
  );
}

export default function EventArt({ name, className }: { name: string; className?: string }) {
  if (name === "Haldi") return <HaldiArt className={className} />;
  if (name === "Sangeeth & Mehendi") return <SangeethArt className={className} />;
  if (name === "Wedding") return <WeddingArt className={className} />;
  return null;
}
