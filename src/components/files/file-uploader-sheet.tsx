"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Upload } from "lucide-react";
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
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { toast } from "sonner";

const NONE = "__none__";

export function FileUploaderSheet({
  open,
  onOpenChange,
  defaultContactId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContactId?: string;
}) {
  const t = useTranslations("pages.files.upload");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: deals } = useGetDealsQuery();
  const { upload, progress, isUploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contactId, setContactId] = useState(defaultContactId ?? "");
  const [dealId, setDealId] = useState("");

  const handleFileSelected = async (file: File) => {
    try {
      await upload(file, {
        contactId: contactId || undefined,
        dealId: dealId || undefined,
      });
      toast.success(t("uploaded"));
      onOpenChange(false);
    } catch {
      toast.error(t("storageUnavailable"));
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
            <label htmlFor="upload-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedContact")}
            </label>
            <Select
              value={contactId || NONE}
              onValueChange={(value) => setContactId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger id="upload-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const c = contactsPage?.data.find((x) => x.id === value);
                    return c
                      ? [c.firstName, c.lastName].filter(Boolean).join(" ")
                      : t("none");
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
            <label htmlFor="upload-deal" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedDeal")}
            </label>
            <Select
              value={dealId || NONE}
              onValueChange={(value) => setDealId(value === NONE || !value ? "" : value)}
            >
              <SelectTrigger id="upload-deal" className="w-full">
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

          {!contactId && !dealId && (
            <p className="text-xs text-danger">{t("relationRequired")}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
            }}
          />

          {isUploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-accent-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || (!contactId && !dealId)}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {t("chooseFile")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
