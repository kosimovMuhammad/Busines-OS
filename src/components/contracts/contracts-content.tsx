"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/shared/pagination";
import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { useGetContractsQuery } from "@/lib/api/contracts.api";
import { ContractsFilters } from "./contracts-filters";
import { ContractsTable } from "./contracts-table";
import { ContractFormSheet } from "./contract-form-sheet";
import { TemplatesTab } from "./templates-tab";
import type { ContractStatus } from "@/types/enums";

function ContractsListTab() {
  const { page, limit, setPage } = usePaginatedQuery();
  const [status, setStatus] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetContractsQuery({
    status: (status as ContractStatus) || undefined,
    page,
    limit,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <ContractsFilters status={status} onStatusChange={setStatus} onCreate={() => setSheetOpen(true)} />

      <ContractsTable contracts={data?.data ?? []} isLoading={isLoading || isFetching} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ContractFormSheet open={sheetOpen} onOpenChange={setSheetOpen} contract={null} />
    </div>
  );
}

export function ContractsContent() {
  const t = useTranslations("pages.contracts.tabs");

  return (
    <Tabs defaultValue="contracts">
      <TabsList>
        <TabsTrigger value="contracts">{t("contracts")}</TabsTrigger>
        <TabsTrigger value="templates">{t("templates")}</TabsTrigger>
      </TabsList>

      <TabsContent value="contracts" className="mt-4">
        <ContractsListTab />
      </TabsContent>
      <TabsContent value="templates" className="mt-4">
        <TemplatesTab />
      </TabsContent>
    </Tabs>
  );
}
