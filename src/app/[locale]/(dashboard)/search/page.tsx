import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SearchContent } from "@/components/search/search-content";

export default async function SearchPage() {
  const t = await getTranslations("pages.search");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SearchContent />
    </>
  );
}
