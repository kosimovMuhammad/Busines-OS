"use client";

import { useState } from "react";
import {
  useGetActiveTimeEntryQuery,
  useGetTasksQuery,
} from "@/lib/api/tasks.api";
import { TasksFilters } from "./tasks-filters";
import { TasksList } from "./tasks-list";
import { TaskFormSheet } from "./task-form-sheet";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskDetailSheet } from "./task-detail-sheet";
import type { Task } from "@/types/api";
import type { TaskStatus } from "@/types/enums";

export function TasksContent() {
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const { data: tasks, isLoading } = useGetTasksQuery({
    status: (status as TaskStatus) || undefined,
    assignedTo: assignedTo || undefined,
  });
  const { data: activeEntry } = useGetActiveTimeEntryQuery();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const activeTaskId = activeEntry?.taskId ?? null;

  return (
    <div className="space-y-4">
      <TasksFilters
        status={status}
        onStatusChange={setStatus}
        assignedTo={assignedTo}
        onAssignedToChange={setAssignedTo}
        onCreate={() => {
          setEditingTask(null);
          setSheetOpen(true);
        }}
      />

      <TasksList
        tasks={tasks ?? []}
        isLoading={isLoading}
        activeTaskId={activeTaskId}
        onOpen={setOpenTask}
        onEdit={(task) => {
          setEditingTask(task);
          setSheetOpen(true);
        }}
        onDelete={setDeletingTask}
      />

      <TaskFormSheet open={sheetOpen} onOpenChange={setSheetOpen} task={editingTask} />

      <DeleteTaskDialog
        task={deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      />

      <TaskDetailSheet
        task={openTask}
        isActiveTimer={!!openTask && openTask.id === activeTaskId}
        hasOtherActiveTimer={!!activeTaskId && activeTaskId !== openTask?.id}
        onOpenChange={(open) => !open && setOpenTask(null)}
        onEdit={() => {
          if (!openTask) return;
          setEditingTask(openTask);
          setSheetOpen(true);
          setOpenTask(null);
        }}
        onDelete={() => {
          if (!openTask) return;
          setDeletingTask(openTask);
          setOpenTask(null);
        }}
      />
    </div>
  );
}
