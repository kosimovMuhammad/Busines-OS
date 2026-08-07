"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetBranchesQuery } from "@/lib/api/branches.api";
import { useCreateExpenseMutation, useUpdateExpenseMutation } from "@/lib/api/expenses.api";
import type { Expense } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const NONE = "__none__";

export function ExpenseFormSheet({
  open,
  onOpenChange,
  expense,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}) {
  const t = useTranslations("pages.inventory.expenses.form");
  const isEdit = !!expense;
  const currentUserId = useAppSelector((s) => s.auth.user?.id) ?? "";

  const { data: users } = useGetUsersQuery();
  const { data: branches } = useGetBranchesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const isSubmitting = isCreating || isUpdating;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("TJS");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [paidById, setPaidById] = useState("");
  const [branchId, setBranchId] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDescription(expense?.description ?? "");
      setAmount(expense ? String(expense.amount) : "");
      setCurrency(expense?.currency ?? "TJS");
      setCategory(expense?.category ?? "");
      setDate(expense?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
      setPaidById(expense?.paidById ?? currentUserId);
      setBranchId(expense?.branchId ?? "");
    }
  }

  const canSubmit = amount.trim() !== "" && date.trim() !== "" && !!paidById;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      description: description.trim() || undefined,
      amount: Number(amount),
      currency: currency.trim() || undefined,
      category: category.trim() || undefined,
      date: new Date(date).toISOString(),
      paidById,
      branchId: branchId || undefined,
    };
    try {
      if (isEdit && expense) {
        await updateExpense({ id: expense.id, body }).unwrap();
      } else {
        await createExpense(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label htmlFor="expense-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <input
              id="expense-description"
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="expense-amount" className="text-xs font-medium text-text-tertiary uppercase">
                {t("amount")}
              </label>
              <input
                id="expense-amount"
                type="number"
                className={inputClass}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="expense-currency" className="text-xs font-medium text-text-tertiary uppercase">
                {t("currency")}
              </label>
              <input
                id="expense-currency"
                className={inputClass}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expense-category" className="text-xs font-medium text-text-tertiary uppercase">
              {t("category")}
            </label>
            <input
              id="expense-category"
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("categoryPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expense-date" className="text-xs font-medium text-text-tertiary uppercase">
              {t("date")}
            </label>
            <input
              id="expense-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("paidBy")}</label>
            <Select value={paidById || NONE} onValueChange={(value) => setPaidById(value === NONE || !value ? "" : value)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("selectUser")
                      : (users?.find((u) => u.id === value)?.name ?? t("selectUser"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("branch")}</label>
            <Select
              value={branchId || NONE}
              onValueChange={(value) => setBranchId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("noBranch")
                      : (branches?.find((b) => b.id === value)?.name ?? t("noBranch"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("noBranch")}</SelectItem>
                {branches?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
