"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, ArchiveRestore, Pencil, Plus, Trash2, Truck } from "lucide-react";
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
import { Pagination } from "@/components/shared/pagination";
import { useRole } from "@/lib/hooks/useRole";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  useArchiveSupplierMutation,
  useGetSuppliersQuery,
  useRestoreSupplierMutation,
} from "@/lib/api/suppliers.api";
import { SupplierFormSheet } from "./supplier-form-sheet";
import { DeleteSupplierDialog } from "./delete-supplier-dialog";
import type { Supplier } from "@/types/api";

const LIMIT = 20;

export function SuppliersTab() {
  const t = useTranslations("pages.inventory.suppliers");
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetSuppliersQuery({
    search: search || undefined,
    includeArchived,
    page,
    limit: LIMIT,
  });

  const [archiveSupplier] = useArchiveSupplierMutation();
  const [restoreSupplier] = useRestoreSupplierMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="w-56 rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
          placeholder={t("searchPlaceholder")}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox checked={includeArchived} onCheckedChange={(c) => setIncludeArchived(c === true)} />
          {t("showArchived")}
        </label>

        <div className="ml-auto">
          {canEdit && (
            <Button
              type="button"
              onClick={() => {
                setEditingSupplier(null);
                setSheetOpen(true);
              }}
            >
              <Plus className="size-3.5" />
              {t("create")}
            </Button>
          )}
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Truck} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnContact")}</TableHead>
                <TableHead>{t("columnEmail")}</TableHead>
                <TableHead>{t("columnPhone")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((supplier) => (
                <TableRow key={supplier.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{supplier.name}</TableCell>
                  <TableCell className="text-text-secondary">{supplier.contactName || "—"}</TableCell>
                  <TableCell className="text-text-secondary">{supplier.email || "—"}</TableCell>
                  <TableCell className="text-text-secondary">{supplier.phone || "—"}</TableCell>
                  <TableCell>
                    {supplier.isArchived ? (
                      <Badge variant="outline">{t("archived")}</Badge>
                    ) : supplier.isActive ? (
                      <Badge>{t("active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("inactive")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setSheetOpen(true);
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {supplier.isArchived ? (
                          <button
                            type="button"
                            onClick={() => restoreSupplier(supplier.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("restore")}
                          >
                            <ArchiveRestore className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archiveSupplier(supplier.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("archive")}
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingSupplier(supplier)}
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SupplierFormSheet open={sheetOpen} onOpenChange={setSheetOpen} supplier={editingSupplier} />

      <DeleteSupplierDialog
        supplier={deletingSupplier}
        onOpenChange={(open) => !open && setDeletingSupplier(null)}
      />
    </div>
  );
}
