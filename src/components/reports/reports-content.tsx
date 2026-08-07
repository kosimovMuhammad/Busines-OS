"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/components/shared/require-role";
import { SalesReportTab } from "./sales-report-tab";
import { RevenueReportTab } from "./revenue-report-tab";
import { TasksReportTab } from "./tasks-report-tab";
import { CustomersReportTab } from "./customers-report-tab";
import { EmployeePerformanceTab } from "./employee-performance-tab";
import { CustomReportsTab } from "./custom-reports-tab";

function ReportsInner() {
  const t = useTranslations("pages.reports.tabs");

  return (
    <Tabs defaultValue="sales">
      <TabsList>
        <TabsTrigger value="sales">{t("sales")}</TabsTrigger>
        <TabsTrigger value="revenue">{t("revenue")}</TabsTrigger>
        <TabsTrigger value="tasks">{t("tasks")}</TabsTrigger>
        <TabsTrigger value="customers">{t("customers")}</TabsTrigger>
        <TabsTrigger value="employeePerformance">{t("employeePerformance")}</TabsTrigger>
        <TabsTrigger value="custom">{t("custom")}</TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="mt-4">
        <SalesReportTab />
      </TabsContent>
      <TabsContent value="revenue" className="mt-4">
        <RevenueReportTab />
      </TabsContent>
      <TabsContent value="tasks" className="mt-4">
        <TasksReportTab />
      </TabsContent>
      <TabsContent value="customers" className="mt-4">
        <CustomersReportTab />
      </TabsContent>
      <TabsContent value="employeePerformance" className="mt-4">
        <EmployeePerformanceTab />
      </TabsContent>
      <TabsContent value="custom" className="mt-4">
        <CustomReportsTab />
      </TabsContent>
    </Tabs>
  );
}

export function ReportsContent() {
  return (
    <RequireRole roles={["Owner", "Admin", "Manager", "Sales"]}>
      <ReportsInner />
    </RequireRole>
  );
}
