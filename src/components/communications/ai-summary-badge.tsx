"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { useGetSummaryQuery, useSummarizeMutation } from "@/lib/api/ai.api";
import { useAiFeatureEnabled } from "@/lib/hooks/useAiFeatureEnabled";

export function AiSummaryBadge({
  communicationId,
  existingSummary,
}: {
  communicationId: string;
  existingSummary: string | null;
}) {
  const t = useTranslations("pages.communications");
  const aiEnabled = useAiFeatureEnabled();
  const [triggered, setTriggered] = useState(false);
  const [summarize, { isLoading: isTriggering }] = useSummarizeMutation();
  const { data } = useGetSummaryQuery(communicationId, {
    skip: !triggered || !!existingSummary,
  });

  const handleClick = async () => {
    setTriggered(true);
    try {
      await summarize({ communicationId }).unwrap();
    } catch {
      // errorToastMiddleware shows the calm "AI is being activated" toast
    }
  };

  const summary = existingSummary ?? data?.summary ?? null;

  if (summary) {
    return (
      <p className="mt-1 flex items-start gap-1.5 text-xs text-accent-secondary">
        <Sparkles className="mt-0.5 size-3 shrink-0" />
        {summary}
      </p>
    );
  }

  if (!aiEnabled) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTriggering}
      className="mt-1 flex items-center gap-1 text-xs text-text-tertiary transition-colors hover:text-accent-secondary disabled:opacity-60"
    >
      {isTriggering ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Sparkles className="size-3" />
      )}
      {t("summarize")}
    </button>
  );
}
