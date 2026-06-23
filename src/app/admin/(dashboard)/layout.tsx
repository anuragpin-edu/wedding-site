import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/registry", label: "Registry" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/profile", label: "Profile" },
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-5">
            <span className="font-display text-lg font-semibold text-maroon">
              Wedding Admin
            </span>
            <nav className="flex gap-4 text-sm">
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
          <div className="flex items-center gap-3 text-sm">
            <span className="text-foreground/60">{displayName}</span>
            <form action={signOut}>
              <button className="rounded-full border border-maroon/30 px-3 py-1 text-maroon hover:bg-maroon/5">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
