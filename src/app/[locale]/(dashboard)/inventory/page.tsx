import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { InventoryContent } from "@/components/inventory/inventory-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function InventoryPage() {
  const t = await getTranslations("pages.inventory");

  return (
    <RouteGuard roles={getAllowedRoles("inventory")}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <InventoryContent />
    </RouteGuard>
  );
}
