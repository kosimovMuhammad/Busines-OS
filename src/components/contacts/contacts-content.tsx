"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { Pagination } from "@/components/shared/pagination";
import { ContactsFilters } from "./contacts-filters";
import { ContactsTable } from "./contacts-table";
import { ContactFormSheet } from "./contact-form-sheet";
import { DeleteContactDialog } from "./delete-contact-dialog";
import type { Contact } from "@/types/api";

function useUrlParam(name: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(name) ?? "";

  const setValue = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(name, next);
    else params.delete(name);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return [value, setValue] as const;
}

export function ContactsContent() {
  const { page, limit, setPage } = usePaginatedQuery();
  const [search, setSearch] = useUrlParam("search");
  const [tag, setTag] = useUrlParam("tag");
  const [ownerId, setOwnerId] = useUrlParam("ownerId");

  const [searchInput, setSearchInput] = useState(search);
  const [tagInput, setTagInput] = useState(tag);
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedTag = useDebounce(tagInput, 300);

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (debouncedTag !== tag) setTag(debouncedTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTag]);

  const { data, isLoading, isFetching } = useGetContactsQuery({
    search: search || undefined,
    tag: tag || undefined,
    ownerId: ownerId || undefined,
    page,
    limit,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <ContactsFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        tag={tagInput}
        onTagChange={setTagInput}
        ownerId={ownerId}
        onOwnerIdChange={setOwnerId}
        onCreate={() => {
          setEditingContact(null);
          setSheetOpen(true);
        }}
      />

      <ContactsTable
        contacts={data?.data ?? []}
        isLoading={isLoading || isFetching}
        onEdit={(contact) => {
          setEditingContact(contact);
          setSheetOpen(true);
        }}
        onDelete={setDeletingContact}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ContactFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        contact={editingContact}
      />

      <DeleteContactDialog
        contact={deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
      />
    </div>
  );
}
