import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmailContent } from "@/components/email/email-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function EmailPage() {
  const t = await getTranslations("pages.email");

  return (
    <RouteGuard roles={getAllowedRoles("email")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <EmailContent />
    </RouteGuard>
  );
}
