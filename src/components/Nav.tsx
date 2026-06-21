import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/registry", label: "Registry" },
  { href: "/updates", label: "Updates" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-wide text-maroon"
        >
          A <span className="text-marigold">&amp;</span> T
        </Link>
        <ul className="flex items-center gap-4 text-sm sm:gap-7 sm:text-[15px]">
          {links.slice(1).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-foreground/75 transition-colors hover:text-maroon"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
