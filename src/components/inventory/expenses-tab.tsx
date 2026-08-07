"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Archive, ArchiveRestore, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useRole } from "@/lib/hooks/useRole";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  useArchiveExpenseMutation,
  useGetExpensesQuery,
  useRestoreExpenseMutation,
} from "@/lib/api/expenses.api";
import { formatCurrency } from "@/lib/utils";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import type { Expense } from "@/types/api";

const LIMIT = 20;

export function ExpensesTab() {
  const t = useTranslations("pages.inventory.expenses");
  const locale = useLocale();
  const { hasRole } = useRole();
  const canEdit = hasRole(["Owner", "Admin", "Manager"]);

  const [categoryInput, setCategoryInput] = useState("");
  const category = useDebounce(categoryInput, 300);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetExpensesQuery({
    category: category || undefined,
    includeArchived,
    page,
    limit: LIMIT,
  });

  const [archiveExpense] = useArchiveExpenseMutation();
  const [restoreExpense] = useRestoreExpenseMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="w-56 rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
          placeholder={t("categoryPlaceholder")}
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value);
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
                setEditingExpense(null);
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
        <EmptyState icon={Receipt} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnDescription")}</TableHead>
                <TableHead>{t("columnCategory")}</TableHead>
                <TableHead>{t("columnAmount")}</TableHead>
                <TableHead>{t("columnPaidBy")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((expense) => (
                <TableRow key={expense.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">
                    {expense.description || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">{expense.category || "—"}</TableCell>
                  <TableCell className="text-text-secondary">
                    {formatCurrency(expense.amount, expense.currency, locale)}
                  </TableCell>
                  <TableCell className="text-text-secondary">{expense.paidByName}</TableCell>
                  <TableCell className="text-text-secondary">
                    {dateFormatter.format(new Date(expense.date))}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpense(expense);
                            setSheetOpen(true);
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {expense.isArchived ? (
                          <button
                            type="button"
                            onClick={() => restoreExpense(expense.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("restore")}
                          >
                            <ArchiveRestore className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archiveExpense(expense.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                            aria-label={t("archive")}
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingExpense(expense)}
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

      <ExpenseFormSheet open={sheetOpen} onOpenChange={setSheetOpen} expense={editingExpense} />

      <DeleteExpenseDialog
        expense={deletingExpense}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
      />
    </div>
  );
}
