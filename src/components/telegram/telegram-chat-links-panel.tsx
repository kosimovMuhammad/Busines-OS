"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Loader2, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import {
  useGetTelegramChatLinksQuery,
  useLinkTelegramChatToContactMutation,
} from "@/lib/api/telegram.api";
import { TelegramLinkMethodBadge } from "./telegram-link-method-badge";
import type { TelegramChatLink } from "@/types/api";

function ChatLinkRow({ chatLink }: { chatLink: TelegramChatLink }) {
  const t = useTranslations("pages.telegram.chatLinks");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const [linkContact, { isLoading }] = useLinkTelegramChatToContactMutation();
  const [linking, setLinking] = useState(false);
  const [contactId, setContactId] = useState("");

  const displayName = [chatLink.telegramFirstName, chatLink.telegramLastName]
    .filter(Boolean)
    .join(" ") || t("unknownName");

  const suggestedContact = useMemo(() => {
    if (!chatLink.phoneNumber) return undefined;
    return contactsPage?.data.find((c) => c.phone === chatLink.phoneNumber);
  }, [contactsPage, chatLink.phoneNumber]);

  const handleLink = async (value: string | null) => {
    if (!value) return;
    setContactId(value);
    try {
      await linkContact({ id: chatLink.id, contactId: value }).unwrap();
      setLinking(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <li className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-primary">{displayName}</p>
            <TelegramLinkMethodBadge linkMethod={chatLink.linkMethod} />
          </div>
          <div className="mt-0.5 space-x-2 text-xs text-text-tertiary">
            {chatLink.telegramUsername && <span>@{chatLink.telegramUsername}</span>}
            {chatLink.phoneNumber && <span>{chatLink.phoneNumber}</span>}
          </div>
          {chatLink.linkMethod === "Unlinked" && suggestedContact && (
            <p className="mt-1 text-xs text-text-tertiary">
              {t("suggestedMatch", {
                name: [suggestedContact.firstName, suggestedContact.lastName]
                  .filter(Boolean)
                  .join(" "),
              })}
            </p>
          )}
        </div>

        {chatLink.linkMethod === "Unlinked" && (
          <div className="shrink-0">
            {linking ? (
              <Select value={contactId} onValueChange={handleLink}>
                <SelectTrigger className="h-9 w-56">
                  <SelectValue placeholder={t("selectContactPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {contactsPage?.data.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => setLinking(true)}>
                {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}
                {t("linkButton")}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function TelegramChatLinksPanel() {
  const t = useTranslations("pages.telegram.chatLinks");
  const { data: unlinkedLinks, isLoading: isLoadingUnlinked } = useGetTelegramChatLinksQuery({
    onlyUnlinked: true,
  });
  const { data: allLinks, isLoading: isLoadingAll } = useGetTelegramChatLinksQuery();

  return (
    <Tabs defaultValue="unlinked">
      <TabsList>
        <TabsTrigger value="unlinked">{t("unlinkedTab")}</TabsTrigger>
        <TabsTrigger value="all">{t("allTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="unlinked" className="mt-4">
        {isLoadingUnlinked ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : unlinkedLinks && unlinkedLinks.length > 0 ? (
          <ul className="space-y-3">
            {unlinkedLinks.map((link) => (
              <ChatLinkRow key={link.id} chatLink={link} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={UserRound} title={t("empty")} />
        )}
      </TabsContent>

      <TabsContent value="all" className="mt-4">
        {isLoadingAll ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : allLinks && allLinks.length > 0 ? (
          <ul className="space-y-3">
            {allLinks.map((link) => (
              <ChatLinkRow key={link.id} chatLink={link} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={UserRound} title={t("empty")} />
        )}
      </TabsContent>
    </Tabs>
  );
}
