"use client";

import { useLocale, useTranslations } from "next-intl";
import { Clock, Pause, Play, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRole } from "@/lib/hooks/useRole";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import {
  useGetTaskTimeEntriesQuery,
  useRemoveTimeEntryMutation,
  useStartTimerMutation,
  useStopTimerMutation,
} from "@/lib/api/tasks.api";
import type { Task } from "@/types/api";

const TIME_ENTRY_DELETE_ROLES = ["Owner", "Admin", "Manager"] as const;

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

export function TaskDetailSheet({
  task,
  isActiveTimer,
  hasOtherActiveTimer,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  task: Task | null;
  isActiveTimer: boolean;
  hasOtherActiveTimer: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("pages.tasks.detail");
  const tPriority = useTranslations("enums.taskPriority");
  const locale = useLocale();
  const { hasRole } = useRole();
  const canDeleteEntries = hasRole([...TIME_ENTRY_DELETE_ROLES]);
  const canMutate = useCanMutate();

  const { data: entries, isLoading } = useGetTaskTimeEntriesQuery(task?.id ?? "", {
    skip: !task,
  });
  const [removeEntry] = useRemoveTimeEntryMutation();
  const [startTimer, { isLoading: isStarting }] = useStartTimerMutation();
  const [stopTimer, { isLoading: isStopping }] = useStopTimerMutation();

  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const totalSec = (entries ?? []).reduce((sum, e) => sum + (e.durationSec ?? 0), 0);

  return (
    <Sheet open={!!task} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        {task && (
          <>
            <SheetHeader>
              <SheetTitle>{task.title}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 overflow-y-auto px-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                <span className="rounded-full bg-surface-elevated px-2 py-0.5">
                  {tPriority(task.priority)}
                </span>
                {task.assignee && <span>{task.assignee.name}</span>}
                {task.dueDate && (
                  <span>{formatter.format(new Date(task.dueDate))}</span>
                )}
              </div>

              {task.description && (
                <p className="text-sm whitespace-pre-wrap text-text-secondary">
                  {task.description}
                </p>
              )}

              <Button
                type="button"
                variant={isActiveTimer ? "destructive" : "outline"}
                disabled={!canMutate || isStarting || isStopping || (hasOtherActiveTimer && !isActiveTimer)}
                onClick={() =>
                  isActiveTimer ? stopTimer(task.id) : startTimer(task.id)
                }
              >
                {isActiveTimer ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {isActiveTimer ? t("stopTimer") : t("startTimer")}
              </Button>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-text-primary">
                    {t("timeEntries")}
                  </h4>
                  <span className="text-xs text-text-tertiary">
                    {t("total")}: {formatDuration(totalSec)}
                  </span>
                </div>

                {isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : !entries || entries.length === 0 ? (
                  <EmptyState icon={Clock} title={t("noEntries")} />
                ) : (
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-2.5 text-sm"
                      >
                        <span className="text-text-secondary">
                          {formatter.format(new Date(entry.startedAt))}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary">
                            {entry.durationSec != null
                              ? formatDuration(entry.durationSec)
                              : "—"}
                          </span>
                          {canDeleteEntries && (
                            <button
                              type="button"
                              onClick={() =>
                                removeEntry({ taskId: task.id, entryId: entry.id })
                              }
                              className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                              aria-label={t("deleteEntry")}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <SheetFooter className="flex-row justify-between">
              <Button type="button" variant="destructive" onClick={onDelete} disabled={!canMutate}>
                <Trash2 className="size-4" />
                {t("deleteTask")}
              </Button>
              <Button type="button" onClick={onEdit} disabled={!canMutate}>
                {t("editTask")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
