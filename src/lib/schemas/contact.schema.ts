import { z } from "zod";

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

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
      .union([z.string().regex(E164_REGEX, m.invalidPhone), z.literal("")])
      .optional(),
    position: z.string().optional(),
    companyName: z.string().optional(),
    notes: z.string().optional(),
    ownerId: z.string().optional(),
    tags: z.string().optional(),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
