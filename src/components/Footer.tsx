import { MailIcon } from "@/components/icons";

const contacts = [
  { name: "Anurag", email: "anuragpin.edu@gmail.com" },
  { name: "Thanmai", email: "travoori@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-cream/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:justify-between">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <p className="font-display text-xl text-maroon">
            Anurag <span className="text-marigold">&amp;</span> Thanmai
          </p>
          <p className="mt-0.5 text-xs text-foreground/55">August 22, 2026</p>
        </div>

        {/* Contact — mail icons, name as label, email on hover/click */}
        <div className="text-center sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            Questions? Reach out
          </p>
          <div className="mt-2 flex items-center justify-center gap-5 sm:justify-end">
            {contacts.map((c) => (
              <a
                key={c.email}
                href={`mailto:${c.email}`}
                title={c.email}
                className="inline-flex items-center gap-1.5 text-sm text-foreground/75 transition-colors hover:text-maroon"
              >
                <MailIcon className="h-4 w-4 text-gold" />
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
