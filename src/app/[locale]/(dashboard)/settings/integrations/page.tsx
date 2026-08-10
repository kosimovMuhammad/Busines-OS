import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { IntegrationsContent } from "@/components/settings/integrations-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsIntegrationsPage() {
  const t = await getTranslations("pages.settingsIntegrations");

  return (
    <RouteGuard roles={getAllowedRoles("settingsIntegrations")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <IntegrationsContent />
    </RouteGuard>
  );
}
