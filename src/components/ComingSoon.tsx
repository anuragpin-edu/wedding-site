export default function ComingSoon({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-foreground/65">{note}</p>
      <span className="mt-8 rounded-full border border-gold/30 bg-cream/50 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
        Coming soon
      </span>
    </div>
  );
}
