"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Archive, ArchiveRestore, Package, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useRole } from "@/lib/hooks/useRole";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetCategoriesQuery } from "@/lib/api/categories.api";
import {
  useArchiveProductMutation,
  useGetProductsQuery,
  useRestoreProductMutation,
} from "@/lib/api/products.api";
import { formatCurrency } from "@/lib/utils";
import { ProductFormSheet } from "./product-form-sheet";
import { DeleteProductDialog } from "./delete-product-dialog";
import type { Product } from "@/types/api";

const ALL_CATEGORIES = "__all__";
const LIMIT = 20;

export function ProductsTab() {
  const t = useTranslations("pages.inventory.products");
  const tUnit = useTranslations("enums.productUnit");
  const locale = useLocale();
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const { data: categories } = useGetCategoriesQuery();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [categoryId, setCategoryId] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetProductsQuery({
    search: search || undefined,
    categoryId: categoryId || undefined,
    includeArchived,
    page,
    limit: LIMIT,
  });

  const [archiveProduct] = useArchiveProductMutation();
  const [restoreProduct] = useRestoreProductMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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

        <Select
          value={categoryId || ALL_CATEGORIES}
          onValueChange={(value) => {
            setCategoryId(value === ALL_CATEGORIES || !value ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === ALL_CATEGORIES || !value
                  ? t("allCategories")
                  : (categories?.find((c) => c.id === value)?.name ?? t("allCategories"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>{t("allCategories")}</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
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
            <Button
              type="button"
              onClick={() => {
                setEditingProduct(null);
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
        <EmptyState icon={Package} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnSku")}</TableHead>
                <TableHead>{t("columnCategory")}</TableHead>
                <TableHead>{t("columnPrice")}</TableHead>
                <TableHead>{t("columnUnit")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((product) => (
                <TableRow key={product.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{product.name}</TableCell>
                  <TableCell className="text-text-secondary">{product.sku || "—"}</TableCell>
                  <TableCell className="text-text-secondary">{product.categoryName || "—"}</TableCell>
                  <TableCell className="text-text-secondary">
                    {formatCurrency(product.price, product.currency, locale)}
                  </TableCell>
                  <TableCell className="text-text-secondary">{tUnit(product.unit)}</TableCell>
                  <TableCell>
                    {product.isArchived ? (
                      <Badge variant="outline">{t("archived")}</Badge>
                    ) : product.isActive ? (
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
                            setEditingProduct(product);
                            setSheetOpen(true);
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {product.isArchived ? (
                          <button
                            type="button"
                            onClick={() => restoreProduct(product.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("restore")}
                          >
                            <ArchiveRestore className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archiveProduct(product.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("archive")}
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
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

      <ProductFormSheet open={sheetOpen} onOpenChange={setSheetOpen} product={editingProduct} />

      <DeleteProductDialog
        product={deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      />
    </div>
  );
}
