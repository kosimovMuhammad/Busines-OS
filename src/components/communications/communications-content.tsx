"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessagesSquare, SquarePen } from "lucide-react";
import { useGetCommunicationsQuery } from "@/lib/api/communications.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetTelegramChatLinksQuery } from "@/lib/api/telegram.api";
import { useGetInstagramConversationLinksQuery } from "@/lib/api/instagram.api";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ContactRail } from "./contact-rail";
import { ThreadPanel } from "./thread-panel";
import { ContactDetailPanel } from "./contact-detail-panel";
import { AddNoteSheet } from "./add-note-sheet";
import { DealFormSheet } from "@/components/deals/deal-form-sheet";
import { EmailComposeSheet } from "@/components/email/email-compose-sheet";
import type { Communication, Contact } from "@/types/api";
import type { CommChannel } from "@/types/enums";

export type ContactSummary = {
  contact: Contact;
  lastComm: Communication;
  channelCounts: Partial<Record<CommChannel, number>>;
  totalCount: number;
};

export function CommunicationsContent() {
  const t = useTranslations("pages.communications");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const prefillContactId = searchParams.get("contactId") ?? "";
  const prefillSubject = searchParams.get("subject") ?? "";
  const prefillBody = searchParams.get("body") ?? "";
  const hasEmailPrefill = !!(prefillSubject || prefillBody);

  const [selectedContactId, setSelectedContactId] = useState(prefillContactId);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [emailSheetOpen, setEmailSheetOpen] = useState(hasEmailPrefill);
  const hasAutoSelected = useRef(!!prefillContactId);

  useEffect(() => {
    if (hasEmailPrefill) router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: communications, isLoading: commsLoading } = useGetCommunicationsQuery();
  const { data: contactsPage, isLoading: contactsLoading } = useGetContactsQuery({ limit: 200 });
  const { data: telegramLinks } = useGetTelegramChatLinksQuery();
  const { data: instagramLinks } = useGetInstagramConversationLinksQuery();

  const contactsById = useMemo(() => {
    const map = new Map<string, Contact>();
    contactsPage?.data.forEach((c) => map.set(c.id, c));
    return map;
  }, [contactsPage]);

  const telegramLinkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    telegramLinks?.forEach((link) => link.contactId && ids.add(link.contactId));
    return ids;
  }, [telegramLinks]);

  const instagramLinkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    instagramLinks?.forEach((link) => link.contactId && ids.add(link.contactId));
    return ids;
  }, [instagramLinks]);

  const communicationsByContact = useMemo(() => {
    const map = new Map<string, Communication[]>();
    for (const comm of communications ?? []) {
      if (!comm.contactId) continue;
      const list = map.get(comm.contactId);
      if (list) list.push(comm);
      else map.set(comm.contactId, [comm]);
    }
    return map;
  }, [communications]);

  const allSummaries = useMemo<ContactSummary[]>(() => {
    const summaries: ContactSummary[] = [];
    for (const [contactId, comms] of communicationsByContact) {
      const contact = contactsById.get(contactId);
      if (!contact) continue;
      const lastComm = comms.reduce((latest, c) =>
        new Date(c.timestamp).getTime() > new Date(latest.timestamp).getTime() ? c : latest
      );
      const channelCounts: Partial<Record<CommChannel, number>> = {};
      for (const c of comms) channelCounts[c.channel] = (channelCounts[c.channel] ?? 0) + 1;
      summaries.push({ contact, lastComm, channelCounts, totalCount: comms.length });
    }
    return summaries.sort(
      (a, b) => new Date(b.lastComm.timestamp).getTime() - new Date(a.lastComm.timestamp).getTime()
    );
  }, [communicationsByContact, contactsById]);

  const filteredSummaries = useMemo(() => {
    let list = allSummaries;
    if (channel) {
      list = list.filter((s) => (s.channelCounts[channel as CommChannel] ?? 0) > 0);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const name = [s.contact.firstName, s.contact.lastName].filter(Boolean).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          (s.contact.companyName ?? "").toLowerCase().includes(q) ||
          (s.contact.email ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [allSummaries, search, channel]);

  useEffect(() => {
    if (!hasAutoSelected.current && !selectedContactId && allSummaries.length > 0) {
      hasAutoSelected.current = true;
      setSelectedContactId(allSummaries[0].contact.id);
    }
  }, [allSummaries, selectedContactId]);

  // The prefilled contact from an AI email draft might not have any
  // communications yet, so it won't be in allSummaries - fall back to the
  // plain contact record in that case.
  const selectedSummary = allSummaries.find((s) => s.contact.id === selectedContactId);
  const selectedContact = selectedSummary?.contact ?? contactsById.get(selectedContactId);

  const threadCommunications = useMemo(() => {
    if (!selectedContactId) return [];
    const list = communicationsByContact.get(selectedContactId) ?? [];
    return channel ? list.filter((c) => c.channel === channel) : list;
  }, [communicationsByContact, selectedContactId, channel]);

  const isLoading = commsLoading || contactsLoading;

  return (
    <div className="-m-4 h-[calc(100vh-4.5rem)] min-h-[560px] md:-m-8">
      <div className="grid h-full grid-cols-[280px_minmax(420px,1fr)_300px] divide-x divide-border-subtle overflow-x-auto bg-surface">
        <ContactRail
          summaries={filteredSummaries}
          isLoading={isLoading}
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
          search={search}
          onSearchChange={setSearch}
          channel={channel}
          onChannelChange={setChannel}
          onNewNote={() => setNoteSheetOpen(true)}
        />

        {selectedContact ? (
          <>
            <ThreadPanel
              contact={selectedContact}
              communications={threadCommunications}
              isLoading={commsLoading}
              contactsById={contactsById}
              hasTelegramLink={telegramLinkedContactIds.has(selectedContact.id)}
              hasInstagramLink={instagramLinkedContactIds.has(selectedContact.id)}
              onNewDeal={() => setDealSheetOpen(true)}
              onOpenEmail={() => setEmailSheetOpen(true)}
            />
            <ContactDetailPanel
              summary={selectedSummary ?? { contact: selectedContact, channelCounts: {} }}
              onNewDeal={() => setDealSheetOpen(true)}
            />
          </>
        ) : (
          <div className="col-span-2 flex items-center justify-center p-8">
            {!isLoading && (
              <EmptyState
                icon={MessagesSquare}
                title={allSummaries.length === 0 ? t("noConversations") : t("selectContactHint")}
                action={
                  allSummaries.length === 0 ? (
                    <Button type="button" size="sm" onClick={() => setNoteSheetOpen(true)}>
                      <SquarePen className="size-3.5" />
                      {t("addNote")}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        )}
      </div>

      <AddNoteSheet
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
        defaultContactId={selectedContactId || undefined}
      />

      <DealFormSheet
        open={dealSheetOpen}
        onOpenChange={setDealSheetOpen}
        deal={null}
        contacts={contactsPage?.data ?? []}
        defaultContactId={selectedContactId || undefined}
      />

      <EmailComposeSheet
        open={emailSheetOpen}
        onOpenChange={setEmailSheetOpen}
        defaultContactId={selectedContactId || undefined}
        defaultSubject={prefillSubject || undefined}
        defaultBody={prefillBody || undefined}
      />
    </div>
  );
}
