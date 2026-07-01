export default function TraditionAccent({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mx-auto opacity-80 ${className}`}
      aria-hidden="true"
    >
      {/* A delicate, symmetrical flourish with a subtle paisley/mango-leaf hint */}
      <path d="M10 20 Q 25 10, 40 20 T 50 15 T 60 20 T 75 10 T 90 20" />
      <path d="M45 25 Q 50 35, 55 25" />
      <circle cx="50" cy="15" r="2" fill="currentColor" stroke="none" />
      <circle cx="25" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="75" cy="15" r="1" fill="currentColor" stroke="none" />
      
      {/* Tiny decorative leaves */}
      <path d="M35 18 Q 38 12, 42 16" />
      <path d="M65 18 Q 62 12, 58 16" />
    </svg>
  );
}
