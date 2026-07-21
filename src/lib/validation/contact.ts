import { z } from "zod";

const PLACEHOLDER_NAMES = ["test", "guest", "unknown", "asdf", "dummy"];
const PLACEHOLDER_EMAILS = ["test", "email", "dummy", "example", "none", "na", "noemail"];

export const contactNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters long.")
  .max(100, "Name is too long.")
  // Reject purely numeric or punctuation names
  .refine((val) => /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(val), {
    message: "Name must contain at least one letter.",
  })
  .refine((val) => !PLACEHOLDER_NAMES.includes(val.toLowerCase()), {
    message: "Please enter a real name.",
  });

export const contactEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .refine(
    (val) => {
      const parts = val.split("@");
      if (parts.length !== 2) return false;
      const [local, domain] = parts;
      if (PLACEHOLDER_EMAILS.includes(local)) return false;
      if (domain === "example.com") return false;
      return true;
    },
    {
      message: "Please enter an address we can use to contact you.",
    }
  );

export const contactPhoneSchema = z
  .string()
  .trim()
  // Transform to digits, keeping '+' if it's the first character
  .transform((val) => {
    const isPlus = val.startsWith("+");
    const digitsOnly = val.replace(/\D/g, "");
    return isPlus ? `+${digitsOnly}` : digitsOnly;
  })
  .refine((val) => val.replace(/\D/g, "").length >= 10, {
    message: "Mobile number is too short.",
  })
  .refine((val) => val.replace(/\D/g, "").length <= 15, {
    message: "Mobile number is too long.",
  })
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      // Reject if all digits are the same (e.g. 0000000000)
      if (/^(\d)\1+$/.test(digits)) return false;
      // Reject simple sequences
      if (digits.includes("1234567890") || digits.includes("0987654321")) return false;
      return true;
    },
    {
      message: "Please enter a real mobile number.",
    }
  );
