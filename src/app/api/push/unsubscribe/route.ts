import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Remove a browser's push subscription (when the guest turns updates off).
export async function POST(req: NextRequest) {
  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!body.endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }

  const supabase = createServiceClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint);
  return NextResponse.json({ ok: true });
}
