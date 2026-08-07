"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useGetBranchesQuery, useRemoveBranchMutation } from "@/lib/api/branches.api";
import { BranchFormSheet } from "./branch-form-sheet";
import type { Branch } from "@/types/api";

export function BranchesTab({ canManage }: { canManage: boolean }) {
  const t = useTranslations("pages.settingsOrganization.branches");
  const { data: branches, isLoading } = useGetBranchesQuery();
  const [removeBranch, { isLoading: isRemoving }] = useRemoveBranchMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const handleDelete = async () => {
    if (!deletingBranch) return;
    try {
      await removeBranch(deletingBranch.id).unwrap();
      setDeletingBranch(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              setEditingBranch(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            {t("create")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !branches || branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("empty")}
          action={
            canManage ? (
              <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="size-3.5" />
                {t("create")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnLocation")}</TableHead>
                <TableHead>{t("columnTimezone")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id} className="border-border-subtle">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{branch.name}</p>
                      {branch.isHeadquarters && <Badge>{t("headquarters")}</Badge>}
                    </div>
                    {branch.address && <p className="text-xs text-text-tertiary">{branch.address}</p>}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {[branch.city, branch.country].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">{branch.timezone ?? "—"}</TableCell>
                  <TableCell>
                    {canManage && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBranch(branch);
                            setSheetOpen(true);
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingBranch(branch)}
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

      <BranchFormSheet open={sheetOpen} onOpenChange={setSheetOpen} branch={editingBranch} />

      <Dialog open={!!deletingBranch} onOpenChange={(open) => !open && setDeletingBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingBranch?.name ?? "" })}
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
