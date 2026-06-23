import { MailIcon } from "@/components/icons";

const contacts = [
  { name: "Anurag", email: "anuragpin.edu@gmail.com" },
  { name: "Thanmai", email: "travoori@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-cream/40">
      <div className="mx-auto max-w-5xl px-5 py-10 text-center">
        <p className="font-display text-2xl text-maroon">
          Anurag <span className="text-marigold">&amp;</span> Thanmai
        </p>
        <p className="mt-1 text-sm text-foreground/60">August 22, 2026</p>

        {/* Contact — so guests can reach us if anything on the site breaks */}
        <div className="mx-auto mt-7 max-w-lg border-t border-gold/20 pt-7">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            Questions? Reach out to us
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {contacts.map((c) => (
              <div key={c.email} className="space-y-1.5">
                <p className="font-medium text-foreground">{c.name}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center justify-center gap-2 text-sm text-foreground/70 transition-colors hover:text-maroon"
                >
                  <MailIcon className="h-3.5 w-3.5 text-gold" />
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-foreground/45">
          With love &amp; gratitude — we can&apos;t wait to celebrate with you.
        </p>
      </div>
    </footer>
  );
}
