"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Square } from "lucide-react";
import { useGetActiveTimeEntryQuery, useStopTimerMutation } from "@/lib/api/tasks.api";
import { useCanMutate } from "@/lib/hooks/usePermissions";

function formatElapsed(startedAt: string, now: number) {
  const totalSec = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function ActiveTimerWidget() {
  const t = useTranslations("pages.tasks.detail");
  const { data: activeEntry } = useGetActiveTimeEntryQuery(undefined, {
    pollingInterval: 30000,
  });
  const [stopTimer, { isLoading }] = useStopTimerMutation();
  const canMutate = useCanMutate();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeEntry) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  if (!activeEntry) return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface py-1.5 pr-1.5 pl-3 text-sm">
      <span className="size-1.5 rounded-full bg-danger" />
      <span className="max-w-32 truncate text-text-secondary">
        {activeEntry.taskTitle}
      </span>
      <span className="font-mono text-xs text-text-primary tabular-nums">
        {formatElapsed(activeEntry.startedAt, now)}
      </span>
      <button
        type="button"
        onClick={() => stopTimer(activeEntry.taskId)}
        disabled={isLoading || !canMutate}
        className="flex size-6 items-center justify-center rounded-full bg-danger/10 text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
        aria-label={t("stopTimer")}
      >
        <Square className="size-3" fill="currentColor" />
      </button>
    </div>
  );
}
