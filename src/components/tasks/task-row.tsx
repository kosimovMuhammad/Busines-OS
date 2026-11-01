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
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import type { Task } from "@/types/api";
import type { TaskStatus } from "@/types/enums";

import { format, isToday, isPast, startOfToday } from "date-fns";

const STATUS_ORDER: TaskStatus[] = ["Todo", "InProgress", "Completed", "Archived"];

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
  const canMutate = useCanMutate();

  const TODAY_START = startOfToday();
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = dueDateObj ? dueDateObj < TODAY_START : false;
  const today = dueDateObj ? isToday(dueDateObj) : false;

  const priorityColor =
    task.priority === "Urgent" || task.priority === "High"
      ? "bg-danger"
      : task.priority === "Medium"
        ? "bg-warning"
        : "bg-transparent";

  let formattedDate = "";
  if (dueDateObj) {
    if (overdue) {
      formattedDate = format(dueDateObj, "MMM d");
    } else if (today) {
      formattedDate = format(dueDateObj, "HH:mm");
    } else {
      formattedDate = format(dueDateObj, "MMM d");
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="group flex items-center gap-4 hover:bg-surface-elevated/30 p-3 transition-colors cursor-pointer" onClick={onOpen}>
      <div className="flex items-center gap-3 w-[400px] shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => updateStatus({ id: task.id, status: task.status === "Completed" ? "Todo" : "Completed" })}
          disabled={!canMutate}
          className="flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-border-strong hover:border-text-primary transition-colors disabled:opacity-50"
          aria-label={tStatus(task.status)}
        >
          {task.status === "Completed" && <div className="size-2 bg-text-primary rounded-[1px]" />}
        </button>

        <div className={cn("h-3.5 w-1 rounded-full", priorityColor)} />

        <div className="min-w-0 flex-1 text-left">
          <p className={cn("truncate text-sm font-medium text-text-primary", task.status === "Completed" && "line-through text-text-tertiary")}>
            {task.title}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-6">
        <div className="hidden md:flex text-sm text-text-tertiary w-[200px] justify-end truncate">
          {task.contactId ? "Client Contact" : task.dealId ? "Related Deal" : ""}
        </div>
        
        <div className={cn("text-[13px] w-[80px] text-right font-medium", overdue ? "text-danger" : "text-text-tertiary")}>
          {formattedDate}
        </div>

        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
          {task.assignee ? getInitials(task.assignee.name) : "—"}
        </div>
      </div>
    </div>
  );
}
