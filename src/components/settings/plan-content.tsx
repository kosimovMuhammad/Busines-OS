"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/lib/hooks/useRole";
import { useGetPlanQuery, useUpdatePlanMutation } from "@/lib/api/company.api";
import type { Plan } from "@/types/enums";

const PLANS: Plan[] = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];

export function PlanContent() {
  const t = useTranslations("pages.settingsPlan");
  const tPlan = useTranslations("enums.plan");
  const { hasRole } = useRole();
  const isOwner = hasRole(["OWNER"]);

  const { data, isLoading } = useGetPlanQuery();
  const [updatePlan, { isLoading: isSaving }] = useUpdatePlanMutation();
  const [selected, setSelected] = useState<Plan | null>(null);

  if (isLoading || !data) {
    return <Skeleton className="h-40 w-full max-w-md" />;
  }

  const current = selected ?? data.plan;

  const handleSave = async () => {
    if (!selected || selected === data.plan) return;
    try {
      await updatePlan({ plan: selected }).unwrap();
      setSelected(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface p-5">
      <div>
        <p className="text-xs font-medium text-text-tertiary uppercase">{t("currentPlan")}</p>
        <p className="mt-1 text-lg font-semibold text-text-primary">{tPlan(data.plan)}</p>
      </div>

      {isOwner ? (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("changePlan")}
            </label>
            <Select value={current} onValueChange={(value) => setSelected(value as Plan)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => tPlan(value as Plan)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {tPlan(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selected || selected === data.plan}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </>
      ) : (
        <p className="text-xs text-text-tertiary">{t("ownerOnly")}</p>
      )}
    </div>
  );
}
