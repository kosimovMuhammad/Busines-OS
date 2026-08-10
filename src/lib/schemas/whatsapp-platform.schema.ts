import { z } from "zod";
import { E164_REGEX, normalizePhoneInput } from "./contact.schema";

type Messages = {
  required: string;
  invalidPhone: string;
};

// .transform().pipe() (not .preprocess()) so the schema's inferred input
// type stays `string` - z.preprocess()'s input type is `unknown`, which
// breaks zodResolver's generic inference against useForm<FormValues>.
const phoneField = (m: Messages) =>
  z
    .string()
    .min(1, m.required)
    .transform(normalizePhoneInput)
    .pipe(z.string().regex(E164_REGEX, m.invalidPhone));

export function createSendPlatformTextSchema(m: Messages) {
  return z.object({
    to: phoneField(m),
    message: z.string().min(1, m.required),
  });
}

export function createSendPlatformTemplateSchema(m: Messages) {
  return z.object({
    to: phoneField(m),
    templateName: z.string().min(1, m.required),
    languageCode: z.string().min(1, m.required),
  });
}

export type SendPlatformTextFormValues = z.infer<ReturnType<typeof createSendPlatformTextSchema>>;
export type SendPlatformTemplateFormValues = z.infer<ReturnType<typeof createSendPlatformTemplateSchema>>;
