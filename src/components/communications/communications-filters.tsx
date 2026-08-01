"use client";

import { useTranslations } from "next-intl";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CommChannel } from "@/types/enums";

const ALL = "__all__";
const CHANNELS: CommChannel[] = ["WHATSAPP", "EMAIL", "MANUAL_NOTE", "PHONE_CALL"];

export function CommunicationsFilters({
  contactId,
  onContactIdChange,
  channel,
  onChannelChange,
  onAddNote,
}: {
  contactId: string;
  onContactIdChange: (value: string) => void;
  channel: string;
  onChannelChange: (value: string) => void;
  onAddNote: () => void;
}) {
  const t = useTranslations("pages.communications");
  const tChannel = useTranslations("enums.commChannel");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={contactId || ALL}
        onValueChange={(value) => onContactIdChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-48">
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

      <Select
        value={channel || ALL}
        onValueChange={(value) => onChannelChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL ? t("allChannels") : tChannel(value as CommChannel)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allChannels")}</SelectItem>
          {CHANNELS.map((c) => (
            <SelectItem key={c} value={c}>
              {tChannel(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={onAddNote} className="ml-auto">
        {t("addNote")}
      </Button>
    </div>
  );
}
