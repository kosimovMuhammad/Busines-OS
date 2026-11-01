"use client";

import { useTranslations } from "next-intl";
import { CircleCheck, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskRow } from "./task-row";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/api";
import type { TaskStatus } from "@/types/enums";

const TODAY_START = new Date();
TODAY_START.setHours(0, 0, 0, 0);

const isOverdue = (date: Date) => date < TODAY_START;
const isToday = (date: Date) => {
  const d = new Date(date);
  return (
    d.getDate() === TODAY_START.getDate() &&
    d.getMonth() === TODAY_START.getMonth() &&
    d.getFullYear() === TODAY_START.getFullYear()
  );
};
const isThisWeek = (date: Date) => {
  if (isOverdue(date) || isToday(date)) return false;
  const d = new Date(date);
  const endOfWeek = new Date(TODAY_START);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return d <= endOfWeek;
};


export function TasksList({
  tasks,
  isLoading,
  activeTaskId,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
}: {
  tasks: Task[];
  isLoading: boolean;
  activeTaskId: string | null;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.tasks");
  const tStatus = useTranslations("enums.taskStatus");

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState icon={CircleCheck} title={t("empty")} />;
  }

  const activeTasks = tasks.filter(t => t.status === "Todo" || t.status === "InProgress");
  
  const overdueTasks = activeTasks.filter(t => t.dueDate && isOverdue(new Date(t.dueDate)));
  const todayTasks = activeTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
  const thisWeekTasks = activeTasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)));
  const otherTasks = activeTasks.filter(t => !t.dueDate || (!isOverdue(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && !isThisWeek(new Date(t.dueDate))));
  const completedTasks = tasks.filter(t => t.status === "Completed" || t.status === "Archived");

  const groups = [
    { id: "overdue", label: "OVERDUE", tasks: overdueTasks, color: "text-danger" },
    { id: "today", label: "TODAY", tasks: todayTasks, color: "text-text-secondary" },
    { id: "thisWeek", label: "THIS WEEK", tasks: thisWeekTasks, color: "text-text-secondary" },
    { id: "later", label: "LATER", tasks: otherTasks, color: "text-text-secondary" },
    { id: "completed", label: "COMPLETED", tasks: completedTasks, color: "text-text-tertiary" }
  ].filter(g => g.tasks.length > 0);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="mb-4 flex items-center gap-3">
            <h3 className={cn("text-xs font-bold tracking-wider", group.color)}>
              {group.label}
            </h3>
            <span className="flex size-5 items-center justify-center rounded-md bg-surface-elevated text-[11px] font-medium text-text-secondary">
              {group.tasks.length}
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
            {group.tasks.map((task, index) => (
              <div key={task.id} className={cn("group", index !== 0 && "border-t border-border-subtle")}>
                <TaskRow
                  task={task}
                  isActiveTimer={task.id === activeTaskId}
                  hasOtherActiveTimer={!!activeTaskId && activeTaskId !== task.id}
                  onOpen={() => onOpen(task)}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
