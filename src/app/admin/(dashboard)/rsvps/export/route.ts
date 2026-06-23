import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getAllRsvps } from "@/lib/adminData";

function csvCell(value: string): string {
  // Quote and escape any cell containing a comma, quote, or newline.
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Downloads all RSVPs as a CSV — one row per guest, a column per event.
export async function GET() {
  // Guarded again here: this is a data export, not just a page view.
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { events, parties } = await getAllRsvps();

  const header = [
    "Party",
    "Guest",
    "Primary",
    "Email",
    "Phone",
    "Dietary notes",
    ...events.map((e) => e.name),
  ];

  const rows: string[] = [header.map(csvCell).join(",")];

  for (const p of parties) {
    for (const g of p.guests) {
      const row = [
        p.display_name,
        g.full_name,
        g.is_primary ? "yes" : "",
        p.contact_email ?? "",
        p.contact_phone ?? "",
        g.dietary_notes ?? "",
        ...events.map((e) => (g.attendance[e.id] ? "yes" : "no")),
      ];
      rows.push(row.map((c) => csvCell(String(c))).join(","));
    }
  }

  const csv = rows.join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps-${date}.csv"`,
    },
  });
}
