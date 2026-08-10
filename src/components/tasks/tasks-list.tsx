"use client";

import { useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskRow } from "./task-row";
import type { Task } from "@/types/api";
import type { TaskStatus } from "@/types/enums";

const STATUS_ORDER: TaskStatus[] = ["Todo", "InProgress", "Completed", "Archived"];

export function TasksList({
  tasks,
  isLoading,
  activeTaskId,
  onOpen,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  isLoading: boolean;
  activeTaskId: string | null;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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

  const groups = STATUS_ORDER.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.status}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {tStatus(group.status)}
            </h3>
            <span className="flex size-5 items-center justify-center rounded-full bg-surface-elevated text-xs text-text-secondary">
              {group.tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {group.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isActiveTimer={task.id === activeTaskId}
                hasOtherActiveTimer={!!activeTaskId && activeTaskId !== task.id}
                onOpen={() => onOpen(task)}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
