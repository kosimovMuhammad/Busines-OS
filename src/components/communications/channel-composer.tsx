"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Paperclip, Smile, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateNoteMutation } from "@/lib/api/communications.api";
import { useSendWhatsappMessageMutation } from "@/lib/api/whatsapp.api";
import { useSendTelegramMessageMutation } from "@/lib/api/telegram.api";
import { useSendInstagramMessageMutation } from "@/lib/api/instagram.api";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { useAiFeatureEnabled } from "@/lib/hooks/useAiFeatureEnabled";
import { cn } from "@/lib/utils";
import { CHANNEL_ICON } from "./channel-visuals";
import type { Contact } from "@/types/api";

// ASP.NET ProblemDetails / plain { message } / bare string bodies.
function extractErrorMessage(err: unknown): string | null {
  const data = (err as { data?: unknown })?.data;
  if (typeof data === "string") return data.trim() || null;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["message", "detail", "error", "title"]) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return null;
}

type ComposerChannel = "ManualNote" | "Whatsapp" | "Telegram" | "Instagram" | "Email";

const SEND_NAMESPACE: Partial<Record<ComposerChannel, string>> = {
  Whatsapp: "pages.whatsapp.composer",
  Telegram: "pages.telegram.composer",
  Instagram: "pages.instagram.composer",
};

export function ChannelComposer({
  contact,
  hasTelegramLink,
  hasInstagramLink,
  onSaved,
  onOpenEmail,
}: {
  contact: Contact;
  hasTelegramLink: boolean;
  hasInstagramLink: boolean;
  onSaved?: () => void;
  onOpenEmail: () => void;
}) {
  const t = useTranslations();
  const canMutate = useCanMutate();
  const aiEnabled = useAiFeatureEnabled();

  const tabs: ComposerChannel[] = [
    "ManualNote",
    ...(contact.phone ? (["Whatsapp"] as const) : []),
    ...(hasTelegramLink ? (["Telegram"] as const) : []),
    ...(hasInstagramLink ? (["Instagram"] as const) : []),
    ...(contact.email ? (["Email"] as const) : []),
  ];

  const [activeTab, setActiveTab] = useState<ComposerChannel>("ManualNote");
  const [content, setContent] = useState("");
  const [guidance, setGuidance] = useState<"badRequest" | "unavailable" | null>(null);
  const [guidanceDetail, setGuidanceDetail] = useState<string | null>(null);

  const [createNote, { isLoading: isNoteLoading }] = useCreateNoteMutation();
  const [sendWhatsapp, { isLoading: isWhatsappLoading }] = useSendWhatsappMessageMutation();
  const [sendTelegram, { isLoading: isTelegramLoading }] = useSendTelegramMessageMutation();
  const [sendInstagram, { isLoading: isInstagramLoading }] = useSendInstagramMessageMutation();

  const isLoading = isNoteLoading || isWhatsappLoading || isTelegramLoading || isInstagramLoading;

  const selectTab = (tab: ComposerChannel) => {
    if (tab === "Email") {
      onOpenEmail();
      return;
    }
    setActiveTab(tab);
    setGuidance(null);
    setGuidanceDetail(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setGuidance(null);
    setGuidanceDetail(null);
    try {
      if (activeTab === "ManualNote") {
        await createNote({ contactId: contact.id, content: content.trim() }).unwrap();
      } else if (activeTab === "Whatsapp") {
        await sendWhatsapp({ contactId: contact.id, message: content.trim() }).unwrap();
      } else if (activeTab === "Telegram") {
        await sendTelegram({ contactId: contact.id, message: content.trim() }).unwrap();
      } else if (activeTab === "Instagram") {
        await sendInstagram({ contactId: contact.id, message: content.trim() }).unwrap();
      }
      setContent("");
      onSaved?.();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setGuidance(status === 400 ? "badRequest" : "unavailable");
      // Instagram 400s carry a specific reason (e.g. the contact hasn't
      // messaged first) - show the backend's own message inline.
      if (activeTab === "Instagram" && status === 400) setGuidanceDetail(extractErrorMessage(err));
    }
  };

  if (!canMutate) return null;

  const namespace = SEND_NAMESPACE[activeTab];
  const firstName = contact.firstName || "contact";
  const placeholder =
    activeTab === "ManualNote"
      ? t("pages.communications.composerPlaceholder")
      : namespace
        ? `Reply to ${firstName}...`
        : "";
  const sendLabel =
    activeTab === "ManualNote"
      ? t("pages.communications.addNote")
      : namespace
        ? t(`${namespace}.send`)
        : "";

  return (
    <div className="border-t border-border-subtle/50 bg-background p-4">
      {/* Channel tabs */}
      {tabs.length > 1 && (
        <div className="mb-3 flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab === "Email" ? CHANNEL_ICON.Email : CHANNEL_ICON[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => selectTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab && tab !== "Email"
                    ? "bg-surface-elevated text-text-primary"
                    : "text-text-tertiary hover:bg-surface-elevated/60 hover:text-text-secondary"
                )}
              >
                <Icon className="size-3.5" />
                {tab === "ManualNote" ? t("pages.communications.noteSheet.title") : t(`enums.commChannel.${tab}`)}
              </button>
            );
          })}
        </div>
      )}

      {guidance && namespace && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{guidanceDetail ?? t(`${namespace}.${guidance}`)}</span>
        </div>
      )}

      {activeTab === "Instagram" && (
        <p className="mb-3 text-xs text-text-tertiary">{t("pages.instagram.composer.coldOutreachHint")}</p>
      )}

      {/* Composer box */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle/50 bg-surface p-3 focus-within:border-accent-primary/30 focus-within:ring-1 focus-within:ring-accent-primary/20 transition-all">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          rows={2}
          className="flex-1 resize-none bg-transparent px-1 py-1 text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-secondary"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-secondary"
            >
              <Smile className="size-4" />
            </button>
            {aiEnabled && (
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-accent-secondary transition-colors hover:bg-accent-secondary/10"
              >
                <Sparkles className="size-3.5" />
                AI draft
              </button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            className="rounded-xl px-5"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {sendLabel || "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
