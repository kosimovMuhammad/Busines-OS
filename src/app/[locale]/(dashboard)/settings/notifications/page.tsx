import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationPreferencesContent } from "@/components/settings/notification-preferences-content";

export default async function SettingsNotificationsPage() {
  const t = await getTranslations("pages.settingsNotifications");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <NotificationPreferencesContent />
    </>
  );
}
