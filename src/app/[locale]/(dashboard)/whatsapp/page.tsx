import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { WhatsappContent } from "@/components/whatsapp/whatsapp-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function WhatsAppPage() {
  const t = await getTranslations("pages.whatsapp");

  return (
    <RouteGuard roles={getAllowedRoles("whatsapp")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <WhatsappContent />
    </RouteGuard>
  );
}
