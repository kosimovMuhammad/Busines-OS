import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { InvoicesContent } from "@/components/invoices/invoices-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function InvoicesPage() {
  const t = await getTranslations("pages.invoices");

  return (
    <RouteGuard roles={getAllowedRoles("invoicing")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <InvoicesContent />
    </RouteGuard>
  );
}
