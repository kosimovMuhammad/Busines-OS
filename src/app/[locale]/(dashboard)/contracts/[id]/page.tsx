import { ContractDetailContent } from "@/components/contracts/contract-detail-content";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContractDetailContent id={id} />;
}
