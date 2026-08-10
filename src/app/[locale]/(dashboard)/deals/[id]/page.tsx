import { Gem } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

export default function DealDetailPage() {
  return (
    <RouteGuard roles={getAllowedRoles("deals")}>
      <PlaceholderPage namespace="pages.deals" icon={Gem} />
    </RouteGuard>
  );
}
