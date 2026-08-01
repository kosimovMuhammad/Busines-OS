import { ContactDetailContent } from "@/components/contacts/contact-detail-content";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactDetailContent id={id} />;
}
