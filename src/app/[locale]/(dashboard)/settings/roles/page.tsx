import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { RolesPermissionsContent } from "@/components/settings/roles-permissions-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsRolesPage() {
  const t = await getTranslations("pages.settingsRoles");

  return (
    <RouteGuard roles={getAllowedRoles("settingsRoles")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <RolesPermissionsContent />
    </RouteGuard>
  );
}
