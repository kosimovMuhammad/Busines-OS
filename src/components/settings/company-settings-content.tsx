"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/lib/hooks/useRole";
import { useGetCompanyQuery, useUpdateCompanyMutation } from "@/lib/api/company.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none disabled:opacity-60";

export function CompanySettingsContent() {
  const t = useTranslations("pages.settings");
  const { hasRole } = useRole();
  const canEdit = hasRole(["OWNER", "ADMIN"]);

  const { data: company, isLoading } = useGetCompanyQuery();
  const [updateCompany, { isLoading: isSaving }] = useUpdateCompanyMutation();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezone, setTimezone] = useState("");

  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (company && company.id !== loadedId) {
    setLoadedId(company.id);
    setName(company.name);
    setIndustry(company.industry ?? "");
    setTimezone(company.timezone);
  }

  if (isLoading || !company) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateCompany({
        name,
        industry: industry || undefined,
        timezone: timezone || undefined,
      }).unwrap();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="space-y-1.5">
        <label htmlFor="settings-name" className="text-xs font-medium text-text-tertiary uppercase">
          {t("name")}
        </label>
        <input
          id="settings-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="settings-industry" className="text-xs font-medium text-text-tertiary uppercase">
          {t("industry")}
        </label>
        <input
          id="settings-industry"
          className={inputClass}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={!canEdit}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="settings-timezone" className="text-xs font-medium text-text-tertiary uppercase">
          {t("timezone")}
        </label>
        <input
          id="settings-timezone"
          className={inputClass}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          disabled={!canEdit}
          placeholder="Asia/Dushanbe"
        />
      </div>

      {canEdit && (
        <Button type="button" onClick={handleSave} disabled={isSaving || !name.trim()}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {t("save")}
        </Button>
      )}
    </div>
  );
}
