"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetSubscriptionPlansQuery,
  useRequestUpgradeMutation,
} from "@/lib/api/subscription.api";
import { formatCurrency } from "@/lib/utils";
import type { BillingCycle } from "@/types/enums";
import type { UpgradeResult } from "@/types/api";

const BILLING_CYCLES: BillingCycle[] = ["Monthly", "Yearly"];

const KNOWN_FEATURE_KEYS = [
  "whatsapp_integration",
  "email_integration",
  "ai_features",
  "advanced_analytics",
  "custom_branding",
  "api_access",
  "max_users",
  "max_contacts",
  "max_deals",
  "storage_mb",
  "automation_workflows",
];

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  currentPlanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId: string;
}) {
  const t = useTranslations("pages.settingsPlan.upgradeDialog");
  const tCycle = useTranslations("enums.billingCycle");
  const tFeature = useTranslations("pages.settingsPlan.featureKey");
  const locale = useLocale();

  const featureLabel = (key: string) =>
    KNOWN_FEATURE_KEYS.includes(key) ? tFeature(key) : key;

  const { data: plans, isLoading } = useGetSubscriptionPlansQuery();
  const [requestUpgrade, { isLoading: isSubmitting }] = useRequestUpgradeMutation();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [result, setResult] = useState<UpgradeResult | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) setResult(null);
    onOpenChange(next);
  };

  const handleSelect = async (planId: string) => {
    try {
      const res = await requestUpgrade({ planId, billingCycle }).unwrap();
      setResult(res);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 space-y-2">
              <p className="text-sm font-medium text-text-primary">{t("pendingTitle")}</p>
              <p className="text-sm text-text-secondary">{result.message}</p>
              <p className="text-sm text-text-tertiary">
                {t("amount")}: {formatCurrency(result.amount, result.currency, locale)}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {t("done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase">
                {t("billingCycle")}
              </label>
              <Select
                value={billingCycle}
                onValueChange={(value) => setBillingCycle((value as BillingCycle) ?? "Monthly")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>{(value: string) => tCycle(value as BillingCycle)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tCycle(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading || !plans ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const isCurrent = plan.id === currentPlanId;
                  const price = billingCycle === "Monthly" ? plan.priceMonthly : plan.priceYearly;
                  const enabledFeatures = plan.features.filter((f) => f.enabled);
                  return (
                    <div
                      key={plan.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                        {isCurrent && <Badge variant="secondary">{t("currentPlanBadge")}</Badge>}
                      </div>
                      <p className="text-xl font-semibold text-text-primary">
                        {formatCurrency(price, plan.currency, locale)}
                        <span className="text-xs font-normal text-text-tertiary">
                          {billingCycle === "Monthly" ? t("perMonth") : t("perYear")}
                        </span>
                      </p>
                      <ul className="flex-1 space-y-1">
                        {enabledFeatures.map((f) => (
                          <li
                            key={f.featureKey}
                            className="flex items-center gap-1.5 text-xs text-text-secondary"
                          >
                            <Check className="size-3 shrink-0 text-success" />
                            {featureLabel(f.featureKey)}
                            {f.limit !== null && ` (${f.limit})`}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent || isSubmitting}
                        onClick={() => handleSelect(plan.id)}
                      >
                        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                        {t("select")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
