"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
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
import { useGetUsersQuery } from "@/lib/api/users.api";
import {
  useCreateDealMutation,
  useUpdateDealMutation,
  useUpdateDealStageMutation,
} from "@/lib/api/deals.api";
import { createDealSchema, type DealFormValues } from "@/lib/schemas/deal.schema";
import { cn } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import type { Contact, Deal } from "@/types/api";
import type { DealStage } from "@/types/enums";

const UNASSIGNED = "__unassigned__";
const STAGES: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function DealFormSheet({
  open,
  onOpenChange,
  deal,
  contacts,
  defaultStage,
  defaultContactId,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  contacts: Contact[];
  defaultStage?: DealStage;
  defaultContactId?: string;
  onDelete?: () => void;
}) {
  const t = useTranslations("pages.deals.form");
  const tStage = useTranslations("enums.dealStage");
  const tValidation = useTranslations("validation");
  const isEdit = !!deal;

  const { data: users } = useGetUsersQuery();
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();
  const [updateDealStage, { isLoading: isUpdatingStage }] = useUpdateDealStageMutation();
  const isSubmitting = isCreating || isUpdating || isUpdatingStage;
  const canMutate = useCanMutate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(
      createDealSchema({
        required: tValidation("required"),
        invalidAmount: tValidation("invalidAmount"),
      })
    ),
    defaultValues: { title: "", contactId: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: deal?.title ?? "",
      contactId: deal?.contactId ?? defaultContactId ?? "",
      value: deal ? String(deal.value) : "",
      currency: deal?.currency ?? "TJS",
      stage: deal?.stage ?? defaultStage ?? "Lead",
      probability: deal?.probability != null ? String(deal.probability) : "",
      expectedCloseDate: deal?.expectedCloseDate?.slice(0, 10) ?? "",
      ownerId: deal?.ownerId ?? "",
    });
  }, [open, deal, defaultStage, defaultContactId, reset]);

  const contactId = watch("contactId");
  const stage = watch("stage");
  const ownerId = watch("ownerId");

  const onSubmit = async (values: DealFormValues) => {
    const newStage = (values.stage as DealStage) || undefined;
    // PATCH /deals/:id rejects a `stage` field - stage only changes via the
    // dedicated /deals/:id/stage endpoint (same one drag-and-drop uses).
    const body = {
      contactId: values.contactId,
      title: values.title,
      value: values.value ? Number(values.value) : 0,
      currency: values.currency || undefined,
      probability: values.probability ? Number(values.probability) : undefined,
      expectedCloseDate: values.expectedCloseDate
        ? new Date(values.expectedCloseDate).toISOString()
        : undefined,
      ownerId: values.ownerId || undefined,
    };

    try {
      if (isEdit && deal) {
        await updateDeal({ id: deal.id, body }).unwrap();
        if (newStage && newStage !== deal.stage) {
          await updateDealStage({ id: deal.id, stage: newStage }).unwrap();
        }
      } else {
        await createDeal({ ...body, stage: newStage }).unwrap();
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
            <label htmlFor="deal-title" className="text-xs font-medium text-text-tertiary uppercase">
              {t("title")}
            </label>
            <input id="deal-title" className={inputClass} {...register("title")} />
            {errors.title && (
              <p className="text-xs text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deal-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("contact")}
            </label>
            <Select
              value={contactId || null}
              onValueChange={(value) =>
                setValue("contactId", value || "")
              }
            >
              <SelectTrigger id="deal-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const contact = contacts.find((c) => c.id === value);
                    return contact
                      ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
                      : t("selectContact");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="deal-value" className="text-xs font-medium text-text-tertiary uppercase">
                {t("value")}
              </label>
              <input
                id="deal-value"
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                {...register("value")}
              />
              {errors.value && <p className="text-xs text-danger">{errors.value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="deal-currency" className="text-xs font-medium text-text-tertiary uppercase">
                {t("currency")}
              </label>
              <input id="deal-currency" className={inputClass} {...register("currency")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deal-stage" className="text-xs font-medium text-text-tertiary uppercase">
              {t("stage")}
            </label>
            <Select
              value={stage || "Lead"}
              onValueChange={(value) => setValue("stage", value ?? "Lead")}
            >
              <SelectTrigger id="deal-stage" className="w-full">
                <SelectValue>
                  {(value: string) => tStage(value as DealStage)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tStage(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="deal-probability" className="text-xs font-medium text-text-tertiary uppercase">
                {t("probability")}
              </label>
              <input
                id="deal-probability"
                className={inputClass}
                type="number"
                min="0"
                max="100"
                {...register("probability")}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="deal-closeDate" className="text-xs font-medium text-text-tertiary uppercase">
                {t("closeDate")}
              </label>
              <input
                id="deal-closeDate"
                className={inputClass}
                type="date"
                {...register("expectedCloseDate")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deal-owner" className="text-xs font-medium text-text-tertiary uppercase">
              {t("owner")}
            </label>
            <Select
              value={ownerId || UNASSIGNED}
              onValueChange={(value) =>
                setValue("ownerId", value === UNASSIGNED || !value ? "" : value)
              }
            >
              <SelectTrigger id="deal-owner" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    !value || value === UNASSIGNED
                      ? t("unassigned")
                      : (users?.find((u) => u.id === value)?.name ?? t("unassigned"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>{t("unassigned")}</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <SheetFooter className={cn(isEdit && "flex-row justify-between")}>
          {isEdit && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={!canMutate}>
              <Trash2 className="size-4" />
              {t("delete")}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !canMutate}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
