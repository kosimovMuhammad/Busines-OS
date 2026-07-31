import { z } from "zod";

type Messages = {
  required: string;
  invalidEmail: string;
  companyNameMin: string;
  nameMin: string;
  passwordMin: string;
  agreeToTerms: string;
};

export function createLoginSchema(m: Pick<Messages, "invalidEmail" | "required">) {
  return z.object({
    email: z.email(m.invalidEmail),
    password: z.string().min(1, m.required),
  });
}

export function createRegisterSchema(m: Messages) {
  return z.object({
    companyName: z.string().min(2, m.companyNameMin),
    name: z.string().min(2, m.nameMin),
    email: z.email(m.invalidEmail),
    password: z.string().min(8, m.passwordMin),
    agreeToTerms: z.boolean().refine((v) => v === true, m.agreeToTerms),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
