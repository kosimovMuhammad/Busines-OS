"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCreateWebhookMutation, useUpdateWebhookMutation } from "@/lib/api/webhooks.api";
import type { CreatedWebhook, Webhook } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function WebhookFormSheet({
  open,
  onOpenChange,
  webhook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}) {
  const t = useTranslations("pages.automation.webhooks.form");
  const isEdit = !!webhook;

  const [createWebhook, { isLoading: isCreating }] = useCreateWebhookMutation();
  const [updateWebhook, { isLoading: isUpdating }] = useUpdateWebhookMutation();
  const isSubmitting = isCreating || isUpdating;

  const [url, setUrl] = useState("");
  const [eventsText, setEventsText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [createdWebhook, setCreatedWebhook] = useState<CreatedWebhook | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setUrl(webhook?.url ?? "");
      setEventsText(webhook?.subscribedEvents.join(", ") ?? "");
      setIsActive(webhook?.isActive ?? true);
      setCreatedWebhook(null);
    }
  }

  const canSubmit = url.trim().length >= 4;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const subscribedEvents = eventsText
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    try {
      if (isEdit && webhook) {
        await updateWebhook({
          id: webhook.id,
          body: { url: url.trim(), subscribedEvents, isActive },
        }).unwrap();
        onOpenChange(false);
      } else {
        const result = await createWebhook({ url: url.trim(), subscribedEvents, isActive }).unwrap();
        setCreatedWebhook(result);
      }
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const handleCopy = () => {
    if (!createdWebhook) return;
    navigator.clipboard.writeText(createdWebhook.secret);
    toast.success(t("copied"));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{createdWebhook ? t("createdTitle") : isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        {createdWebhook ? (
          <div className="flex flex-col gap-4 px-4">
            <p className="text-sm text-text-secondary">{t("createdHint")}</p>
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-3.5 py-2.5">
              <code className="flex-1 truncate text-xs text-text-primary">{createdWebhook.secret}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                aria-label={t("copy")}
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-1.5">
              <label htmlFor="webhook-url" className="text-xs font-medium text-text-tertiary uppercase">
                {t("url")}
              </label>
              <input
                id="webhook-url"
                className={inputClass}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="webhook-events" className="text-xs font-medium text-text-tertiary uppercase">
                {t("events")}
              </label>
              <input
                id="webhook-events"
                className={inputClass}
                value={eventsText}
                onChange={(e) => setEventsText(e.target.value)}
                placeholder={t("eventsPlaceholder")}
              />
              <p className="text-xs text-text-tertiary">{t("eventsHint")}</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
              {t("isActive")}
            </label>
          </div>
        )}

        <SheetFooter>
          {createdWebhook ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              {t("done")}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("save") : t("create")}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
