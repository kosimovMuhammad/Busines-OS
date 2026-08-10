import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { PlatformWhatsAppContent } from "@/components/settings/platform-whatsapp-content";
import { RouteGuard } from "@/components/guards/route-guard";

export default async function SettingsPlatformPage() {
  const t = await getTranslations("pages.settingsPlatform");

  return (
    <RouteGuard platformAdminOnly>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PlatformWhatsAppContent />
    </RouteGuard>
  );
}
