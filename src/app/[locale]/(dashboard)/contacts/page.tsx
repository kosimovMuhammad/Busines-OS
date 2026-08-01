import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ContactsContent } from "@/components/contacts/contacts-content";

export default async function ContactsPage() {
  const t = await getTranslations("pages.contacts");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ContactsContent />
    </>
  );
}
