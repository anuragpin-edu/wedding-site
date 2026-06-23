import { getAdminUser } from "@/lib/admin";
import ProfileForm from "@/components/admin/ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfile() {
  const user = await getAdminUser();
  const currentName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon">Profile</h1>
        <p className="mt-1 text-sm text-foreground/60">{user?.email}</p>
      </div>
      <ProfileForm currentName={currentName} />
    </div>
  );
}
