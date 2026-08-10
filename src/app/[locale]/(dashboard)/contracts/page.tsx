import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ContractsContent } from "@/components/contracts/contracts-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function ContractsPage() {
  const t = await getTranslations("pages.contracts");

  return (
    <RouteGuard roles={getAllowedRoles("contracts")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ContractsContent />
    </RouteGuard>
  );
}
