import { z } from "zod";
import { contactEmailSchema, contactNameSchema, contactPhoneSchema } from "./contact";

export const guestSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: contactNameSchema,
  dietary_notes: z
    .string()
    .trim()
    .max(500, "Dietary notes must be under 500 characters.")
    .nullable()
    .optional()
    // Treat empty string as null
    .transform((val) => (val === "" ? null : val)),
  is_primary: z.boolean().optional(),
  // Must be an object with string keys and boolean values
  attendance: z.record(z.string().uuid("Invalid event ID format."), z.boolean()),
});

export const rsvpSubmitSchema = z.object({
  token: z.string().optional().nullable(),
  turnstile_token: z.string().optional(),
  email: contactEmailSchema,
  phone: contactPhoneSchema,
  guests: z
    .array(guestSchema)
    .min(1, "Please enter at least your own name.")
    .max(20, "Guest list is too large. Please contact us for a large party."),
  removedGuestIds: z.array(z.string().uuid()).max(20).optional(),
});

export const rsvpLookupSchema = z.object({
  email: contactEmailSchema.optional(),
  phone: contactPhoneSchema.optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: "Enter the email or mobile you RSVP'd with.", path: ["email"] }
);
