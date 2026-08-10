import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SecurityAuditContent } from "@/components/settings/security-audit-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsSecurityPage() {
  const t = await getTranslations("pages.settingsSecurity");

  return (
    <RouteGuard roles={getAllowedRoles("settingsSecurity")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SecurityAuditContent />
    </RouteGuard>
  );
}
