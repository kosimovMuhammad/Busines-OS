"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MessageSquareText, Send, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSendPlatformWhatsAppTextMutation,
  useSendPlatformWhatsAppTemplateMutation,
} from "@/lib/api/whatsapp.api";
import {
  createSendPlatformTemplateSchema,
  createSendPlatformTextSchema,
  type SendPlatformTemplateFormValues,
  type SendPlatformTextFormValues,
} from "@/lib/schemas/whatsapp-platform.schema";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

// Backend's ExceptionHandlingMiddleware body shape: { statusCode, message, error }.
// `message` is a flat string[] only for the 422 FluentValidation case; every
// other status (403 Forbidden, 502 WhatsApp API rejection, etc.) carries a
// single string - see ExceptionHandlingMiddleware.cs.
type ApiErrorBody = { statusCode: number; message: string | string[]; error: string };

function readApiError(err: unknown): { status?: number | string; message?: string } {
  const status = (err as { status?: number | string })?.status;
  const data = (err as { data?: ApiErrorBody })?.data;
  const message = data?.message;
  return { status, message: Array.isArray(message) ? message.join(" ") : message };
}

export function PlatformWhatsAppContent() {
  const t = useTranslations("pages.settingsPlatform.whatsapp");

  return (
    <div className="max-w-lg space-y-6">
      <p className="text-sm text-text-secondary">{t("description")}</p>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-2">
          <Send className="size-4 text-text-tertiary" />
          <h3 className="text-sm font-semibold text-text-primary">{t("textCard.title")}</h3>
        </div>
        <SendTextForm />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-text-tertiary" />
          <h3 className="text-sm font-semibold text-text-primary">{t("templateCard.title")}</h3>
        </div>
        <SendTemplateForm />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SendTextForm() {
  const t = useTranslations("pages.settingsPlatform.whatsapp");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [sendText, { isLoading }] = useSendPlatformWhatsAppTextMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SendPlatformTextFormValues>({
    resolver: zodResolver(
      createSendPlatformTextSchema({
        required: tValidation("required"),
        invalidPhone: tValidation("invalidPhone"),
      })
    ),
  });

  const onSubmit = async (values: SendPlatformTextFormValues) => {
    try {
      await sendText(values).unwrap();
      toast.success(t("textCard.success"));
      reset();
    } catch (err) {
      const { status, message } = readApiError(err);
      if (status === 403) {
        setError("root", { message: tCommon("error.forbidden") });
      } else if (status === 422 || status === 502) {
        setError("root", { message: message ?? tCommon("error.generic") });
      } else {
        setError("root", { message: tCommon("error.generic") });
      }
    }
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root?.message && <ErrorBanner message={errors.root.message} />}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">{t("textCard.to")}</label>
        <input
          className={cn(inputClass, errors.to && "border-danger/60")}
          placeholder={t("textCard.toPlaceholder")}
          {...register("to")}
        />
        {errors.to ? (
          <p className="text-xs text-danger">{errors.to.message}</p>
        ) : (
          <p className="text-xs text-text-tertiary">{t("textCard.toHint")}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">{t("textCard.message")}</label>
        <textarea
          className={cn(inputClass, "min-h-24 resize-none", errors.message && "border-danger/60")}
          placeholder={t("textCard.messagePlaceholder")}
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {t("textCard.send")}
      </Button>
    </form>
  );
}

function SendTemplateForm() {
  const t = useTranslations("pages.settingsPlatform.whatsapp");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [sendTemplate, { isLoading }] = useSendPlatformWhatsAppTemplateMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SendPlatformTemplateFormValues>({
    resolver: zodResolver(
      createSendPlatformTemplateSchema({
        required: tValidation("required"),
        invalidPhone: tValidation("invalidPhone"),
      })
    ),
    defaultValues: { languageCode: "en_US" },
  });

  const onSubmit = async (values: SendPlatformTemplateFormValues) => {
    try {
      await sendTemplate(values).unwrap();
      toast.success(t("templateCard.success"));
      reset({ to: "", templateName: "", languageCode: "en_US" });
    } catch (err) {
      const { status, message } = readApiError(err);
      if (status === 403) {
        setError("root", { message: tCommon("error.forbidden") });
      } else if (status === 422 || status === 502) {
        setError("root", { message: message ?? tCommon("error.generic") });
      } else {
        setError("root", { message: tCommon("error.generic") });
      }
    }
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root?.message && <ErrorBanner message={errors.root.message} />}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">{t("templateCard.to")}</label>
        <input
          className={cn(inputClass, errors.to && "border-danger/60")}
          placeholder={t("templateCard.toPlaceholder")}
          {...register("to")}
        />
        {errors.to && <p className="text-xs text-danger">{errors.to.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("templateCard.templateName")}
        </label>
        <input
          className={cn(inputClass, errors.templateName && "border-danger/60")}
          placeholder={t("templateCard.templateNamePlaceholder")}
          {...register("templateName")}
        />
        {errors.templateName && <p className="text-xs text-danger">{errors.templateName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("templateCard.languageCode")}
        </label>
        <input
          className={cn(inputClass, errors.languageCode && "border-danger/60")}
          {...register("languageCode")}
        />
        {errors.languageCode && <p className="text-xs text-danger">{errors.languageCode.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {t("templateCard.send")}
      </Button>
    </form>
  );
}
