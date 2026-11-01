"use client";

import { useState } from "react";
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
import { useConnectInstagramAccountMutation } from "@/lib/api/instagram.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function InstagramConnectSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.instagram.connectSheet");
  const [connectAccount, { isLoading }] = useConnectInstagramAccountMutation();

  const [accessToken, setAccessToken] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAccessToken("");
    }
  }

  const canSubmit = accessToken.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await connectAccount({ accessToken: accessToken.trim() }).unwrap();
      toast.success(t("success"));
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
            <label htmlFor="instagram-accessToken" className="text-xs font-medium text-text-tertiary uppercase">
              {t("accessToken")}
            </label>
            <input
              id="instagram-accessToken"
              className={inputClass}
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
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
