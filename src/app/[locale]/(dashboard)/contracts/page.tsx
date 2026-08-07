import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ContractsContent } from "@/components/contracts/contracts-content";

export default async function ContractsPage() {
  const t = await getTranslations("pages.contracts");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ContractsContent />
    </>
  );
}
