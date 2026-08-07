"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const dateInputClass =
  "rounded-lg border border-border-subtle bg-background px-3 py-1.5 text-sm text-text-primary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function ReportToolbar({
  from,
  to,
  onFromChange,
  onToChange,
  onExport,
  children,
}: {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onExport: () => void;
  children?: ReactNode;
}) {
  const t = useTranslations("pages.reports");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className={dateInputClass}
        aria-label={t("from")}
      />
      <span className="text-sm text-text-tertiary">{t("to")}</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className={dateInputClass}
        aria-label={t("to")}
      />

      {children}

      <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onExport}>
        <Download className="size-3.5" />
        {t("export")}
      </Button>
    </div>
  );
}
