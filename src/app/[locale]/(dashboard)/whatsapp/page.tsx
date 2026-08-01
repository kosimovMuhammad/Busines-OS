import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { WhatsappContent } from "@/components/whatsapp/whatsapp-content";

export default async function WhatsAppPage() {
  const t = await getTranslations("pages.whatsapp");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <WhatsappContent />
    </>
  );
}
