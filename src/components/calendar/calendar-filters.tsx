"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";

const ALL = "__all__";

export function CalendarFilters({
  contactId,
  onContactIdChange,
  organizerId,
  onOrganizerIdChange,
  onCreate,
}: {
  contactId: string;
  onContactIdChange: (value: string) => void;
  organizerId: string;
  onOrganizerIdChange: (value: string) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.calendar");
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: users } = useGetUsersQuery();

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
        value={organizerId || ALL}
        onValueChange={(value) => onOrganizerIdChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-48">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL
                ? t("allOrganizers")
                : (users?.find((u) => u.id === value)?.name ?? t("allOrganizers"))
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allOrganizers")}</SelectItem>
          {users?.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
        <Button type="button" onClick={onCreate} className="ml-auto">
          {t("createMeeting")}
        </Button>
      </PermissionGuard>
    </div>
  );
}
