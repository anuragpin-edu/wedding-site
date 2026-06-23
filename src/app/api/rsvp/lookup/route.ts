import { NextRequest, NextResponse } from "next/server";
import { findParty } from "@/lib/rsvp";
import { limitByIp } from "@/lib/rateLimit";

// Retrieve an existing RSVP by the primary's email and/or mobile. At least one
// is required. Both still match exactly (no partial/typeahead), so there's no
// way to browse the guest list. If a single field matches more than one party,
// we ask for the other rather than guessing.
export async function POST(req: NextRequest) {
  // Tighter limit here — this is the only contact-based lookup, so throttle
  // any attempt to probe email/phone combinations.
  const limit = limitByIp(req, "rsvp-lookup", 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: { email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const email = body.email?.trim();
  const phone = body.phone?.trim();
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Enter the email or mobile you RSVP'd with." },
      { status: 400 }
    );
  }

  const result = await findParty(email, phone);

  if (result.kind === "ambiguous") {
    return NextResponse.json(
      { error: "We found more than one match — please enter both your email and mobile." },
      { status: 409 }
    );
  }
  if (result.kind === "none") {
    return NextResponse.json(
      { error: "We couldn't find an RSVP with those details. Double-check, or start a new one." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: result.data });
}
