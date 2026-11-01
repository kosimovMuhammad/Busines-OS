"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useCreateInvoiceMutation, useUpdateInvoiceMutation } from "@/lib/api/invoices.api";
import { createInvoiceSchema, type InvoiceFormValues } from "@/lib/schemas/invoice.schema";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { INVOICE_MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import type { Invoice } from "@/types/api";

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function InvoiceFormSheet({
  open,
  onOpenChange,
  invoice,
  defaultContactId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  defaultContactId?: string;
}) {
  const t = useTranslations("pages.invoices.form");
  const tValidation = useTranslations("validation");
  const isEdit = !!invoice;

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: deals } = useGetDealsQuery();
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const isSubmitting = isCreating || isUpdating;
  const canMutate = useCanMutate(INVOICE_MUTATION_ALLOWED_ROLES);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema({ required: tValidation("required") })),
    defaultValues: { contactId: "", amount: "", dueDate: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      contactId: invoice?.contactId ?? defaultContactId ?? "",
      dealId: invoice?.dealId ?? "",
      amount: invoice ? String(invoice.amount) : "",
      currency: invoice?.currency ?? "TJS",
      dueDate: invoice?.dueDate?.slice(0, 10) ?? "",
      notes: invoice?.notes ?? "",
    });
  }, [open, invoice, defaultContactId, reset]);

  const contactId = watch("contactId");
  const dealId = watch("dealId");

  const onSubmit = async (values: InvoiceFormValues) => {
    const body = {
      contactId: values.contactId,
      dealId: values.dealId || undefined,
      amount: Number(values.amount),
      currency: values.currency || undefined,
      dueDate: new Date(values.dueDate).toISOString(),
      notes: values.notes || undefined,
    };

    try {
      if (isEdit && invoice) {
        await updateInvoice({ id: invoice.id, body }).unwrap();
      } else {
        await createInvoice(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="invoice-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("contact")}
            </label>
            <Select
              value={contactId || null}
              onValueChange={(value) =>
                setValue("contactId", value || "")
              }
            >
              <SelectTrigger id="invoice-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const c = contactsPage?.data.find((x) => x.id === value);
                    return c
                      ? [c.firstName, c.lastName].filter(Boolean).join(" ")
                      : t("selectContact");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {contactsPage?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contactId && (
              <p className="text-xs text-danger">{errors.contactId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invoice-deal" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedDeal")}
            </label>
            <Select
              value={dealId || NONE}
              onValueChange={(value) =>
                setValue("dealId", value === NONE || !value ? "" : value)
              }
            >
              <SelectTrigger id="invoice-deal" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const d = deals?.find((x) => x.id === value);
                    return d ? d.title : t("none");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("none")}</SelectItem>
                {deals?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="invoice-amount" className="text-xs font-medium text-text-tertiary uppercase">
                {t("amount")}
              </label>
              <input
                id="invoice-amount"
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-danger">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="invoice-currency" className="text-xs font-medium text-text-tertiary uppercase">
                {t("currency")}
              </label>
              <input id="invoice-currency" className={inputClass} {...register("currency")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invoice-dueDate" className="text-xs font-medium text-text-tertiary uppercase">
              {t("dueDate")}
            </label>
            <input id="invoice-dueDate" className={inputClass} type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-xs text-danger">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invoice-notes" className="text-xs font-medium text-text-tertiary uppercase">
              {t("notes")}
            </label>
            <textarea
              id="invoice-notes"
              className={`${inputClass} min-h-20 resize-none`}
              {...register("notes")}
            />
          </div>
        </form>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting || !canMutate}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
