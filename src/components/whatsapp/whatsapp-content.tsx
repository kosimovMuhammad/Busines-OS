"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageCircle } from "lucide-react";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetCommunicationsQuery } from "@/lib/api/communications.api";
import { CommunicationsFeed } from "@/components/communications/communications-feed";
import { WhatsappComposer } from "./whatsapp-composer";
import { WhatsappAccountsPanel } from "./whatsapp-accounts-panel";
import type { Contact } from "@/types/api";

const NO_CONTACT = "__no_contact__";

export function WhatsappContent() {
  const t = useTranslations("pages.whatsapp");
  const [contactId, setContactId] = useState("");

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: communications, isLoading } = useGetCommunicationsQuery(
    contactId ? { contactId, channel: "WHATSAPP" } : { channel: "WHATSAPP" }
  );

  const contactsById = useMemo(() => {
    const map = new Map<string, Contact>();
    contactsPage?.data.forEach((c) => map.set(c.id, c));
    return map;
  }, [contactsPage]);

  return (
    <Tabs defaultValue="messages">
      <TabsList>
        <TabsTrigger value="messages">{t("tabs.messages")}</TabsTrigger>
        <TabsTrigger value="accounts">{t("tabs.accounts")}</TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-4 space-y-4">
        <Select
          value={contactId || NO_CONTACT}
          onValueChange={(value) => setContactId(value === NO_CONTACT || !value ? "" : value)}
        >
          <SelectTrigger className="h-9 w-64">
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

        {contactId ? (
          <>
            <CommunicationsFeed
              communications={communications ?? []}
              isLoading={isLoading}
              contactsById={contactsById}
            />
            <WhatsappComposer contactId={contactId} />
          </>
        ) : (
          <EmptyState icon={MessageCircle} title={t("selectContactHint")} />
        )}
      </TabsContent>

      <TabsContent value="accounts" className="mt-4">
        <WhatsappAccountsPanel />
      </TabsContent>
    </Tabs>
  );
}
