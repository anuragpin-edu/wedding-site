// Small inline icons, drawn with currentColor so they match surrounding text.
// Clean line style (Lucide/Figma-fluid inspired).

type IconProps = { className?: string };

function Base({
  className = "h-4 w-4",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MapPinIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </Base>
  );
}

export function PencilIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Base>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </Base>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Base>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}
