"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/components/shared/require-role";
import { useRole } from "@/lib/hooks/useRole";
import { DepartmentsTab } from "./departments-tab";
import { TeamsTab } from "./teams-tab";
import { BranchesTab } from "./branches-tab";
import { OrgChartTab } from "./org-chart-tab";

function OrganizationInner() {
  const t = useTranslations("pages.settingsOrganization.tabs");
  const { hasRole } = useRole();
  const canManage = hasRole(["Owner", "Admin"]);

  return (
    <Tabs defaultValue="departments">
      <TabsList>
        <TabsTrigger value="departments">{t("departments")}</TabsTrigger>
        <TabsTrigger value="teams">{t("teams")}</TabsTrigger>
        <TabsTrigger value="branches">{t("branches")}</TabsTrigger>
        <TabsTrigger value="orgChart">{t("orgChart")}</TabsTrigger>
      </TabsList>

      <TabsContent value="departments" className="mt-4">
        <DepartmentsTab canManage={canManage} />
      </TabsContent>
      <TabsContent value="teams" className="mt-4">
        <TeamsTab canManage={canManage} />
      </TabsContent>
      <TabsContent value="branches" className="mt-4">
        <BranchesTab canManage={canManage} />
      </TabsContent>
      <TabsContent value="orgChart" className="mt-4">
        <OrgChartTab />
      </TabsContent>
    </Tabs>
  );
}

export function OrganizationContent() {
  return (
    <RequireRole roles={["Owner", "Admin", "Manager"]}>
      <OrganizationInner />
    </RequireRole>
  );
}
