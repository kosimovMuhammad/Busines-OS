"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Archive, ArchiveRestore, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useRole } from "@/lib/hooks/useRole";
import { useGetSuppliersQuery } from "@/lib/api/suppliers.api";
import {
  useArchivePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useGetPurchaseOrdersQuery,
  useRestorePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from "@/lib/api/purchaseOrders.api";
import { formatCurrency } from "@/lib/utils";
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge";
import { PurchaseOrderFormSheet } from "./purchase-order-form-sheet";
import { DeletePurchaseOrderDialog } from "./delete-purchase-order-dialog";
import type { PurchaseOrderSummary } from "@/types/api";
import type { PurchaseOrderStatus } from "@/types/enums";

const ALL_STATUS = "__all__";
const ALL_SUPPLIERS = "__all__";
const LIMIT = 20;
const STATUSES: PurchaseOrderStatus[] = ["Draft", "Ordered", "Received", "Cancelled"];

export function PurchaseOrdersTab() {
  const t = useTranslations("pages.inventory.purchaseOrders");
  const tStatus = useTranslations("enums.purchaseOrderStatus");
  const locale = useLocale();
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const { data: suppliers } = useGetSuppliersQuery();

  const [status, setStatus] = useState<PurchaseOrderStatus | "">("");
  const [supplierId, setSupplierId] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetPurchaseOrdersQuery({
    status: status || undefined,
    supplierId: supplierId || undefined,
    includeArchived,
    page,
    limit: LIMIT,
  });

  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  const [archivePurchaseOrder] = useArchivePurchaseOrderMutation();
  const [restorePurchaseOrder] = useRestorePurchaseOrderMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingPO, setDeletingPO] = useState<PurchaseOrderSummary | null>(null);

  const { data: editingPurchaseOrder } = useGetPurchaseOrderQuery(editingId ?? "", {
    skip: !editingId,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status || ALL_STATUS}
          onValueChange={(value) => {
            setStatus(value === ALL_STATUS || !value ? "" : (value as PurchaseOrderStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string) =>
                value === ALL_STATUS || !value ? t("allStatuses") : tStatus(value as PurchaseOrderStatus)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>{t("allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {tStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={supplierId || ALL_SUPPLIERS}
          onValueChange={(value) => {
            setSupplierId(value === ALL_SUPPLIERS || !value ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue>
              {(value: string) =>
                value === ALL_SUPPLIERS || !value
                  ? t("allSuppliers")
                  : (suppliers?.data.find((s) => s.id === value)?.name ?? t("allSuppliers"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SUPPLIERS}>{t("allSuppliers")}</SelectItem>
            {suppliers?.data.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox checked={includeArchived} onCheckedChange={(c) => setIncludeArchived(c === true)} />
          {t("showArchived")}
        </label>

        <div className="ml-auto">
          {canEdit && (
            <Button type="button" onClick={() => setCreateOpen(true)}>
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
        <EmptyState icon={ClipboardList} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnNumber")}</TableHead>
                <TableHead>{t("columnSupplier")}</TableHead>
                <TableHead>{t("columnTotal")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnExpectedDate")}</TableHead>
                <TableHead className="w-32 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((po) => (
                <TableRow key={po.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{po.orderNumber}</TableCell>
                  <TableCell className="text-text-secondary">{po.supplierName || "—"}</TableCell>
                  <TableCell className="text-text-secondary">
                    {formatCurrency(po.totalAmount, po.currency, locale)}
                  </TableCell>
                  <TableCell>
                    {canEdit && !po.isArchived ? (
                      <Select
                        value={po.status}
                        onValueChange={(value) =>
                          value &&
                          updatePurchaseOrder({ id: po.id, body: { status: value as PurchaseOrderStatus } })
                        }
                      >
                        <SelectTrigger className="h-7 w-32">
                          <SelectValue>{(value: string) => tStatus(value as PurchaseOrderStatus)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {tStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <PurchaseOrderStatusBadge status={po.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {po.expectedDate ? dateFormatter.format(new Date(po.expectedDate)) : "—"}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(po.id)}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {po.isArchived ? (
                          <button
                            type="button"
                            onClick={() => restorePurchaseOrder(po.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("restore")}
                          >
                            <ArchiveRestore className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archivePurchaseOrder(po.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("archive")}
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingPO(po)}
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

      <PurchaseOrderFormSheet open={createOpen} onOpenChange={setCreateOpen} purchaseOrder={null} />

      <PurchaseOrderFormSheet
        open={!!editingId && !!editingPurchaseOrder}
        onOpenChange={(open) => !open && setEditingId(null)}
        purchaseOrder={editingPurchaseOrder ?? null}
      />

      <DeletePurchaseOrderDialog
        purchaseOrder={deletingPO}
        onOpenChange={(open) => !open && setDeletingPO(null)}
      />
    </div>
  );
}
