// TypeScript types mirroring the Supabase schema (supabase/schema.sql).
// Keep this in sync whenever the schema changes.

export type Party = {
  id: string;
  invite_code: string; // internal edit token (stored in the browser)
  display_name: string;
  contact_email: string | null; // normalized: lowercased
  contact_phone: string | null; // normalized: digits only
  created_at: string;
};

export type Guest = {
  id: string;
  party_id: string;
  full_name: string;
  is_primary: boolean;
  dietary_notes: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  venue: string;
  address: string;
  description: string | null;
  dress_code: string | null;
  display_order: number;
};

export type EventAttendance = {
  guest_id: string;
  event_id: string;
  attending: boolean;
};

export type RegistryItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  store_url: string;
  status: "available" | "planning" | "purchased";
  held_until: string | null;
  category: "gift" | "gift_card";
  display_order: number | null;
  created_at: string;
};

export type RegistryClaim = {
  id: string;
  registry_item_id: string;
  claimer_name: string;
  claimer_email: string | null;
  claimer_phone: string | null;
  claimer_message: string | null;
  order_id: string | null;
  status: "planning" | "purchased";
  party_id: string | null;
  released: boolean;
  claimed_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
};

export type KeepAlive = {
  id: string;
  pinged_at: string;
};
