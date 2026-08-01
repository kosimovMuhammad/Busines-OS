import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DealsBoard } from "@/components/deals/deals-board";

export default async function DealsPage() {
  const t = await getTranslations("pages.deals");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DealsBoard />
    </>
  );
}
