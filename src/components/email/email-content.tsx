"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetCommunicationsQuery } from "@/lib/api/communications.api";
import { CommunicationsFeed } from "@/components/communications/communications-feed";
import { EmailConnectionCards } from "./email-connection-cards";
import { EmailComposeSheet } from "./email-compose-sheet";
import type { Contact } from "@/types/api";

const ALL = "__all__";

export function EmailContent() {
  const t = useTranslations("pages.email");
  const searchParams = useSearchParams();
  const prefillContactId = searchParams.get("contactId") ?? "";
  const prefillSubject = searchParams.get("subject") ?? "";
  const prefillBody = searchParams.get("body") ?? "";
  const hasPrefill = !!(prefillSubject || prefillBody);

  const [contactId, setContactId] = useState(prefillContactId);
  const [composeOpen, setComposeOpen] = useState(hasPrefill);

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: communications, isLoading } = useGetCommunicationsQuery(
    contactId ? { contactId, channel: "EMAIL" } : { channel: "EMAIL" }
  );

  const contactsById = useMemo(() => {
    const map = new Map<string, Contact>();
    contactsPage?.data.forEach((c) => map.set(c.id, c));
    return map;
  }, [contactsPage]);

  return (
    <>
    <Tabs defaultValue="messages">
      <TabsList>
        <TabsTrigger value="messages">{t("tabs.messages")}</TabsTrigger>
        <TabsTrigger value="connections">{t("tabs.connections")}</TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={contactId || ALL}
            onValueChange={(value) => setContactId(value === ALL || !value ? "" : value)}
          >
            <SelectTrigger className="h-9 w-64">
              <SelectValue>
                {(value: string) =>
                  !value || value === ALL
                    ? t("allContacts")
                    : (() => {
                        const c = contactsPage?.data.find((x) => x.id === value);
                        return c
                          ? [c.firstName, c.lastName].filter(Boolean).join(" ")
                          : t("allContacts");
                      })()
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allContacts")}</SelectItem>
              {contactsPage?.data.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" onClick={() => setComposeOpen(true)} className="ml-auto">
            <Mail className="size-3.5" />
            {t("compose")}
          </Button>
        </div>

        <CommunicationsFeed
          communications={communications ?? []}
          isLoading={isLoading}
          contactsById={contactsById}
        />
      </TabsContent>

      <TabsContent value="connections" className="mt-4">
        <EmailConnectionCards />
      </TabsContent>
    </Tabs>

    <EmailComposeSheet
      open={composeOpen}
      onOpenChange={setComposeOpen}
      defaultContactId={prefillContactId || contactId || undefined}
      defaultSubject={prefillSubject || undefined}
      defaultBody={prefillBody || undefined}
    />
    </>
  );
}
