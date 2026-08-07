import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { InventoryContent } from "@/components/inventory/inventory-content";

export default async function InventoryPage() {
  const t = await getTranslations("pages.inventory");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <InventoryContent />
    </>
  );
}
