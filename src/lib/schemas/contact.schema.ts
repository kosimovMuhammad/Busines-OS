import { z } from "zod";

export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

// Users commonly type international numbers with the "00" exit-code
// convention (e.g. "00992901234567") instead of the "+" E.164 prefix. Accept
// that form (and stray spaces/dashes) here so it validates the same way the
// backend normalizes it, instead of rejecting a number the user typed correctly.
export function normalizePhoneInput(value: string): string {
  const stripped = value.trim().replace(/[\s\-()]/g, "");
  return stripped.startsWith("00") ? `+${stripped.slice(2)}` : stripped;
}

type Messages = {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
};

export function createContactSchema(m: Messages) {
  return z.object({
    firstName: z.string().min(1, m.required),
    lastName: z.string().optional(),
    email: z.union([z.email(m.invalidEmail), z.literal("")]).optional(),
    phone: z
      .union([
        z.preprocess(
          (v) => (typeof v === "string" ? normalizePhoneInput(v) : v),
          z.string().regex(E164_REGEX, m.invalidPhone)
        ),
        z.literal(""),
      ])
      .optional(),
    position: z.string().optional(),
    companyName: z.string().optional(),
    notes: z.string().optional(),
    ownerId: z.string().optional(),
    tags: z.string().optional(),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
