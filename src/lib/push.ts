import "server-only";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export type PushPayload = { title: string; body: string; url?: string };

// Send a notification to every stored subscription. Subscriptions that the
// push service reports as gone (404/410) are pruned so the table stays clean.
export async function sendPushToAll(
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  configure();
  const supabase = createServiceClient();
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent++;
      } catch (err) {
        failed++;
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    })
  );

  if (dead.length) {
    await supabase.from("push_subscriptions").delete().in("endpoint", dead);
  }

  return { sent, failed };
}
