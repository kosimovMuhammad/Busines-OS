import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AiUsagePanel } from "@/components/settings/ai-usage-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsAiUsagePage() {
  const t = await getTranslations("pages.settingsAiUsage");

  return (
    <RouteGuard roles={getAllowedRoles("settingsAiUsage")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AiUsagePanel />
    </RouteGuard>
  );
}
