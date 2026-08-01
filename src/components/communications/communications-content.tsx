"use client";

import { useMemo, useState } from "react";
import { useGetCommunicationsQuery } from "@/lib/api/communications.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { CommunicationsFilters } from "./communications-filters";
import { CommunicationsFeed } from "./communications-feed";
import { AddNoteSheet } from "./add-note-sheet";
import type { Contact } from "@/types/api";
import type { CommChannel } from "@/types/enums";

export function CommunicationsContent() {
  const [contactId, setContactId] = useState("");
  const [channel, setChannel] = useState("");
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);

  const { data: communications, isLoading } = useGetCommunicationsQuery({
    contactId: contactId || undefined,
    channel: (channel as CommChannel) || undefined,
  });
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });

  const contactsById = useMemo(() => {
    const map = new Map<string, Contact>();
    contactsPage?.data.forEach((c) => map.set(c.id, c));
    return map;
  }, [contactsPage]);

  return (
    <div className="space-y-4">
      <CommunicationsFilters
        contactId={contactId}
        onContactIdChange={setContactId}
        channel={channel}
        onChannelChange={setChannel}
        onAddNote={() => setNoteSheetOpen(true)}
      />

      <CommunicationsFeed
        communications={communications ?? []}
        isLoading={isLoading}
        contactsById={contactsById}
      />

      <AddNoteSheet
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
        defaultContactId={contactId || undefined}
      />
    </div>
  );
}
