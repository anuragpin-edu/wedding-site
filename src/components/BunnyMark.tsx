// A small bunny silhouette that gently hops (CSS animation in globals.css).
// Pure SVG + CSS — crisp at any size, themeable, and respects reduced-motion.
export default function BunnyMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      className={`bunny-hop ${className}`}
    >
      <ellipse cx="24" cy="20" rx="6" ry="16" transform="rotate(-12 24 20)" />
      <ellipse cx="40" cy="20" rx="6" ry="16" transform="rotate(12 40 20)" />
      <circle cx="32" cy="42" r="18" />
    </svg>
  );
}
