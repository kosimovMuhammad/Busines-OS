"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileStack, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useGetTemplatesQuery, useRemoveTemplateMutation } from "@/lib/api/templates.api";
import { TemplateFormSheet } from "./template-form-sheet";
import type { Template } from "@/types/api";

export function TemplatesTab() {
  const t = useTranslations("pages.contracts.templates");
  const tType = useTranslations("enums.templateType");
  const { data: templates, isLoading } = useGetTemplatesQuery();
  const [removeTemplate, { isLoading: isRemoving }] = useRemoveTemplateMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await removeTemplate(deletingTemplate.id).unwrap();
      setDeletingTemplate(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setEditingTemplate(null);
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
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title={t("empty")}
          action={
            <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="size-3.5" />
              {t("create")}
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnType")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-16 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{template.name}</TableCell>
                  <TableCell className="text-text-secondary">{tType(template.type)}</TableCell>
                  <TableCell>
                    {template.isActive ? (
                      <Badge>{t("active")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("inactive")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplate(template);
                          setSheetOpen(true);
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                        aria-label={t("edit")}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTemplate(template)}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label={t("delete")}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TemplateFormSheet open={sheetOpen} onOpenChange={setSheetOpen} template={editingTemplate} />

      <Dialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingTemplate?.name ?? "" })}
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
