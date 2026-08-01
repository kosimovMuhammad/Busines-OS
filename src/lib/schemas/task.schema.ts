import { z } from "zod";

type Messages = {
  required: string;
};

export function createTaskSchema(m: Messages) {
  return z.object({
    title: z.string().min(1, m.required),
    description: z.string().optional(),
    priority: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    dealId: z.string().optional(),
    contactId: z.string().optional(),
  });
}

export type TaskFormValues = z.infer<ReturnType<typeof createTaskSchema>>;
