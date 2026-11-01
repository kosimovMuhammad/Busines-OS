"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

// Page-level fallback for AI surfaces when the company plan lacks
// ai_features - mirrors EmptyState's restrained card shape but uses the
// accent gradient badge (see globals.css bg-accent-gradient/glow-accent)
// to read as an upsell rather than an empty/error state.
export function AiUpgradeBanner() {
  const t = useTranslations("pages.ai.upgradeRequired");

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border-subtle bg-surface px-6 py-16 text-center">
      <div className="bg-accent-gradient glow-accent flex size-12 items-center justify-center rounded-full text-white">
        <Sparkles className="size-5" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <p className="text-sm font-semibold text-text-primary">{t("title")}</p>
        <p className="text-sm text-text-secondary">{t("description")}</p>
      </div>
      <Link href="/settings/plan" className={buttonVariants()}>
        {t("cta")}
      </Link>
    </div>
  );
}
