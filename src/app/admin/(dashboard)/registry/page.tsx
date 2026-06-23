import Link from "next/link";
import { getRegistryAdmin } from "@/lib/adminData";
import { getSetting, SHIPPING_ADDRESS } from "@/lib/settings";
import { createItem, deleteItem, releaseClaim } from "./actions";
import ShippingAddressEditor from "@/components/admin/ShippingAddressEditor";
import { PencilIcon, TrashIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-maroon";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-sage/15 text-sage border-sage/40",
    planning: "bg-marigold/15 text-gold border-marigold/40",
    purchased: "bg-maroon/10 text-maroon border-maroon/30",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default async function AdminRegistry() {
  const [items, shippingAddress] = await Promise.all([
    getRegistryAdmin(),
    getSetting(SHIPPING_ADDRESS),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon">Registry</h1>
        <p className="mt-1 text-sm text-foreground/60">{items.length} items</p>
      </div>

      {/* Shipping address shown on the public registry page */}
      <div className="space-y-2 rounded-2xl border border-gold/25 bg-white/60 p-5">
        <p className="font-medium text-foreground">&ldquo;Ship gifts to&rdquo; address</p>
        <p className="text-xs text-foreground/55">
          Shown on the public registry so guests know where to send gifts.
        </p>
        <div className="pt-1">
          <ShippingAddressEditor address={shippingAddress} />
        </div>
      </div>

      {/* Add item */}
      <form
        action={createItem}
        className="grid gap-3 rounded-2xl border border-gold/25 bg-white/60 p-5 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 font-medium text-foreground">Add an item</p>
        <input className={input} name="title" placeholder="Title *" required />
        <input className={input} name="price" type="number" step="0.01" placeholder="Price (e.g. 199.00)" />
        <input className={input + " sm:col-span-2"} name="description" placeholder="Description" />
        <input className={input} name="store_url" placeholder="Store URL *" required />
        <input className={input} name="image_url" placeholder="Image URL (optional)" />
        <input className={input} name="display_order" type="number" placeholder="Display order (optional)" />
        <div className="sm:col-span-2">
          <button className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark">
            Add item
          </button>
        </div>
      </form>

      {/* Items list */}
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-gold/25 bg-white/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{it.title}</p>
                  <StatusBadge status={it.status} />
                </div>
                <p className="text-sm text-foreground/60">
                  {it.price != null ? `$${it.price.toFixed(2)}` : "—"} ·{" "}
                  <a href={it.store_url} target="_blank" rel="noopener noreferrer" className="text-maroon underline">
                    store link
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-1">
                {it.claim && (
                  <form action={releaseClaim}>
                    <input type="hidden" name="id" value={it.id} />
                    <button className="rounded-full border border-marigold/50 px-3 py-1 text-xs text-gold hover:bg-marigold/10">
                      Release claim
                    </button>
                  </form>
                )}
                <Link
                  href={`/admin/registry/${it.id}`}
                  aria-label="Edit item"
                  title="Edit"
                  className="rounded-md p-1.5 text-foreground/45 transition-colors hover:bg-maroon/5 hover:text-maroon"
                >
                  <PencilIcon />
                </Link>
                <form action={deleteItem}>
                  <input type="hidden" name="id" value={it.id} />
                  <button
                    aria-label="Delete item"
                    title="Delete"
                    className="rounded-md p-1.5 text-foreground/45 transition-colors hover:bg-maroon/10 hover:text-maroon"
                  >
                    <TrashIcon />
                  </button>
                </form>
              </div>
            </div>

            {it.claim && (
              <div className="mt-3 rounded-lg border border-gold/20 bg-cream/30 px-4 py-3 text-sm">
                <p className="text-foreground/80">
                  <span className="font-medium">{it.claim.status === "purchased" ? "Purchased" : "Planning"}</span>{" "}
                  by {it.claim.claimer_name}
                  {it.claim.party_name ? ` (${it.claim.party_name})` : ""}
                </p>
                <p className="text-foreground/60">
                  {it.claim.claimer_email} · {it.claim.claimer_phone}
                  {it.claim.order_id ? ` · order: ${it.claim.order_id}` : ""}
                </p>
                {it.claim.claimer_message && (
                  <p className="mt-1 italic text-foreground/60">“{it.claim.claimer_message}”</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
