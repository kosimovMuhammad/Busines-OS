"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { useGetSuppliersQuery } from "@/lib/api/suppliers.api";
import { useGetProductsQuery } from "@/lib/api/products.api";
import {
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from "@/lib/api/purchaseOrders.api";
import type { PurchaseOrder } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";
const smallInputClass =
  "min-w-0 flex-1 rounded-lg border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const NONE = "__none__";

type LineItemRow = { productId: string; quantity: string; unitCost: string };

export function PurchaseOrderFormSheet({
  open,
  onOpenChange,
  purchaseOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}) {
  const t = useTranslations("pages.inventory.purchaseOrders.form");
  const isEdit = !!purchaseOrder;

  const { data: suppliers } = useGetSuppliersQuery();
  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data ?? [];

  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();
  const isSubmitting = isCreating || isUpdating;

  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [currency, setCurrency] = useState("TJS");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemRow[]>([]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSupplierId(purchaseOrder?.supplierId ?? "");
      setExpectedDate(purchaseOrder?.expectedDate?.slice(0, 10) ?? "");
      setCurrency(purchaseOrder?.currency ?? "TJS");
      setNotes(purchaseOrder?.notes ?? "");
      setLineItems(
        purchaseOrder?.lineItems.map((li) => ({
          productId: li.productId,
          quantity: String(li.quantity),
          unitCost: String(li.unitCost),
        })) ?? []
      );
    }
  }

  const updateLineItem = (index: number, patch: Partial<LineItemRow>) => {
    setLineItems((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const removeLineItem = (index: number) => {
    setLineItems((rows) => rows.filter((_, i) => i !== index));
  };
  const addLineItem = () => {
    setLineItems((rows) => [...rows, { productId: "", quantity: "1", unitCost: "0" }]);
  };

  const validLineItems = lineItems.filter((li) => li.productId && Number(li.quantity) > 0);
  const canSubmit = validLineItems.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      supplierId: supplierId || undefined,
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : undefined,
      currency: currency.trim() || undefined,
      notes: notes.trim() || undefined,
      lineItems: validLineItems.map((li) => ({
        productId: li.productId,
        quantity: Number(li.quantity),
        unitCost: Number(li.unitCost),
      })),
    };
    try {
      if (isEdit && purchaseOrder) {
        await updatePurchaseOrder({ id: purchaseOrder.id, body }).unwrap();
      } else {
        await createPurchaseOrder(body).unwrap();
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
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("supplier")}</label>
            <Select
              value={supplierId || NONE}
              onValueChange={(value) => setSupplierId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("noSupplier")
                      : (suppliers?.data.find((s) => s.id === value)?.name ?? t("noSupplier"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("noSupplier")}</SelectItem>
                {suppliers?.data.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="po-expected-date" className="text-xs font-medium text-text-tertiary uppercase">
                {t("expectedDate")}
              </label>
              <input
                id="po-expected-date"
                type="date"
                className={inputClass}
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="po-currency" className="text-xs font-medium text-text-tertiary uppercase">
                {t("currency")}
              </label>
              <input
                id="po-currency"
                className={inputClass}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="po-notes" className="text-xs font-medium text-text-tertiary uppercase">
              {t("notes")}
            </label>
            <textarea
              id="po-notes"
              className={inputClass}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2 border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
              {t("lineItemsSection")}
            </p>

            {lineItems.map((row, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Select
                  value={row.productId || NONE}
                  onValueChange={(value) =>
                    updateLineItem(index, { productId: value === NONE || !value ? "" : value })
                  }
                >
                  <SelectTrigger className="min-w-0 flex-1">
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
                <input
                  type="number"
                  className={`${smallInputClass} w-16 flex-none`}
                  placeholder={t("quantity")}
                  value={row.quantity}
                  onChange={(e) => updateLineItem(index, { quantity: e.target.value })}
                />
                <input
                  type="number"
                  className={`${smallInputClass} w-20 flex-none`}
                  placeholder={t("unitCost")}
                  value={row.unitCost}
                  onChange={(e) => updateLineItem(index, { unitCost: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={t("removeLineItem")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="size-3.5" />
              {t("addLineItem")}
            </Button>
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
