import { CommunicationsContent } from "@/components/communications/communications-content";
import { RouteGuard } from "@/components/guards/route-guard";
import { getAllowedRoles } from "@/lib/permissions/constants";

// Communications is a full-bleed, app-like view rather than a normal padded
// page - CommunicationsContent handles its own back button and cancels the
// dashboard layout's padding itself, so this stays a thin RouteGuard shell.
export default async function CommunicationsPage() {
  return (
    <RouteGuard roles={getAllowedRoles("communications")}>
      <CommunicationsContent />
    </RouteGuard>
  );
}
