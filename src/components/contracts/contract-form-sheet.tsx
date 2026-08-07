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
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useGetTemplatesQuery } from "@/lib/api/templates.api";
import { useCreateContractMutation, useUpdateContractMutation } from "@/lib/api/contracts.api";
import type { Contract } from "@/types/api";

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function ContractFormSheet({
  open,
  onOpenChange,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}) {
  const t = useTranslations("pages.contracts.form");
  const isEdit = !!contract;

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: deals } = useGetDealsQuery();
  const { data: templates } = useGetTemplatesQuery({ type: "Contract" });
  const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
  const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation();
  const isSubmitting = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [content, setContent] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(contract?.title ?? "");
      setCounterpartyName(contract?.counterpartyName ?? "");
      setContactId(contract?.contactId ?? "");
      setDealId(contract?.dealId ?? "");
      setTemplateId("");
      setContent(contract?.content ?? "");
      setEffectiveDate(contract?.effectiveDate?.slice(0, 10) ?? "");
      setExpiryDate(contract?.expiryDate?.slice(0, 10) ?? "");
    }
  }

  // Backend requires counterpartyName even though the schema marks it nullable.
  const canSubmit = title.trim().length >= 2 && counterpartyName.trim().length >= 1;

  const handleTemplateChange = (value: string | null) => {
    const id = !value || value === NONE ? "" : value;
    setTemplateId(id);
    const template = templates?.find((tpl) => tpl.id === id);
    if (template?.content) setContent(template.content);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (isEdit && contract) {
        await updateContract({
          id: contract.id,
          body: {
            title: title.trim(),
            counterpartyName: counterpartyName.trim() || undefined,
            contactId: contactId || undefined,
            dealId: dealId || undefined,
            content: content || undefined,
            effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : undefined,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
          },
        }).unwrap();
      } else {
        await createContract({
          title: title.trim(),
          counterpartyName: counterpartyName.trim() || undefined,
          contactId: contactId || undefined,
          dealId: dealId || undefined,
          templateId: templateId || undefined,
          content: content || undefined,
          effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : undefined,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        }).unwrap();
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

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label htmlFor="contract-title" className="text-xs font-medium text-text-tertiary uppercase">
              {t("titleField")}
            </label>
            <input id="contract-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contract-counterparty" className="text-xs font-medium text-text-tertiary uppercase">
              {t("counterparty")}
            </label>
            <input
              id="contract-counterparty"
              className={inputClass}
              value={counterpartyName}
              onChange={(e) => setCounterpartyName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contract-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("contact")}
            </label>
            <Select value={contactId || NONE} onValueChange={(value) => setContactId(value === NONE ? "" : (value ?? ""))}>
              <SelectTrigger id="contract-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (value === NONE || !value) return t("none");
                    const c = contactsPage?.data.find((x) => x.id === value);
                    return c ? [c.firstName, c.lastName].filter(Boolean).join(" ") : t("none");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("none")}</SelectItem>
                {contactsPage?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contract-deal" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedDeal")}
            </label>
            <Select value={dealId || NONE} onValueChange={(value) => setDealId(value === NONE ? "" : (value ?? ""))}>
              <SelectTrigger id="contract-deal" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("none")
                      : (deals?.find((d) => d.id === value)?.title ?? t("none"))
                  }
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

          {!isEdit && (
            <div className="space-y-1.5">
              <label htmlFor="contract-template" className="text-xs font-medium text-text-tertiary uppercase">
                {t("template")}
              </label>
              <Select value={templateId || NONE} onValueChange={handleTemplateChange}>
                <SelectTrigger id="contract-template" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === NONE || !value
                        ? t("noTemplate")
                        : (templates?.find((tpl) => tpl.id === value)?.name ?? t("noTemplate"))
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("noTemplate")}</SelectItem>
                  {templates?.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="contract-effective" className="text-xs font-medium text-text-tertiary uppercase">
                {t("effectiveDate")}
              </label>
              <input
                id="contract-effective"
                type="date"
                className={inputClass}
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contract-expiry" className="text-xs font-medium text-text-tertiary uppercase">
                {t("expiryDate")}
              </label>
              <input
                id="contract-expiry"
                type="date"
                className={inputClass}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contract-content" className="text-xs font-medium text-text-tertiary uppercase">
              {t("content")}
            </label>
            <textarea
              id="contract-content"
              className={`${inputClass} min-h-40 resize-y font-mono text-xs`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
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
