import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmailContent } from "@/components/email/email-content";

export default async function EmailPage() {
  const t = await getTranslations("pages.email");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <EmailContent />
    </>
  );
}
