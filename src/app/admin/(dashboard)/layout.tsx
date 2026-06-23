import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/registry", label: "Registry" },
  { href: "/admin/announcements", label: "Announcements" },
];

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || user.email;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gold/20 bg-cream/40">
        <div className="mx-auto max-w-3xl px-5">
          {/* Top row: brand + account */}
          <div className="flex items-center justify-between gap-4 py-3">
            <Link
              href="/admin"
              className="font-display text-lg font-semibold tracking-wide text-maroon"
            >
              Wedding Admin
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/profile"
                className="text-foreground/60 transition-colors hover:text-maroon"
              >
                {displayName}
              </Link>
              <form action={signOut}>
                <button className="rounded-full border border-maroon/30 px-3.5 py-1 text-maroon transition-colors hover:bg-maroon/5">
                  Sign out
                </button>
              </form>
            </div>
          </div>
          {/* Nav row */}
          <nav className="flex flex-wrap gap-6 pb-2 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-foreground/70 transition-colors hover:text-maroon"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
