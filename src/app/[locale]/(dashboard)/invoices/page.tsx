import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { InvoicesContent } from "@/components/invoices/invoices-content";

export default async function InvoicesPage() {
  const t = await getTranslations("pages.invoices");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <InvoicesContent />
    </>
  );
}
