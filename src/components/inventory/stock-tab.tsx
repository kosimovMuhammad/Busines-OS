"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useRole } from "@/lib/hooks/useRole";
import { useGetProductsQuery } from "@/lib/api/products.api";
import { useGetBranchesQuery } from "@/lib/api/branches.api";
import { useGetInventoryQuery, useRemoveInventoryRecordMutation } from "@/lib/api/inventory.api";
import { StockMovementDialog } from "./stock-movement-dialog";

const ALL_PRODUCTS = "__all__";
const ALL_BRANCHES = "__all__";
const LIMIT = 20;

export function StockTab() {
  const t = useTranslations("pages.inventory.stock");
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const { data: productsData } = useGetProductsQuery();
  const { data: branches } = useGetBranchesQuery();

  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetInventoryQuery({
    productId: productId || undefined,
    branchId: branchId || undefined,
    page,
    limit: LIMIT,
  });

  const [removeInventoryRecord] = useRemoveInventoryRecordMutation();

  const [movementMode, setMovementMode] = useState<"in" | "out" | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={productId || ALL_PRODUCTS}
          onValueChange={(value) => {
            setProductId(value === ALL_PRODUCTS || !value ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue>
              {(value: string) =>
                value === ALL_PRODUCTS || !value
                  ? t("allProducts")
                  : (productsData?.data.find((p) => p.id === value)?.name ?? t("allProducts"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRODUCTS}>{t("allProducts")}</SelectItem>
            {productsData?.data.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={branchId || ALL_BRANCHES}
          onValueChange={(value) => {
            setBranchId(value === ALL_BRANCHES || !value ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === ALL_BRANCHES || !value
                  ? t("allBranches")
                  : (branches?.find((b) => b.id === value)?.name ?? t("allBranches"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANCHES}>{t("allBranches")}</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canEdit && (
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => setMovementMode("in")}>
              <ArrowDownToLine className="size-3.5" />
              {t("stockIn")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMovementMode("out")}>
              <ArrowUpFromLine className="size-3.5" />
              {t("stockOut")}
            </Button>
          </div>
        )}
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Boxes} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnProduct")}</TableHead>
                <TableHead>{t("columnSku")}</TableHead>
                <TableHead>{t("columnBranch")}</TableHead>
                <TableHead>{t("columnQuantity")}</TableHead>
                <TableHead className="w-16 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((record) => (
                <TableRow key={record.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{record.productName}</TableCell>
                  <TableCell className="text-text-secondary">{record.productSku || "—"}</TableCell>
                  <TableCell className="text-text-secondary">{record.branchName || "—"}</TableCell>
                  <TableCell className="text-text-secondary">{record.quantity}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => removeInventoryRecord(record.id)}
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

      <StockMovementDialog
        open={movementMode !== null}
        onOpenChange={(open) => !open && setMovementMode(null)}
        mode={movementMode ?? "in"}
      />
    </div>
  );
}
