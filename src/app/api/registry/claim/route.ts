import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { HOLD_HOURS } from "@/lib/registry";
import { limitByIp, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { claimSubmitSchema } from "@/lib/validation/registry";

// Claim a registry item as either a soft "planning" hold (auto-expires after
// HOLD_HOURS) or a permanent "purchased". The grab against registry_items is
// conditional so concurrent claims can't both win:
//   - planning  → only if the item is available or its prior hold has expired
//   - purchased → as long as it isn't already purchased (a real purchase wins
//     over anyone's soft hold)
export async function POST(req: NextRequest) {
  const limit = limitByIp(req, "registry-claim", 15, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    const raw = await req.json();
    const result = claimSubmitSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.turnstile_token, getClientIp(req)))) {
    return NextResponse.json(
      { error: "Spam check failed. Please refresh and try again." },
      { status: 400 }
    );
  }

  const name = body.claimer_name;
  const email = body.claimer_email;
  const phone = body.claimer_phone;
  const message = body.claimer_message;
  const orderId = body.order_id;
  const intent = body.intent;

  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  // Resolve party from a cached invite code, if the claimer has RSVP'd.
  let partyId: string | null = null;
  if (body.invite_code) {
    const { data: party } = await supabase
      .from("parties")
      .select("id")
      .eq("invite_code", body.invite_code)
      .maybeSingle();
    partyId = party?.id ?? null;
  }

  // Conditional grab.
  let query = supabase.from("registry_items").update(
    intent === "purchased"
      ? { status: "purchased", held_until: null }
      : {
          status: "planning",
          held_until: new Date(
            Date.now() + HOLD_HOURS * 3600 * 1000
          ).toISOString(),
        }
  );

  if (intent === "purchased") {
    query = query.eq("id", body.item_id).neq("status", "purchased");
  } else {
    query = query
      .eq("id", body.item_id)
      .or(`status.eq.available,and(status.eq.planning,held_until.lt.${nowIso})`);
  }

  const { data: grabbed, error: grabError } = await query
    .select("id")
    .maybeSingle();

  if (grabError) {
    return NextResponse.json(
      { error: "Could not claim this gift. Please try again." },
      { status: 500 }
    );
  }
  if (!grabbed) {
    return NextResponse.json(
      {
        error:
          intent === "purchased"
            ? "This gift has already been marked as purchased."
            : "Sorry — this gift was just claimed by someone else.",
      },
      { status: 409 }
    );
  }

  // Mark any prior live holds on this item as released, then record the claim.
  await supabase
    .from("registry_claims")
    .update({ released: true })
    .eq("registry_item_id", body.item_id)
    .eq("released", false);

  const { error: claimError } = await supabase.from("registry_claims").insert({
    registry_item_id: body.item_id,
    claimer_name: name,
    claimer_email: email,
    claimer_phone: phone,
    claimer_message: message,
    order_id: orderId,
    status: intent,
    party_id: partyId,
  });

  if (claimError) {
    return NextResponse.json(
      { error: "Could not record your claim. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status: intent, claimed_by: name });
}
