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
import { useCreateNoteMutation } from "@/lib/api/communications.api";

const NO_CONTACT = "__no_contact__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function AddNoteSheet({
  open,
  onOpenChange,
  defaultContactId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContactId?: string;
}) {
  const t = useTranslations("pages.communications.noteSheet");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const [createNote, { isLoading }] = useCreateNoteMutation();

  const [contactId, setContactId] = useState("");
  const [content, setContent] = useState("");
  // Reset the form fields whenever the sheet transitions to open, per
  // React's documented "adjust state during render" pattern for
  // resetting state on a prop change (avoids a setState-in-effect lint
  // error and the extra render an effect would cost).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setContactId(defaultContactId ?? "");
      setContent("");
    }
  }

  const handleSubmit = async () => {
    if (!contactId || !content.trim()) return;
    try {
      await createNote({ contactId, content: content.trim() }).unwrap();
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
          <div className="space-y-1.5">
            <label htmlFor="note-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("contact")}
            </label>
            <Select
              value={contactId || NO_CONTACT}
              onValueChange={(value) =>
                setContactId(value === NO_CONTACT || !value ? "" : value)
              }
            >
              <SelectTrigger id="note-contact" className="w-full">
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
            <label htmlFor="note-content" className="text-xs font-medium text-text-tertiary uppercase">
              {t("content")}
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClass} min-h-32 resize-none`}
              placeholder={t("contentPlaceholder")}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !contactId || !content.trim()}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
