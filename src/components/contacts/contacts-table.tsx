"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2, User as UserIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { Contact } from "@/types/api";

export function ContactsTable({
  contacts,
  isLoading,
  onEdit,
  onDelete,
}: {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}) {
  const t = useTranslations("pages.contacts");

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return <EmptyState icon={UserIcon} title={t("empty")} />;
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead>{t("columnContact")}</TableHead>
            <TableHead>{t("columnCompany")}</TableHead>
            <TableHead>{t("columnDetails")}</TableHead>
            <TableHead className="w-20 text-right">{t("columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const fullName = [contact.firstName, contact.lastName]
              .filter(Boolean)
              .join(" ");
            return (
              <TableRow key={contact.id} className="border-border-subtle">
                <TableCell>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                      <UserIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {fullName}
                      </p>
                      {contact.position && (
                        <p className="truncate text-xs text-text-tertiary">
                          {contact.position}
                        </p>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {contact.companyName ?? "—"}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {contact.email ?? contact.phone ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(contact)}
                      className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                      aria-label={t("edit")}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(contact)}
                      className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
