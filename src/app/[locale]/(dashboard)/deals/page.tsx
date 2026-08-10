import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DealsBoard } from "@/components/deals/deals-board";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function DealsPage() {
  const t = await getTranslations("pages.deals");

  return (
    <RouteGuard roles={getAllowedRoles("deals")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DealsBoard />
    </RouteGuard>
  );
}
