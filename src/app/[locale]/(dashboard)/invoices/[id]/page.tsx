import { InvoiceDetailContent } from "@/components/invoices/invoice-detail-content";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailContent id={id} />;
}
