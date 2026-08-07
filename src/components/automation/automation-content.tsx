"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/components/shared/require-role";
import { WorkflowsTab } from "./workflows-tab";
import { WebhooksTab } from "./webhooks-tab";
import { WebhookLogsTab } from "./webhook-logs-tab";

function AutomationInner() {
  const t = useTranslations("pages.automation.tabs");

  return (
    <Tabs defaultValue="workflows">
      <TabsList>
        <TabsTrigger value="workflows">{t("workflows")}</TabsTrigger>
        <TabsTrigger value="webhooks">{t("webhooks")}</TabsTrigger>
        <TabsTrigger value="logs">{t("logs")}</TabsTrigger>
      </TabsList>

      <TabsContent value="workflows" className="mt-4">
        <WorkflowsTab />
      </TabsContent>
      <TabsContent value="webhooks" className="mt-4">
        <WebhooksTab />
      </TabsContent>
      <TabsContent value="logs" className="mt-4">
        <WebhookLogsTab />
      </TabsContent>
    </Tabs>
  );
}

export function AutomationContent() {
  return (
    <RequireRole roles={["Owner", "Admin"]}>
      <AutomationInner />
    </RequireRole>
  );
}
