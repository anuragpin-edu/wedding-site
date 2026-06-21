// Creates (or resets) a test party so the RSVP flow can be clicked through.
// Run: node scripts/seed-test-party.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const INVITE = "test-family";

// Remove any prior test party (cascade clears its guests + attendance).
await fetch(`${url}/rest/v1/parties?invite_code=eq.${INVITE}`, { method: "DELETE", headers: h });

// Create the party.
const partyRes = await fetch(`${url}/rest/v1/parties`, {
  method: "POST",
  headers: { ...h, Prefer: "return=representation" },
  body: JSON.stringify({ invite_code: INVITE, display_name: "The Test Family" }),
});
const [party] = await partyRes.json();
console.log("Party:", party.invite_code, party.id);

// Add two members — one primary, one not.
const guestsRes = await fetch(`${url}/rest/v1/guests`, {
  method: "POST",
  headers: { ...h, Prefer: "return=representation" },
  body: JSON.stringify([
    { party_id: party.id, full_name: "Anurag", is_primary: true },
    { party_id: party.id, full_name: "Thanmai", is_primary: false },
  ]),
});
const guests = await guestsRes.json();
console.log("Guests:", guests.map((g) => g.full_name).join(", "));

console.log(`\n✓ Done. Visit:  http://localhost:3000/rsvp/${INVITE}`);
