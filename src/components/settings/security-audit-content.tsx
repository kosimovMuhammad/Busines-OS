"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/components/shared/require-role";
import { SessionsTab } from "./sessions-tab";
import { ApiKeysTab } from "./api-keys-tab";
import { AuditLogTab } from "./audit-log-tab";
import { LoginHistoryTab } from "./login-history-tab";
import { PermissionHistoryTab } from "./permission-history-tab";

function SecurityAuditInner() {
  const t = useTranslations("pages.settingsSecurity.tabs");

  return (
    <Tabs defaultValue="sessions">
      <TabsList>
        <TabsTrigger value="sessions">{t("sessions")}</TabsTrigger>
        <TabsTrigger value="apiKeys">{t("apiKeys")}</TabsTrigger>
        <TabsTrigger value="auditLog">{t("auditLog")}</TabsTrigger>
        <TabsTrigger value="loginHistory">{t("loginHistory")}</TabsTrigger>
        <TabsTrigger value="permissionHistory">{t("permissionHistory")}</TabsTrigger>
      </TabsList>

      <TabsContent value="sessions" className="mt-4">
        <SessionsTab />
      </TabsContent>
      <TabsContent value="apiKeys" className="mt-4">
        <ApiKeysTab />
      </TabsContent>
      <TabsContent value="auditLog" className="mt-4">
        <AuditLogTab />
      </TabsContent>
      <TabsContent value="loginHistory" className="mt-4">
        <LoginHistoryTab />
      </TabsContent>
      <TabsContent value="permissionHistory" className="mt-4">
        <PermissionHistoryTab />
      </TabsContent>
    </Tabs>
  );
}

export function SecurityAuditContent() {
  return (
    <RequireRole roles={["Owner", "Admin"]}>
      <SecurityAuditInner />
    </RequireRole>
  );
}
