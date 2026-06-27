import Link from "next/link";
import { cookies } from "next/headers";
import { registryEnabled } from "@/lib/features";

export default async function Nav() {
  const cookieStore = await cookies();
  const entry = cookieStore.get("entry")?.value;
  
  // If the user entered through the wedding silo, lock them into it.
  const homeHref = entry === "wedding" ? "/wedding" : "/";

  const allLinks = [
    { href: homeHref, label: "Home" },
    ...(entry !== "wedding" ? [{ href: "/events", label: "Events" }] : []),
    { href: "/rsvp", label: "RSVP" },
    { href: "/registry", label: "Gift Registry" },
    { href: "/updates", label: "Updates" },
  ];

  // Hide the registry link when the feature is off (e.g. in production).
  const links = allLinks.filter(
    (l) => l.href !== "/registry" || registryEnabled()
  );
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link
          href={homeHref}
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
