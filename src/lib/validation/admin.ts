import { z } from "zod";

export const registryItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  price: z
    .number()
    .finite()
    .nonnegative("Price cannot be negative.")
    .nullable()
    .optional(),
  store_url: z
    .string()
    .trim()
    .url("Must be a valid URL.")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "URL must use HTTP or HTTPS.",
    })
    .max(1000, "URL is too long."),
  image_url: z
    .string()
    .trim()
    .url("Must be a valid URL.")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "Image URL must use HTTP or HTTPS.",
    })
    .max(1000, "Image URL is too long.")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  display_order: z.number().int().nullable().optional(),
  category: z.enum(["gift", "gift_card"]).default("gift"),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
  body: z.string().trim().min(1, "Body is required.").max(2000, "Body is too long."),
  published: z.boolean().default(false),
});
