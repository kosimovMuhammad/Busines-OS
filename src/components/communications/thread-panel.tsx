"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { History, Phone, MoreHorizontal, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { CommunicationsFeed } from "./communications-feed";
import { ChannelComposer } from "./channel-composer";
import { CHANNEL_ICON, CHANNEL_COLOR } from "./channel-visuals";
import type { Communication, Contact } from "@/types/api";

export function ThreadPanel({
  contact,
  communications,
  isLoading,
  contactsById,
  hasTelegramLink,
  hasInstagramLink,
  onNewDeal,
  onOpenEmail,
}: {
  contact: Contact;
  communications: Communication[];
  isLoading: boolean;
  contactsById: Map<string, Contact>;
  hasTelegramLink: boolean;
  hasInstagramLink: boolean;
  onNewDeal: () => void;
  onOpenEmail: () => void;
}) {
  const t = useTranslations("pages.communications");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [contact.id, communications.length]);

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const latestComm = communications[communications.length - 1];
  const activeChannel = latestComm?.channel || "Whatsapp";
  const subtitle = activeChannel === "Whatsapp" || activeChannel === "Telegram" 
    ? `${activeChannel} ${contact.phone || ""}`
    : activeChannel === "Email" ? contact.email : contact.position;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 px-6 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-text-secondary ring-1 ring-border-subtle/50">
            {initials(fullName) || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-text-primary">{fullName}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
              <span 
                className="size-1.5 rounded-full" 
                style={{ background: CHANNEL_COLOR[activeChannel] || "currentColor" }} 
              />
              <p className="truncate">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" className="size-9 rounded-full bg-transparent border-border-subtle/50 text-text-secondary hover:bg-surface-elevated">
            <Phone className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9 rounded-full bg-transparent border-border-subtle/50 text-text-secondary hover:bg-surface-elevated">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-background px-6 py-5">
        <CommunicationsFeed
          communications={communications}
          isLoading={isLoading}
          contactsById={contactsById}
        />
      </div>

      <ChannelComposer
        contact={contact}
        hasTelegramLink={hasTelegramLink}
        hasInstagramLink={hasInstagramLink}
        onOpenEmail={onOpenEmail}
        onSaved={() => {
          const el = scrollRef.current;
          if (el) requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
        }}
      />
    </div>
  );
}
