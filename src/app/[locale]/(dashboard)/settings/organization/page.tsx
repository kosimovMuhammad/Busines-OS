import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { OrganizationContent } from "@/components/settings/organization-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function SettingsOrganizationPage() {
  const t = await getTranslations("pages.settingsOrganization");

  return (
    <RouteGuard roles={getAllowedRoles("settingsOrganization")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <OrganizationContent />
    </RouteGuard>
  );
}
