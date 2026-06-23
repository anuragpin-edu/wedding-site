import { getAdminUser } from "@/lib/admin";
import ProfileForm from "@/components/admin/ProfileForm";

export const dynamic = "force-dynamic";

function initials(name: string, email: string) {
  const src = name.trim() || email;
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default async function AdminProfile() {
  const user = await getAdminUser();
  const email = user?.email ?? "";
  const currentName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon font-display text-xl font-semibold text-cream">
          {initials(currentName, email)}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-maroon">
            {currentName || "Admin"}
          </h1>
          <p className="text-sm text-foreground/55">{email}</p>
        </div>
      </div>

      <ProfileForm currentName={currentName} />
    </div>
  );
}
