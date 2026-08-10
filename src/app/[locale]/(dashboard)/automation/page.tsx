import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AutomationContent } from "@/components/automation/automation-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function AutomationPage() {
  const t = await getTranslations("pages.automation");

  return (
    <RouteGuard roles={getAllowedRoles("automation")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AutomationContent />
    </RouteGuard>
  );
}
