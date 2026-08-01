import { z } from "zod";

type Messages = {
  required: string;
  endAfterStart: string;
};

export function createMeetingSchema(m: Messages) {
  return z
    .object({
      title: z.string().min(1, m.required),
      contactId: z.string().optional(),
      dealId: z.string().optional(),
      startAt: z.string().min(1, m.required),
      endAt: z.string().min(1, m.required),
      location: z.string().optional(),
      description: z.string().optional(),
      attendeeUserIds: z.array(z.string()).optional(),
    })
    .refine((data) => !data.startAt || !data.endAt || data.endAt > data.startAt, {
      message: m.endAfterStart,
      path: ["endAt"],
    });
}

export type MeetingFormValues = z.infer<ReturnType<typeof createMeetingSchema>>;
