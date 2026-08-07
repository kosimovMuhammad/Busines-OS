import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AutomationContent } from "@/components/automation/automation-content";

export default async function AutomationPage() {
  const t = await getTranslations("pages.automation");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AutomationContent />
    </>
  );
}
