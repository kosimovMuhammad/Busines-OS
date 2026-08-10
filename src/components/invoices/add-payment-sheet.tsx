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
import { useAddPaymentMutation } from "@/lib/api/invoices.api";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { INVOICE_MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import type { PaymentMethod } from "@/types/enums";

const METHODS: PaymentMethod[] = ["Cash", "BankTransfer", "Card", "Other"];

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function AddPaymentSheet({
  open,
  onOpenChange,
  invoiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
}) {
  const t = useTranslations("pages.invoices.paymentSheet");
  const tMethod = useTranslations("enums.paymentMethod");
  const [addPayment, { isLoading }] = useAddPaymentMutation();
  const canMutate = useCanMutate(INVOICE_MUTATION_ALLOWED_ROLES);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAmount("");
      setMethod("Cash");
      setNotes("");
    }
  }

  const canSubmit = Number(amount) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await addPayment({
        invoiceId,
        body: { amount: Number(amount), method, notes: notes.trim() || undefined },
      }).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <label htmlFor="payment-amount" className="text-xs font-medium text-text-tertiary uppercase">
              {t("amount")}
            </label>
            <input
              id="payment-amount"
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="payment-method" className="text-xs font-medium text-text-tertiary uppercase">
              {t("method")}
            </label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue>{(value: string) => tMethod(value as PaymentMethod)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {tMethod(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="payment-notes" className="text-xs font-medium text-text-tertiary uppercase">
              {t("notes")}
            </label>
            <textarea
              id="payment-notes"
              className={`${inputClass} min-h-16 resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit || !canMutate}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
