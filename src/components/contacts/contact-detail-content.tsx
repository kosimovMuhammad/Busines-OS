"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Pencil, Trash2, User as UserIcon } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useGetContactQuery } from "@/lib/api/contacts.api";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactFormSheet } from "./contact-form-sheet";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { ContactTimeline } from "./contact-timeline";
import type { Contact } from "@/types/api";

export function ContactDetailContent({ id }: { id: string }) {
  const t = useTranslations("pages.contacts");
  const router = useRouter();
  const { data: contact, isLoading } = useGetContactQuery(id);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  if (isLoading || !contact) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const subtitle = [contact.position, contact.companyName].filter(Boolean).join(" · ");

  return (
    <div className="space-y-4">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <UserIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{fullName}</h1>
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            <p className="mt-1 text-xs text-text-tertiary">
              {contact.email ?? contact.phone ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label={t("edit")}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingContact(contact)}
            className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label={t("delete")}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <ContactTimeline contactId={contact.id} />

      <ContactFormSheet open={sheetOpen} onOpenChange={setSheetOpen} contact={contact} />

      <DeleteContactDialog
        contact={deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
        onDeleted={() => router.push("/contacts")}
      />
    </div>
  );
}
