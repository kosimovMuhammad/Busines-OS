"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetWebhooksQuery, useUpdateWebhookMutation } from "@/lib/api/webhooks.api";
import { WebhookFormSheet } from "./webhook-form-sheet";
import { DeleteWebhookDialog } from "./delete-webhook-dialog";
import type { Webhook } from "@/types/api";

export function WebhooksTab() {
  const t = useTranslations("pages.automation.webhooks");
  const { data: webhooks, isLoading } = useGetWebhooksQuery();
  const [updateWebhook] = useUpdateWebhookMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [deletingWebhook, setDeletingWebhook] = useState<Webhook | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setEditingWebhook(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="size-3.5" />
          {t("create")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !webhooks || webhooks.length === 0 ? (
        <EmptyState
          icon={Link2}
          title={t("empty")}
          action={
            <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="size-3.5" />
              {t("create")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={webhook.isActive}
                  onCheckedChange={(checked) =>
                    updateWebhook({ id: webhook.id, body: { isActive: checked === true } })
                  }
                />
                <div>
                  <p className="truncate text-sm font-medium text-text-primary">{webhook.url}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {webhook.subscribedEvents.length === 0 ? (
                      <span className="text-xs text-text-tertiary">{t("noEvents")}</span>
                    ) : (
                      webhook.subscribedEvents.map((event) => (
                        <Badge key={event} variant="outline">
                          {event}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingWebhook(webhook);
                    setSheetOpen(true);
                  }}
                  className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                  aria-label={t("edit")}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingWebhook(webhook)}
                  className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={t("delete")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WebhookFormSheet open={sheetOpen} onOpenChange={setSheetOpen} webhook={editingWebhook} />

      <DeleteWebhookDialog webhook={deletingWebhook} onOpenChange={(open) => !open && setDeletingWebhook(null)} />
    </div>
  );
}
