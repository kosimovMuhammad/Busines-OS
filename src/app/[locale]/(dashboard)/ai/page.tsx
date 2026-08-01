import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AiContent } from "@/components/ai/ai-content";

export default async function AiPage() {
  const t = await getTranslations("pages.ai");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AiContent />
    </>
  );
}
