import { InvoiceDetailContent } from "@/components/invoices/invoice-detail-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard roles={getAllowedRoles("invoicing")}>
      <InvoiceDetailContent id={id} />
    </RouteGuard>
  );
}
