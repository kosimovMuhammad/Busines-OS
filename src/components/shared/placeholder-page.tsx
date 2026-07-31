import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export async function PlaceholderPage({
  namespace,
  icon,
}: {
  namespace: string;
  icon: LucideIcon;
}) {
  const t = await getTranslations(namespace);
  const common = await getTranslations("common");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <EmptyState icon={icon} title={common("comingSoon")} />
    </>
  );
}
