import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { PlanContent } from "@/components/settings/plan-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsPlanPage() {
  const t = await getTranslations("pages.settingsPlan");

  return (
    <RouteGuard roles={getAllowedRoles("settingsPlan")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PlanContent />
    </RouteGuard>
  );
}
