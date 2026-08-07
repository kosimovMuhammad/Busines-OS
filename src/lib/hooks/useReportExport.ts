import { useAppSelector } from "@/store/hooks";

export type ReportExportType =
  | "sales"
  | "revenue"
  | "tasks"
  | "customers"
  | "employee-performance";

export function useReportExport() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  return async (type: ReportExportType, range: { from?: string; to?: string }) => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/export?${params}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
}
