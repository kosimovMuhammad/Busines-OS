"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetInvoicesQuery } from "@/lib/api/invoices.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { Pagination } from "@/components/shared/pagination";
import { InvoicesFilters } from "./invoices-filters";
import { InvoicesTable } from "./invoices-table";
import { InvoiceFormSheet } from "./invoice-form-sheet";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import type { Contact, Invoice } from "@/types/api";
import type { InvoiceStatus } from "@/types/enums";

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

export function InvoicesContent() {
  const { page, limit, setPage } = usePaginatedQuery();
  const [status, setStatus] = useUrlParam("status");

  const { data, isLoading, isFetching } = useGetInvoicesQuery({
    status: (status as InvoiceStatus) || undefined,
    page,
    limit,
  });
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });

  const contactsById = useMemo(() => {
    const map = new Map<string, Contact>();
    contactsPage?.data.forEach((c) => map.set(c.id, c));
    return map;
  }, [contactsPage]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <InvoicesFilters
        status={status}
        onStatusChange={setStatus}
        onCreate={() => setSheetOpen(true)}
      />

      <InvoicesTable
        invoices={data?.data ?? []}
        contactsById={contactsById}
        isLoading={isLoading || isFetching}
        onDelete={setDeletingInvoice}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <InvoiceFormSheet open={sheetOpen} onOpenChange={setSheetOpen} invoice={null} />

      <DeleteInvoiceDialog
        invoice={deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
      />
    </div>
  );
}
