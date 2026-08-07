import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsContent } from "@/components/reports/reports-content";

export default async function ReportsPage() {
  const t = await getTranslations("pages.reports");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReportsContent />
    </>
  );
}
