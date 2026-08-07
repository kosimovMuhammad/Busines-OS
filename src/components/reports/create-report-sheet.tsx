"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCreateReportMutation } from "@/lib/api/reports.api";
import type { ReportEntityType } from "@/types/api";

const ENTITY_TYPES: ReportEntityType[] = ["Deals", "Contacts", "Tasks"];

// Backend validates groupBy/metrics/filter fields against this exact
// per-entity whitelist (discovered live via its 422 error messages, since
// this isn't documented in the OpenAPI schema).
const GROUP_BY_OPTIONS: Record<ReportEntityType, string[]> = {
  Deals: ["day", "week", "month", "Stage", "OwnerId"],
  Contacts: ["day", "week", "month", "OwnerId"],
  Tasks: ["day", "week", "month", "Status", "Priority", "AssignedTo"],
};

const FILTER_FIELD_OPTIONS: Record<ReportEntityType, string[]> = {
  Deals: ["Stage", "OwnerId"],
  Contacts: ["OwnerId"],
  Tasks: ["Status", "Priority", "AssignedTo"],
};

const METRICS_OPTIONS: Record<ReportEntityType, string[]> = {
  Deals: ["count", "sum:value", "avg:value"],
  Contacts: ["count"],
  Tasks: ["count"],
};

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function CreateReportSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.reports.custom");
  const tField = useTranslations("pages.reports.custom.fields");
  const [createReport, { isLoading }] = useCreateReportMutation();

  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<ReportEntityType>("Deals");
  const [groupBy, setGroupBy] = useState("Stage");
  const [metrics, setMetrics] = useState<string[]>(["count"]);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName("");
      setEntityType("Deals");
      setGroupBy("Stage");
      setMetrics(["count"]);
      setFilterField("");
      setFilterValue("");
    }
  }

  const changeEntity = (value: ReportEntityType) => {
    setEntityType(value);
    setGroupBy(GROUP_BY_OPTIONS[value][0]);
    setMetrics(["count"]);
    setFilterField("");
    setFilterValue("");
  };

  const toggleMetric = (metric: string, checked: boolean) => {
    setMetrics((prev) => (checked ? [...prev, metric] : prev.filter((m) => m !== metric)));
  };

  const canSubmit = name.trim().length >= 2 && metrics.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createReport({
        name: name.trim(),
        entityType,
        groupBy,
        metrics,
        filters:
          filterField && filterValue.trim()
            ? [{ field: filterField, operator: "eq", value: filterValue.trim() }]
            : [],
      }).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <label htmlFor="report-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="report-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="report-entity" className="text-xs font-medium text-text-tertiary uppercase">
              {t("entityType")}
            </label>
            <Select value={entityType} onValueChange={(value) => changeEntity(value as ReportEntityType)}>
              <SelectTrigger id="report-entity" className="w-full">
                <SelectValue>{(value: string) => tField(`entity.${value}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {tField(`entity.${e}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="report-groupby" className="text-xs font-medium text-text-tertiary uppercase">
              {t("groupBy")}
            </label>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value ?? groupBy)}>
              <SelectTrigger id="report-groupby" className="w-full">
                <SelectValue>{(value: string) => tField(`groupBy.${value}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS[entityType].map((g) => (
                  <SelectItem key={g} value={g}>
                    {tField(`groupBy.${g}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("metrics")}</p>
            <div className="space-y-1.5">
              {METRICS_OPTIONS[entityType].map((metric) => (
                <label key={metric} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Checkbox
                    checked={metrics.includes(metric)}
                    onCheckedChange={(checked) => toggleMetric(metric, checked === true)}
                  />
                  {tField(`metric.${metric}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("filterOptional")}</p>
            <div className="flex gap-2">
              <Select
                value={filterField || NONE}
                onValueChange={(value) => setFilterField(value === NONE ? "" : (value ?? ""))}
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue>
                    {(value: string) => (value === NONE || !value ? t("noFilter") : tField(`groupBy.${value}`))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("noFilter")}</SelectItem>
                  {FILTER_FIELD_OPTIONS[entityType].map((f) => (
                    <SelectItem key={f} value={f}>
                      {tField(`groupBy.${f}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                className={inputClass}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder={t("filterValuePlaceholder")}
                disabled={!filterField}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
