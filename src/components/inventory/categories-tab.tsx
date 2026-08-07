"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, ArchiveRestore, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRole } from "@/lib/hooks/useRole";
import {
  useArchiveCategoryMutation,
  useGetCategoriesQuery,
  useRestoreCategoryMutation,
} from "@/lib/api/categories.api";
import { CategoryFormSheet } from "./category-form-sheet";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import type { Category } from "@/types/api";

export function CategoriesTab() {
  const t = useTranslations("pages.inventory.categories");
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: categories, isLoading } = useGetCategoriesQuery({ includeArchived });
  const [archiveCategory] = useArchiveCategoryMutation();
  const [restoreCategory] = useRestoreCategoryMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const categoriesById = new Map((categories ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox checked={includeArchived} onCheckedChange={(c) => setIncludeArchived(c === true)} />
          {t("showArchived")}
        </label>
        {canEdit && (
          <Button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            {t("create")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState icon={FolderTree} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnParent")}</TableHead>
                <TableHead>{t("columnDescription")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{category.name}</TableCell>
                  <TableCell className="text-text-secondary">
                    {category.parentCategoryId
                      ? (categoriesById.get(category.parentCategoryId)?.name ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-text-secondary">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell>
                    {category.isArchived ? (
                      <Badge variant="outline">{t("archived")}</Badge>
                    ) : (
                      <Badge>{t("active")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(category);
                            setSheetOpen(true);
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {category.isArchived ? (
                          <button
                            type="button"
                            onClick={() => restoreCategory(category.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("restore")}
                          >
                            <ArchiveRestore className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archiveCategory(category.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("archive")}
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                          aria-label={t("delete")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={editingCategory}
        categories={categories ?? []}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      />
    </div>
  );
}
