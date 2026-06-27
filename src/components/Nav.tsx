import Link from "next/link";
import { registryEnabled } from "@/lib/features";
import { getVariantConfig, filterEventsForVariant } from "@/lib/variants";
import { getEvents } from "@/lib/getEvents";
import NavMenu from "./NavMenu";

export default async function Nav({ variant }: { variant: string }) {
  const config = getVariantConfig(variant);
  const events = await getEvents();
  const filteredEvents = filterEventsForVariant(events, config);

  const showEvents = filteredEvents.length > 1;

  const resolvePath = (path: string) => {
    return config.basePath === "/" ? path : `${config.basePath}${path}`;
  };

  const allLinks = [
    { href: config.basePath, label: "Home" },
    ...(showEvents ? [{ href: resolvePath("/events"), label: "Events" }] : []),
    { href: resolvePath("/rsvp"), label: "RSVP" },
    ...(config.showRegistry ? [{ href: resolvePath("/registry"), label: "Gift Registry" }] : []),
    { href: resolvePath("/updates"), label: "Updates" },
  ];

  // Hide the registry link when the feature is globally off (e.g. in production).
  const links = allLinks.filter(
    (l) => l.label !== "Gift Registry" || registryEnabled()
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5">
        <Link
          href={config.basePath}
          className="font-display text-xl font-semibold tracking-wide text-maroon p-2 -ml-2"
        >
          A <span className="text-marigold">&amp;</span> T
        </Link>
        <NavMenu links={links.slice(1)} />
      </nav>
    </header>
  );
}
