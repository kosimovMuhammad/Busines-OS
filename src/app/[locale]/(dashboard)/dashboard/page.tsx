import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const t = await getTranslations("pages.dashboard");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DashboardContent />
    </>
  );
}
