import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { CommunicationsContent } from "@/components/communications/communications-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function CommunicationsPage() {
  const t = await getTranslations("pages.communications");

  return (
    <RouteGuard roles={getAllowedRoles("communications")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <CommunicationsContent />
    </RouteGuard>
  );
}
