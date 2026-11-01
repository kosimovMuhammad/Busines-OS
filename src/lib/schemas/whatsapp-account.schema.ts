import { z } from "zod";

type Messages = {
  required: string;
};

export function createUpdateWhatsappAccountSchema(m: Messages) {
  return z.object({
    verifiedName: z.string().min(1, m.required),
  });
}

export type UpdateWhatsappAccountFormValues = z.infer<
  ReturnType<typeof createUpdateWhatsappAccountSchema>
>;
