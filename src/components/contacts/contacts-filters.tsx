"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useGetUsersQuery } from "@/lib/api/users.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ALL = "__all__";

export function ContactsFilters({
  search,
  onSearchChange,
  tag,
  onTagChange,
  ownerId,
  onOwnerIdChange,
  onCreate,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  ownerId: string;
  onOwnerIdChange: (value: string) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.contacts");
  const { data: users } = useGetUsersQuery();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-9 w-full rounded-lg border border-border-subtle bg-surface py-1 pr-3 pl-9 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />
      </div>

      <input
        value={tag}
        onChange={(e) => onTagChange(e.target.value)}
        placeholder={t("tagPlaceholder")}
        className="h-9 w-36 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
      />

      <Select
        value={ownerId || ALL}
        onValueChange={(value) => onOwnerIdChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL
                ? t("allOwners")
                : (users?.find((u) => u.id === value)?.name ?? t("allOwners"))
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allOwners")}</SelectItem>
          {users?.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={onCreate} className="ml-auto">
        {t("createContact")}
      </Button>
    </div>
  );
}
