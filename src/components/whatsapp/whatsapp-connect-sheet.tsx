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
import { Button } from "@/components/ui/button";
import { useConnectWhatsappAccountMutation } from "@/lib/api/whatsapp.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function WhatsappConnectSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.whatsapp.connectSheet");
  const [connectAccount, { isLoading }] = useConnectWhatsappAccountMutation();

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifiedName, setVerifiedName] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhoneNumberId("");
      setWabaId("");
      setAccessToken("");
      setVerifiedName("");
    }
  }

  const canSubmit = phoneNumberId.trim() && wabaId.trim() && accessToken.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await connectAccount({
        phoneNumberId: phoneNumberId.trim(),
        wabaId: wabaId.trim(),
        accessToken: accessToken.trim(),
        verifiedName: verifiedName.trim() || undefined,
      }).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <p className="text-xs text-text-tertiary">{t("description")}</p>

          <div className="space-y-1.5">
            <label htmlFor="whatsapp-phoneNumberId" className="text-xs font-medium text-text-tertiary uppercase">
              {t("phoneNumberId")}
            </label>
            <input
              id="whatsapp-phoneNumberId"
              className={inputClass}
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="whatsapp-wabaId" className="text-xs font-medium text-text-tertiary uppercase">
              {t("wabaId")}
            </label>
            <input
              id="whatsapp-wabaId"
              className={inputClass}
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="whatsapp-accessToken" className="text-xs font-medium text-text-tertiary uppercase">
              {t("accessToken")}
            </label>
            <input
              id="whatsapp-accessToken"
              className={inputClass}
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="whatsapp-verifiedName" className="text-xs font-medium text-text-tertiary uppercase">
              {t("verifiedName")}
            </label>
            <input
              id="whatsapp-verifiedName"
              className={inputClass}
              value={verifiedName}
              onChange={(e) => setVerifiedName(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
