"use client";

import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replaces the plan-detail card once subscription.status is "Canceled" -
// showing the old plan name + a "Canceled" badge next to Pro-tier usage
// limits reads as still-active even though the company has no paid access
// anymore. Mirrors AiUpgradeBanner's shape (accent-gradient icon badge,
// title/description, CTA) for the same "upsell, not error" tone.
export function NoActivePlanCard({
  isOwner,
  onChoosePlan,
}: {
  isOwner: boolean;
  onChoosePlan: () => void;
}) {
  const t = useTranslations("pages.settingsPlan.noActivePlan");
  const tPlan = useTranslations("pages.settingsPlan");

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface px-6 py-12 text-center">
      <div className="bg-accent-gradient glow-accent flex size-12 items-center justify-center rounded-full text-white">
        <CreditCard className="size-5" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <p className="text-sm font-semibold text-text-primary">{t("title")}</p>
        <p className="text-sm text-text-secondary">{t("description")}</p>
      </div>
      {isOwner ? (
        <Button type="button" onClick={onChoosePlan}>
          {t("cta")}
        </Button>
      ) : (
        <p className="text-xs text-text-tertiary">{tPlan("adminReadOnly")}</p>
      )}
    </div>
  );
}
