import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Store a browser's push subscription. Upsert by endpoint so re-subscribing on
// the same browser doesn't create duplicates.
export async function POST(req: NextRequest) {
  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    userAgent?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { endpoint, p256dh, auth, user_agent: body.userAgent ?? null },
      { onConflict: "endpoint" }
    );

  if (error) {
    return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
