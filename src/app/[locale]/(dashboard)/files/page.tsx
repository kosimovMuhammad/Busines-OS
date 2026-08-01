import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { FilesContent } from "@/components/files/files-content";

export default async function FilesPage() {
  const t = await getTranslations("pages.files");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <FilesContent />
    </>
  );
}
