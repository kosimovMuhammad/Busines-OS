import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { CommunicationsContent } from "@/components/communications/communications-content";

export default async function CommunicationsPage() {
  const t = await getTranslations("pages.communications");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <CommunicationsContent />
    </>
  );
}
