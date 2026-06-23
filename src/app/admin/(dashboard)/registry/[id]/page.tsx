import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { updateItem } from "../actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-maroon";

export default async function EditRegistryItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: item } = await supabase
    .from("registry_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/registry" className="text-sm text-maroon hover:underline">
          ← Back to registry
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-maroon">Edit item</h1>
      </div>

      <form action={updateItem} className="space-y-3 rounded-2xl border border-gold/25 bg-white/60 p-5">
        <input type="hidden" name="id" value={item.id} />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Title</label>
        <input className={input} name="title" defaultValue={item.title} required />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Description</label>
        <input className={input} name="description" defaultValue={item.description ?? ""} />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Price</label>
        <input className={input} name="price" type="number" step="0.01" defaultValue={item.price ?? ""} />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Store URL</label>
        <input className={input} name="store_url" defaultValue={item.store_url} required />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Image URL</label>
        <input className={input} name="image_url" defaultValue={item.image_url ?? ""} />
        <label className="block text-xs uppercase tracking-wide text-foreground/55">Display order</label>
        <input className={input} name="display_order" type="number" defaultValue={item.display_order ?? ""} />
        <button className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark">
          Save changes
        </button>
      </form>
    </div>
  );
}
