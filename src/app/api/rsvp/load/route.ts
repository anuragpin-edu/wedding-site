import { NextRequest, NextResponse } from "next/server";
import { getPartyByToken } from "@/lib/rsvp";

// Load a party's RSVP by its edit token (kept in the guest's browser) so the
// form can auto-fill on a return visit. The token is an un-guessable random
// string, so possessing it is the authorization.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  const data = await getPartyByToken(token);
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data });
}
