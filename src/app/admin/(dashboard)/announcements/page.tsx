import { createServiceClient } from "@/lib/supabase/service";
import {
  createAnnouncement,
  setPublished,
  deleteAnnouncement,
  pushAnnouncement,
} from "./actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-maroon";

export default async function AdminAnnouncements() {
  const supabase = createServiceClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon">Announcements</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Published announcements appear on the public Updates page. Push
          notifications come in a later phase.
        </p>
      </div>

      {/* New announcement */}
      <form action={createAnnouncement} className="space-y-3 rounded-2xl border border-gold/25 bg-white/60 p-5">
        <p className="font-medium text-foreground">New announcement</p>
        <input className={input} name="title" placeholder="Title *" required />
        <textarea className={input + " min-h-24"} name="body" placeholder="Message *" required />
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" name="published" defaultChecked />
          Publish immediately
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" name="send_push" />
          Also send a push notification to everyone who opted in
        </label>
        <button className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark">
          Save
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {(announcements ?? []).length === 0 ? (
          <p className="text-foreground/60">No announcements yet.</p>
        ) : (
          (announcements ?? []).map((a) => (
            <div key={a.id} className="rounded-2xl border border-gold/25 bg-white/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <span
                      className={
                        "rounded-full border px-2.5 py-0.5 text-xs " +
                        (a.published
                          ? "border-sage/40 bg-sage/15 text-sage"
                          : "border-foreground/20 bg-foreground/5 text-foreground/50")
                      }
                    >
                      {a.published ? "published" : "draft"}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/70">{a.body}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {a.published && (
                    <form action={pushAnnouncement}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="rounded-full border border-sage/50 px-3 py-1 text-sm text-sage hover:bg-sage/10">
                        Send push
                      </button>
                    </form>
                  )}
                  <form action={setPublished}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="published" value={(!a.published).toString()} />
                    <button className="rounded-full border border-maroon/30 px-3 py-1 text-sm text-maroon hover:bg-maroon/5">
                      {a.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteAnnouncement}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="rounded-full border border-maroon/30 px-3 py-1 text-sm text-maroon/70 hover:bg-maroon/5">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
