"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useCreateApiKeyMutation,
  useGetApiKeysQuery,
  useRemoveApiKeyMutation,
  useUpdateApiKeyMutation,
} from "@/lib/api/apiKeys.api";
import type { ApiKey, CreatedApiKey } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

function CreateApiKeySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.settingsSecurity.apiKeys");
  const [createApiKey, { isLoading }] = useCreateApiKeyMutation();
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName("");
      setCreatedKey(null);
    }
  }

  const handleCreate = async () => {
    if (name.trim().length < 2) return;
    try {
      const result = await createApiKey({ name: name.trim() }).unwrap();
      setCreatedKey(result);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const handleCopy = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey.rawKey);
    toast.success(t("copied"));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{createdKey ? t("createdTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        {createdKey ? (
          <div className="flex flex-col gap-4 px-4">
            <p className="text-sm text-text-secondary">{t("createdHint")}</p>
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-background px-3.5 py-2.5">
              <code className="flex-1 truncate text-xs text-text-primary">{createdKey.rawKey}</code>
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
              <label htmlFor="apikey-name" className="text-xs font-medium text-text-tertiary uppercase">
                {t("name")}
              </label>
              <input
                id="apikey-name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
          </div>
        )}

        <SheetFooter>
          {createdKey ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              {t("done")}
            </Button>
          ) : (
            <Button type="button" onClick={handleCreate} disabled={isLoading || name.trim().length < 2}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {t("create")}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function ApiKeysTab() {
  const t = useTranslations("pages.settingsSecurity.apiKeys");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const { data: keys, isLoading } = useGetApiKeysQuery();
  const [updateApiKey] = useUpdateApiKeyMutation();
  const [removeApiKey, { isLoading: isRemoving }] = useRemoveApiKeyMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null);

  const handleDelete = async () => {
    if (!deletingKey) return;
    try {
      await removeApiKey(deletingKey.id).unwrap();
      setDeletingKey(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setSheetOpen(true)}>
          <Plus className="size-3.5" />
          {t("createTitle")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !keys || keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={t("empty")}
          action={
            <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="size-3.5" />
              {t("createTitle")}
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnKey")}</TableHead>
                <TableHead>{t("columnCreatedBy")}</TableHead>
                <TableHead>{t("columnLastUsed")}</TableHead>
                <TableHead>{t("columnActive")}</TableHead>
                <TableHead className="w-12 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs text-text-tertiary">{key.keyPrefix}••••••••</code>
                  </TableCell>
                  <TableCell className="text-text-secondary">{key.createdByUserName}</TableCell>
                  <TableCell className="text-text-secondary">
                    {key.lastUsedAt ? formatter.format(new Date(key.lastUsedAt)) : t("neverUsed")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={key.isActive}
                        onCheckedChange={(checked) =>
                          updateApiKey({ id: key.id, body: { isActive: checked === true } })
                        }
                      />
                      {!key.isActive && <Badge variant="outline">{t("inactive")}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setDeletingKey(key)}
                      className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateApiKeySheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <Dialog open={!!deletingKey} onOpenChange={(open) => !open && setDeletingKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingKey?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("deleteDialog.cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isRemoving}>
              {isRemoving && <Loader2 className="size-4 animate-spin" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
