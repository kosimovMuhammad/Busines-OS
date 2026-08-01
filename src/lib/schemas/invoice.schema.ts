import { z } from "zod";

type Messages = {
  required: string;
};

export function createInvoiceSchema(m: Messages) {
  return z.object({
    contactId: z.string().min(1, m.required),
    dealId: z.string().optional(),
    amount: z.string().min(1, m.required),
    currency: z.string().optional(),
    dueDate: z.string().min(1, m.required),
    notes: z.string().optional(),
  });
}

export type InvoiceFormValues = z.infer<ReturnType<typeof createInvoiceSchema>>;
