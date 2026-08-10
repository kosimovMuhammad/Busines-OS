import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsContent } from "@/components/reports/reports-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function ReportsPage() {
  const t = await getTranslations("pages.reports");

  return (
    <RouteGuard roles={getAllowedRoles("reports")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReportsContent />
    </RouteGuard>
  );
}
