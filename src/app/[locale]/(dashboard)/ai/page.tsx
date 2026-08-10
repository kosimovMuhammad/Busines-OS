import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AiContent } from "@/components/ai/ai-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function AiPage() {
  const t = await getTranslations("pages.ai");

  return (
    <RouteGuard roles={getAllowedRoles("aiAssistant")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AiContent />
    </RouteGuard>
  );
}
