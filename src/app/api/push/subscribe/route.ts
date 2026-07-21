import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { limitByIp } from "@/lib/rateLimit";
import { pushSubscribeSchema } from "@/lib/validation/push";

// Store a browser's push subscription. Upsert by endpoint so re-subscribing on
// the same browser doesn't create duplicates.
export async function POST(req: NextRequest) {
  const limit = limitByIp(req, "push-subscribe", 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    const raw = await req.json();
    const result = pushSubscribeSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const endpoint = body.endpoint;
  const p256dh = body.keys.p256dh;
  const auth = body.keys.auth;

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
