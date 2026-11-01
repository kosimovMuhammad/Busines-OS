import { z } from "zod";
import type { OnboardingRole } from "@/types/enums";

const ONBOARDING_ROLES = [
  "Founder",
  "Sales",
  "Marketing",
  "Operations",
  "Support",
  "Other",
] as const satisfies readonly OnboardingRole[];

type Messages = {
  required: string;
  invalidEmail: string;
  companyNameMin: string;
  nameMin: string;
  passwordMin: string;
  agreeToTerms: string;
  passwordMismatch: string;
};

export function createLoginUnifiedSchema(m: Pick<Messages, "invalidEmail" | "required">) {
  return z.object({
    email: z.email(m.invalidEmail),
    secret: z.string().min(1, m.required),
  });
}

export function createSetPasswordSchema(
  m: Pick<Messages, "passwordMin" | "passwordMismatch">
) {
  return z
    .object({
      newPassword: z.string().min(8, m.passwordMin),
      confirmPassword: z.string().min(1, m.passwordMin),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      message: m.passwordMismatch,
      path: ["confirmPassword"],
    });
}

export function createChangePasswordSchema(
  m: Pick<Messages, "required" | "passwordMin" | "passwordMismatch">
) {
  return z
    .object({
      currentPassword: z.string().min(1, m.required),
      newPassword: z.string().min(8, m.passwordMin),
      confirmPassword: z.string().min(1, m.passwordMin),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      message: m.passwordMismatch,
      path: ["confirmPassword"],
    });
}

export function createRegisterSchema(
  m: Pick<
    Messages,
    "companyNameMin" | "nameMin" | "invalidEmail" | "passwordMin" | "required" | "agreeToTerms"
  >
) {
  return z.object({
    companyName: z.string().min(2, m.companyNameMin),
    name: z.string().min(2, m.nameMin),
    email: z.email(m.invalidEmail),
    password: z.string().min(8, m.passwordMin),
    role: z.enum(ONBOARDING_ROLES, { error: m.required }),
    agreeToTerms: z.boolean().refine((v) => v === true, m.agreeToTerms),
  });
}

export function createVerifyCodeSchema(m: Pick<Messages, "required">) {
  return z.object({
    code: z.string().regex(/^\d{6}$/, m.required),
  });
}

export function createEmailChangeSchema(m: Pick<Messages, "invalidEmail">) {
  return z.object({
    newEmail: z.email(m.invalidEmail),
  });
}

export type LoginUnifiedFormValues = z.infer<ReturnType<typeof createLoginUnifiedSchema>>;
export type SetPasswordFormValues = z.infer<ReturnType<typeof createSetPasswordSchema>>;
export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
export type VerifyCodeFormValues = z.infer<ReturnType<typeof createVerifyCodeSchema>>;
export type EmailChangeFormValues = z.infer<ReturnType<typeof createEmailChangeSchema>>;
