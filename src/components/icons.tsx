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

export function CalendarIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </Base>
  );
}

export function ClockIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function CalendarPlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18M12 14v4M10 16h4" />
    </Base>
  );
}

export function MailIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </Base>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
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

export function HangerIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 9V7.6a2 2 0 1 1 2-2" />
      <path d="M12 9 3.6 15.5a1 1 0 0 0 .6 1.8h15.6a1 1 0 0 0 .6-1.8L12 9Z" />
    </Base>
  );
}
