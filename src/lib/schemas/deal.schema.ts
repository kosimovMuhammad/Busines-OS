import { z } from "zod";

type Messages = {
  required: string;
};

export function createDealSchema(m: Messages) {
  return z.object({
    title: z.string().min(1, m.required),
    contactId: z.string().min(1, m.required),
    value: z.string().optional(),
    currency: z.string().optional(),
    stage: z.string().optional(),
    probability: z.string().optional(),
    expectedCloseDate: z.string().optional(),
    ownerId: z.string().optional(),
  });
}

export type DealFormValues = z.infer<ReturnType<typeof createDealSchema>>;
