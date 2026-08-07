"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/lib/hooks/useRole";
import {
  useGetSubscriptionQuery,
  useGetUsageQuery,
} from "@/lib/api/subscription.api";
import { useGetFeaturesQuery } from "@/lib/api/company.api";
import { SubscriptionStatusBadge } from "./subscription-status-badge";
import { PlanUpgradeDialog } from "./plan-upgrade-dialog";
import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";
import { InvoiceHistoryTable } from "./invoice-history-table";

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

function UsageBar({ label, current, limit, isUnlimited, unlimitedLabel }: {
  label: string;
  current: number;
  limit: number | null;
  isUnlimited: boolean;
  unlimitedLabel: string;
}) {
  const pct = isUnlimited || !limit ? 0 : Math.min(100, (current / limit) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-tertiary">
          {current} / {isUnlimited ? unlimitedLabel : (limit ?? 0)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
        {!isUnlimited && (
          <div
            className="h-full rounded-full bg-accent-primary"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function PlanContent() {
  const t = useTranslations("pages.settingsPlan");
  const tFeature = useTranslations("pages.settingsPlan.featureKey");
  const tCycle = useTranslations("enums.billingCycle");
  const locale = useLocale();
  const { hasRole } = useRole();
  const isOwner = hasRole(["Owner"]);

  const { data: subscription, isLoading: isSubLoading } = useGetSubscriptionQuery();
  const { data: usage, isLoading: isUsageLoading } = useGetUsageQuery();
  const { data: features, isLoading: isFeaturesLoading } = useGetFeaturesQuery();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const featureLabel = (key: string) =>
    KNOWN_FEATURE_KEYS.includes(key) ? tFeature(key) : key;

  if (isSubLoading || !subscription) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full max-w-2xl" />
        <Skeleton className="h-40 w-full max-w-2xl" />
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("currentPlan")}</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{subscription.planName}</p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("billingCycle")}</p>
            <p className="mt-1 text-text-secondary">{tCycle(subscription.billingCycle)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase">
              {subscription.trialEndsAt ? t("trialEndsOn") : t("renewsOn")}
            </p>
            <p className="mt-1 text-text-secondary">
              {formatter.format(
                new Date(subscription.trialEndsAt ?? subscription.currentPeriodEnd)
              )}
            </p>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <p className="rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">
            {t("canceledBanner")}
          </p>
        )}

        {isOwner ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setUpgradeOpen(true)}>
              {t("changePlan")}
            </Button>
            {!subscription.cancelAtPeriodEnd && (
              <Button type="button" variant="outline" onClick={() => setCancelOpen(true)}>
                {t("cancelSubscription")}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary">{t("adminReadOnly")}</p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-5">
        <p className="text-sm font-semibold text-text-primary">{t("usage.title")}</p>
        {isUsageLoading || !usage ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="space-y-3">
            {usage.map((metric) => (
              <UsageBar
                key={metric.metricKey}
                label={featureLabel(metric.metricKey)}
                current={metric.currentValue}
                limit={metric.limit}
                isUnlimited={metric.isUnlimited}
                unlimitedLabel={t("usage.unlimited")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-5">
        <p className="text-sm font-semibold text-text-primary">{t("features.title")}</p>
        {isFeaturesLoading || !features ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(features).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text-secondary">{featureLabel(key)}</span>
                <Badge variant={enabled ? "default" : "outline"}>
                  {enabled ? t("features.enabled") : t("features.disabled")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <InvoiceHistoryTable />
      </div>

      <PlanUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanId={subscription.planId}
      />
      <CancelSubscriptionDialog open={cancelOpen} onOpenChange={setCancelOpen} />
    </div>
  );
}
