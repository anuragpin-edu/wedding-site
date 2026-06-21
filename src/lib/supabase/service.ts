import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. This bypasses RLS,
// so it must NEVER be imported into a client component. Use it only inside
// API route handlers / server code that has already authorized the request
// (e.g. verified the invite_code). The guest tables (parties, guests,
// event_attendance) are deny-by-default under RLS and are reached only here.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
