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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useGetCategoriesQuery } from "@/lib/api/categories.api";
import { useCreateProductMutation, useUpdateProductMutation } from "@/lib/api/products.api";
import type { Product } from "@/types/api";
import type { ProductUnit } from "@/types/enums";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const NONE = "__none__";

const UNITS: ProductUnit[] = ["Piece", "Kg", "Gram", "Liter", "Milliliter", "Meter", "Box", "Pack"];

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const t = useTranslations("pages.inventory.products.form");
  const tUnit = useTranslations("enums.productUnit");
  const isEdit = !!product;

  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("TJS");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("Piece");
  const [isActive, setIsActive] = useState(true);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(product?.name ?? "");
      setSku(product?.sku ?? "");
      setDescription(product?.description ?? "");
      setPrice(product ? String(product.price) : "");
      setCost(product ? String(product.cost) : "");
      setCurrency(product?.currency ?? "TJS");
      setCategoryId(product?.categoryId ?? "");
      setUnit(product?.unit ?? "Piece");
      setIsActive(product?.isActive ?? true);
    }
  }

  const canSubmit =
    name.trim().length >= 1 &&
    sku.trim() !== "" &&
    price.trim() !== "" &&
    cost.trim() !== "";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      cost: Number(cost),
      currency: currency.trim() || undefined,
      categoryId: categoryId || undefined,
      unit,
      isActive,
    };
    try {
      if (isEdit && product) {
        await updateProduct({ id: product.id, body }).unwrap();
      } else {
        await createProduct(body).unwrap();
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
            <label htmlFor="product-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="product-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-sku" className="text-xs font-medium text-text-tertiary uppercase">
              {t("sku")}
            </label>
            <input id="product-sku" className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="product-description"
              className={inputClass}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-price" className="text-xs font-medium text-text-tertiary uppercase">
                {t("price")}
              </label>
              <input
                id="product-price"
                type="number"
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-cost" className="text-xs font-medium text-text-tertiary uppercase">
                {t("cost")}
              </label>
              <input
                id="product-cost"
                type="number"
                className={inputClass}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-currency" className="text-xs font-medium text-text-tertiary uppercase">
              {t("currency")}
            </label>
            <input
              id="product-currency"
              className={inputClass}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("category")}</label>
            <Select
              value={categoryId || NONE}
              onValueChange={(value) => setCategoryId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("noCategory")
                      : (categories?.find((c) => c.id === value)?.name ?? t("noCategory"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("noCategory")}</SelectItem>
                {categories
                  ?.filter((c) => !c.isArchived)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">{t("unit")}</label>
            <Select value={unit} onValueChange={(value) => setUnit((value as ProductUnit) ?? "Piece")}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => tUnit(value as ProductUnit)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {tUnit(u)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            {t("isActive")}
          </label>
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
