"use client";

import { useState } from "react";
import { PencilIcon } from "@/components/icons";
import { saveShippingAddress } from "@/app/admin/(dashboard)/registry/actions";

export default function ShippingAddressEditor({
  address,
}: {
  address: string | null;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={saveShippingAddress}
        onSubmit={() => setEditing(false)}
        className="max-w-md space-y-2"
      >
        <textarea
          name="shipping_address"
          autoFocus
          defaultValue={address ?? ""}
          placeholder={"Anurag & Thanmai\n123 Main St\nCity, GA 30000"}
          className="min-h-24 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-maroon"
        />
        <div className="flex gap-2">
          <button className="rounded-full bg-maroon px-4 py-1.5 text-sm font-medium text-white hover:bg-maroon-dark">
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-maroon/30 px-4 py-1.5 text-sm text-maroon hover:bg-maroon/5"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // View mode
  if (!address) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gold/50 px-4 py-2 text-sm text-maroon hover:bg-maroon/5"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        Add shipping address
      </button>
    );
  }

  return (
    <div className="group flex max-w-md items-start gap-3 rounded-lg border border-gold/25 bg-cream/30 px-4 py-3">
      <p className="flex-1 whitespace-pre-wrap text-sm text-foreground/80">{address}</p>
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit shipping address"
        className="rounded-md p-1 text-foreground/40 opacity-0 transition-opacity hover:bg-maroon/5 hover:text-maroon focus:opacity-100 group-hover:opacity-100"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
