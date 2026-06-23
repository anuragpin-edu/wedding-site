import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Emails allowed into /admin. If unset, any authenticated user is allowed
// (fine for a single-admin project, but set ADMIN_EMAILS to be explicit).
function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allow = allowedEmails();
  return allow.length === 0 || allow.includes(email.toLowerCase());
}

// Returns the current admin user, or null if not signed in / not allowlisted.
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
