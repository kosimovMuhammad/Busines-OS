"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, MessageSquareText, StickyNote } from "lucide-react";
import {
  useGetContactTimelineQuery,
} from "@/lib/api/contacts.api";
import { useCreateNoteMutation } from "@/lib/api/communications.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { CommChannel } from "@/types/enums";

const CHANNEL_ICON: Record<CommChannel, typeof MessageSquareText> = {
  Whatsapp: MessageSquareText,
  Email: MessageSquareText,
  ManualNote: StickyNote,
  PhoneCall: MessageSquareText,
};

export function ContactTimeline({ contactId }: { contactId: string }) {
  const t = useTranslations("pages.contacts.timeline");
  const locale = useLocale();
  const { data, isLoading } = useGetContactTimelineQuery(contactId, {
    skip: !contactId,
  });
  const [createNote, { isLoading: isSubmitting }] = useCreateNoteMutation();
  const [note, setNote] = useState("");

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const items = [...(data ?? [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await createNote({ contactId, content: note.trim() }).unwrap();
      setNote("");
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>

      <div className="mt-4 flex gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="min-h-16 flex-1 resize-none rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />
        <Button
          type="button"
          onClick={handleAddNote}
          disabled={isSubmitting || !note.trim()}
          className="self-end"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("addNote")}
        </Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={MessageSquareText} title={t("empty")} />
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const Icon = CHANNEL_ICON[item.channel] ?? MessageSquareText;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap text-text-primary">
                      {item.content}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {formatter.format(new Date(item.timestamp))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
