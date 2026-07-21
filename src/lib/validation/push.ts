import { z } from "zod";

export const pushSubscribeSchema = z.object({
  endpoint: z
    .string()
    .url("Endpoint must be a valid URL.")
    // Must be HTTPS for web push
    .refine((val) => val.startsWith("https://"), {
      message: "Push endpoint must use HTTPS.",
    })
    .max(1000, "Endpoint URL is too long."),
  keys: z.object({
    p256dh: z.string().min(10).max(200),
    auth: z.string().min(10).max(200),
  }),
  userAgent: z.string().max(500).optional(),
});
