export default function RsvpLandingPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
        RSVP
      </h1>
      <p className="mt-4 text-foreground/70">
        To RSVP, please use the personal invite link we sent you — it looks like{" "}
        <span className="whitespace-nowrap rounded bg-cream px-2 py-0.5 font-mono text-sm text-maroon">
          bunnymetanu.com/rsvp/your-code
        </span>
        .
      </p>
      <p className="mt-4 text-sm text-foreground/55">
        Can&apos;t find your link? Reach out to us and we&apos;ll resend it.
      </p>
    </div>
  );
}
