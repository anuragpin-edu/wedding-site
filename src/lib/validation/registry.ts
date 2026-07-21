import { z } from "zod";
import { contactEmailSchema, contactNameSchema, contactPhoneSchema } from "./contact";

export const claimSubmitSchema = z
  .object({
    turnstile_token: z.string().optional(),
    item_id: z.string().uuid("Invalid item ID."),
    intent: z.enum(["planning", "purchased"]),
    claimer_name: contactNameSchema,
    claimer_email: contactEmailSchema,
    claimer_phone: contactPhoneSchema,
    claimer_message: z
      .string()
      .trim()
      .max(1000, "Message must be under 1000 characters.")
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val)),
    order_id: z
      .string()
      .trim()
      .max(200, "Order ID is too long.")
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val)),
    invite_code: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // A confirmed purchase must carry an order ID
      if (data.intent === "purchased" && !data.order_id) {
        return false;
      }
      return true;
    },
    {
      message: "An order ID is required to confirm a purchase.",
      path: ["order_id"],
    }
  );
