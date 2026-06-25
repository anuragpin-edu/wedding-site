import type { Metadata } from "next";
import EnableUpdates from "@/components/EnableUpdates";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Updates",
  description: "The latest wedding news and announcements.",
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function UpdatesPage() {
  const supabase = createServiceClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
          Updates
        </h1>
        <p className="mt-3 text-foreground/65">
          Wedding news and announcements — always here, whether or not you turn
          on notifications.
        </p>
      </div>

      <div className="mb-10">
        <EnableUpdates />
      </div>

      {(announcements ?? []).length === 0 ? (
        <p className="text-center text-foreground/55">
          No announcements yet — check back soon.
        </p>
      ) : (
        <div className="space-y-5">
          {(announcements ?? []).map((a) => (
            <article key={a.id} className="rounded-2xl border border-gold/25 bg-white/60 p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-maroon">
                  {a.title}
                </h2>
                <time className="shrink-0 text-xs text-foreground/50">
                  {formatDate(a.created_at)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-foreground/75">{a.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
