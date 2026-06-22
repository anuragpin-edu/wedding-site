import { NextRequest, NextResponse } from "next/server";
import { getPartyByContact } from "@/lib/rsvp";

// Retrieve an existing RSVP by the primary's email + mobile. Both must match
// exactly, so this can't be used to enumerate guests. Returns only the
// requester's own party data (with its edit token) on success.
export async function POST(req: NextRequest) {
  let body: { email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const email = body.email?.trim();
  const phone = body.phone?.trim();
  if (!email || !phone) {
    return NextResponse.json(
      { error: "Enter the email and mobile you RSVP'd with." },
      { status: 400 }
    );
  }

  const data = await getPartyByContact(email, phone);
  if (!data) {
    return NextResponse.json(
      { error: "We couldn't find an RSVP with those details. Double-check, or start a new one." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
