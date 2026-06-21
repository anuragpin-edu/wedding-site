import type { Metadata } from "next";
import RsvpForm from "@/components/RsvpForm";
import { getPartyByCode } from "@/lib/rsvp";

export const metadata: Metadata = {
  title: "RSVP — Anurag & Thanmai",
  robots: { index: false, follow: false }, // never index guest invite pages
};

export default async function RsvpInvitePage({
  params,
}: {
  params: Promise<{ invite_code: string }>;
}) {
  const { invite_code } = await params;
  const data = await getPartyByCode(invite_code);

  if (!data) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-maroon">
          Invite not found
        </h1>
        <p className="mt-4 text-foreground/65">
          We couldn&apos;t find an invitation for that link. Please double-check
          the link we sent you, or reach out to us and we&apos;ll help.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">You&apos;re invited</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-maroon sm:text-5xl">
          {data.party.display_name}
        </h1>
        <p className="mt-3 text-foreground/65">
          Let us know who&apos;s joining us, and for which celebrations. You can
          add anyone in your party and update your response anytime.
        </p>
      </div>

      <RsvpForm data={data} />
    </div>
  );
}
