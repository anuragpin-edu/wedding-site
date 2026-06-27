import Link from "next/link";
import { registryEnabled } from "@/lib/features";

export default function Nav({ silo }: { silo: "main" | "wedding" }) {
  // If the user is in the wedding silo, lock them into it.
  const homeHref = silo === "wedding" ? "/wedding" : "/";
  const rsvpHref = silo === "wedding" ? "/wedding/rsvp" : "/rsvp";
  const registryHref = silo === "wedding" ? "/wedding/registry" : "/registry";
  const updatesHref = silo === "wedding" ? "/wedding/updates" : "/updates";

  const allLinks = [
    { href: homeHref, label: "Home" },
    ...(silo === "main" ? [{ href: "/events", label: "Events" }] : []),
    { href: rsvpHref, label: "RSVP" },
    { href: registryHref, label: "Gift Registry" },
    { href: updatesHref, label: "Updates" },
  ];

  // Hide the registry link when the feature is off (e.g. in production).
  const links = allLinks.filter(
    (l) => l.href !== registryHref || registryEnabled()
  );
  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5">
        <Link
          href={homeHref}
          className="font-display text-xl font-semibold tracking-wide text-maroon p-2 -ml-2"
        >
          A <span className="text-marigold">&amp;</span> T
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2 text-sm sm:text-[15px]">
          {links.slice(1).map((l) => (
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
      </nav>
    </header>
  );
}
