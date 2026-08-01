"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStartTimerMutation,
  useStopTimerMutation,
  useUpdateTaskStatusMutation,
} from "@/lib/api/tasks.api";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/api";
import type { TaskStatus } from "@/types/enums";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];

const PRIORITY_CLASS: Record<Task["priority"], string> = {
  LOW: "bg-surface-elevated text-text-tertiary",
  MEDIUM: "bg-warning/10 text-warning",
  HIGH: "bg-danger/10 text-danger",
  URGENT: "bg-danger/20 text-danger",
};

export function TaskRow({
  task,
  isActiveTimer,
  hasOtherActiveTimer,
  onOpen,
  onEdit,
  onDelete,
}: {
  task: Task;
  isActiveTimer: boolean;
  hasOtherActiveTimer: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("pages.tasks");
  const tPriority = useTranslations("enums.taskPriority");
  const tStatus = useTranslations("enums.taskStatus");
  const locale = useLocale();

  const [startTimer, { isLoading: isStarting }] = useStartTimerMutation();
  const [stopTimer, { isLoading: isStopping }] = useStopTimerMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();

  const dueDate = task.dueDate
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
        new Date(task.dueDate)
      )
    : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3">
      <button
        type="button"
        onClick={() => (isActiveTimer ? stopTimer(task.id) : startTimer(task.id))}
        disabled={isStarting || isStopping || (hasOtherActiveTimer && !isActiveTimer)}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30",
          isActiveTimer
            ? "bg-danger/10 text-danger hover:bg-danger/20"
            : "bg-surface-elevated text-text-tertiary hover:text-text-primary"
        )}
        aria-label={isActiveTimer ? t("stopTimer") : t("startTimer")}
      >
        {isActiveTimer ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
          {dueDate && <span>{dueDate}</span>}
          {task.assignee && <span>· {task.assignee.name}</span>}
        </div>
      </button>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
          PRIORITY_CLASS[task.priority]
        )}
      >
        {tPriority(task.priority)}
      </span>

      <Select
        value={task.status}
        onValueChange={(value) =>
          value && value !== task.status && updateStatus({ id: task.id, status: value as TaskStatus })
        }
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue>{(value: string) => tStatus(value as TaskStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {tStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={onEdit}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        aria-label={t("edit")}
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
        aria-label={t("delete")}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
