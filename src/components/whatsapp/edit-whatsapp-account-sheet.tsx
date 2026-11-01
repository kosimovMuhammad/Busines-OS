"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUpdateWhatsappAccountMutation } from "@/lib/api/whatsapp.api";
import {
  createUpdateWhatsappAccountSchema,
  type UpdateWhatsappAccountFormValues,
} from "@/lib/schemas/whatsapp-account.schema";
import type { WhatsappAccount } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function EditWhatsappAccountSheet({
  account,
  onOpenChange,
}: {
  account: WhatsappAccount | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.whatsapp.editSheet");
  const tValidation = useTranslations("validation");
  const [updateAccount, { isLoading }] = useUpdateWhatsappAccountMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateWhatsappAccountFormValues>({
    resolver: zodResolver(
      createUpdateWhatsappAccountSchema({ required: tValidation("required") })
    ),
    defaultValues: { verifiedName: "" },
  });

  useEffect(() => {
    if (account) reset({ verifiedName: account.verifiedName ?? "" });
  }, [account, reset]);

  const onSubmit = async (values: UpdateWhatsappAccountFormValues) => {
    if (!account) return;
    try {
      await updateAccount({
        id: account.id,
        body: { verifiedName: values.verifiedName.trim() },
      }).unwrap();
      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={!!account} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="whatsapp-edit-verifiedName"
              className="text-xs font-medium text-text-tertiary uppercase"
            >
              {t("verifiedNameLabel")}
            </label>
            <input
              id="whatsapp-edit-verifiedName"
              className={inputClass}
              {...register("verifiedName")}
            />
            {errors.verifiedName && (
              <p className="text-xs text-danger">{errors.verifiedName.message}</p>
            )}
          </div>
        </form>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
