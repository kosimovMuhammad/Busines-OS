"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Network, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  useGetDepartmentTreeQuery,
  useRemoveDepartmentMutation,
} from "@/lib/api/departments.api";
import { DepartmentFormSheet } from "./department-form-sheet";
import type { Department, DepartmentTreeNode } from "@/types/api";

function toDepartment(node: DepartmentTreeNode): Department {
  return { ...node, parentDepartmentId: null };
}

function DepartmentNode({
  node,
  depth,
  canManage,
  onEdit,
  onDelete,
}: {
  node: DepartmentTreeNode;
  depth: number;
  canManage: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}) {
  const t = useTranslations("pages.settingsOrganization.departments");

  return (
    <div>
      <div
        className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3"
        style={{ marginInlineStart: depth * 24 }}
      >
        <div>
          <p className="text-sm font-medium text-text-primary">{node.name}</p>
          <p className="text-xs text-text-tertiary">
            {node.managerName ? t("managedBy", { name: node.managerName }) : t("noManager")}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(toDepartment(node))}
              className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
              aria-label={t("edit")}
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(toDepartment(node))}
              className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={t("delete")}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <DepartmentNode
              key={child.id}
              node={child}
              depth={depth + 1}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DepartmentsTab({ canManage }: { canManage: boolean }) {
  const t = useTranslations("pages.settingsOrganization.departments");
  const { data: tree, isLoading } = useGetDepartmentTreeQuery();
  const [removeDepartment, { isLoading: isRemoving }] = useRemoveDepartmentMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    try {
      await removeDepartment(deletingDepartment.id).unwrap();
      setDeletingDepartment(null);
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
              setEditingDepartment(null);
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
      ) : !tree || tree.length === 0 ? (
        <EmptyState
          icon={Network}
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
        <div className="space-y-2">
          {tree.map((node) => (
            <DepartmentNode
              key={node.id}
              node={node}
              depth={0}
              canManage={canManage}
              onEdit={(d) => {
                setEditingDepartment(d);
                setSheetOpen(true);
              }}
              onDelete={setDeletingDepartment}
            />
          ))}
        </div>
      )}

      <DepartmentFormSheet open={sheetOpen} onOpenChange={setSheetOpen} department={editingDepartment} />

      <Dialog open={!!deletingDepartment} onOpenChange={(open) => !open && setDeletingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingDepartment?.name ?? "" })}
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
