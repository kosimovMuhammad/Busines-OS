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
import { useGetUsersQuery } from "@/lib/api/users.api";
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from "@/lib/api/contacts.api";
import {
  createContactSchema,
  type ContactFormValues,
} from "@/lib/schemas/contact.schema";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/api";

const UNASSIGNED = "__unassigned__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function ContactFormSheet({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}) {
  const t = useTranslations("pages.contacts.form");
  const tValidation = useTranslations("validation");
  const isEdit = !!contact;

  const { data: users } = useGetUsersQuery();
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(
      createContactSchema({
        required: tValidation("required"),
        invalidEmail: tValidation("invalidEmail"),
        invalidPhone: tValidation("invalidPhone"),
      })
    ),
    defaultValues: { firstName: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      position: contact?.position ?? "",
      companyName: contact?.companyName ?? "",
      notes: contact?.notes ?? "",
      ownerId: contact?.ownerId ?? "",
      tags: contact?.tags?.join(", ") ?? "",
    });
  }, [open, contact, reset]);

  const ownerId = watch("ownerId");

  const onSubmit = async (values: ContactFormValues) => {
    const body = {
      firstName: values.firstName,
      lastName: values.lastName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      position: values.position || undefined,
      companyName: values.companyName || undefined,
      notes: values.notes || undefined,
      ownerId: values.ownerId || undefined,
      tags: values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (isEdit && contact) {
        await updateContact({ id: contact.id, body }).unwrap();
      } else {
        await createContact(body).unwrap();
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
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("firstName")}
            </label>
            <input className={inputClass} {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-danger">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("lastName")}
            </label>
            <input className={inputClass} {...register("lastName")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("email")}
            </label>
            <input className={inputClass} type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("phone")}
            </label>
            <input
              className={inputClass}
              placeholder="+992901234567"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("position")}
            </label>
            <input className={inputClass} {...register("position")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("companyName")}
            </label>
            <input className={inputClass} {...register("companyName")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("owner")}
            </label>
            <Select
              value={ownerId || UNASSIGNED}
              onValueChange={(value) =>
                setValue("ownerId", value === UNASSIGNED || !value ? "" : value)
              }
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("tags")}
            </label>
            <input
              className={inputClass}
              placeholder={t("tagsPlaceholder")}
              {...register("tags")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("notes")}
            </label>
            <textarea
              className={cn(inputClass, "min-h-20 resize-none")}
              {...register("notes")}
            />
          </div>
        </form>

        <SheetFooter>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
