"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery } from "@/lib/api/products.api";
import { useGetBranchesQuery } from "@/lib/api/branches.api";
import { useStockInMutation, useStockOutMutation } from "@/lib/api/inventory.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const NONE = "__none__";

export function StockMovementDialog({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "in" | "out";
}) {
  const t = useTranslations("pages.inventory.stock.movementDialog");

  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data ?? [];
  const { data: branches } = useGetBranchesQuery();

  const [stockIn, { isLoading: isStockingIn }] = useStockInMutation();
  const [stockOut, { isLoading: isStockingOut }] = useStockOutMutation();
  const isSubmitting = isStockingIn || isStockingOut;

  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setProductId("");
      setBranchId("");
      setQuantity("1");
      setReason("");
      setReference("");
    }
  }

  const canSubmit = !!productId && Number(quantity) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      productId,
      branchId: branchId || undefined,
      quantity: Number(quantity),
      reason: reason.trim() || undefined,
      reference: reference.trim() || undefined,
    };
    try {
      if (mode === "in") {
        await stockIn(body).unwrap();
      } else {
        await stockOut(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "in" ? t("stockInTitle") : t("stockOutTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("product")}</label>
            <Select
              value={productId || NONE}
              onValueChange={(value) => setProductId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("selectProduct")
                      : (products.find((p) => p.id === value)?.name ?? t("selectProduct"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
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

          <div className="space-y-1.5">
            <label htmlFor="stock-quantity" className="text-xs font-medium text-text-tertiary uppercase">
              {t("quantity")}
            </label>
            <input
              id="stock-quantity"
              type="number"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stock-reason" className="text-xs font-medium text-text-tertiary uppercase">
              {t("reason")}
            </label>
            <input
              id="stock-reason"
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stock-reference" className="text-xs font-medium text-text-tertiary uppercase">
              {t("reference")}
            </label>
            <input
              id="stock-reference"
              className={inputClass}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "in" ? t("confirmIn") : t("confirmOut")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
