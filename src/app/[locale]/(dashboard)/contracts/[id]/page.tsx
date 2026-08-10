import { ContractDetailContent } from "@/components/contracts/contract-detail-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard roles={getAllowedRoles("contracts")}>
      <ContractDetailContent id={id} />
    </RouteGuard>
  );
}
