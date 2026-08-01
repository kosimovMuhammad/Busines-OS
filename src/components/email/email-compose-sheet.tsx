"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, TriangleAlert } from "lucide-react";
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
import { useSendEmailMutation } from "@/lib/api/email.api";

const NO_CONTACT = "__no_contact__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function EmailComposeSheet({
  open,
  onOpenChange,
  defaultContactId,
  defaultSubject,
  defaultBody,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContactId?: string;
  defaultSubject?: string;
  defaultBody?: string;
}) {
  const t = useTranslations("pages.email.composeSheet");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const [sendEmail, { isLoading }] = useSendEmailMutation();

  const [contactId, setContactId] = useState(defaultContactId ?? "");
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [body, setBody] = useState(defaultBody ?? "");
  const [guidance, setGuidance] = useState<"badRequest" | "unavailable" | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setContactId(defaultContactId ?? "");
      setSubject(defaultSubject ?? "");
      setBody(defaultBody ?? "");
      setGuidance(null);
    }
  }

  const canSubmit = contactId && subject.trim() && body.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setGuidance(null);
    try {
      await sendEmail({ contactId, subject: subject.trim(), body: body.trim() }).unwrap();
      onOpenChange(false);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setGuidance(status === 400 ? "badRequest" : "unavailable");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {guidance && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>{t(guidance)}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("contact")}
            </label>
            <Select
              value={contactId || NO_CONTACT}
              onValueChange={(value) =>
                setContactId(value === NO_CONTACT || !value ? "" : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const contact = contactsPage?.data.find((c) => c.id === value);
                    return contact
                      ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
                      : t("selectContact");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CONTACT} disabled>
                  {t("selectContact")}
                </SelectItem>
                {contactsPage?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("subject")}
            </label>
            <input
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("body")}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${inputClass} min-h-40 resize-none`}
            />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("send")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
