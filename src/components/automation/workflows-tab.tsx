"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { History, Pencil, Plus, Trash2, Workflow as WorkflowIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useGetWorkflowQuery,
  useGetWorkflowsQuery,
  useToggleWorkflowMutation,
} from "@/lib/api/workflows.api";
import { WorkflowFormSheet } from "./workflow-form-sheet";
import { DeleteWorkflowDialog } from "./delete-workflow-dialog";
import { WorkflowExecutionsDialog } from "./workflow-executions-dialog";
import type { WorkflowSummary } from "@/types/api";

export function WorkflowsTab() {
  const t = useTranslations("pages.automation.workflows");
  const { data: workflows, isLoading } = useGetWorkflowsQuery();
  const [toggleWorkflow] = useToggleWorkflowMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<WorkflowSummary | null>(null);
  const [historyWorkflow, setHistoryWorkflow] = useState<WorkflowSummary | null>(null);

  const { data: editingWorkflow } = useGetWorkflowQuery(editingId ?? "", { skip: !editingId });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" />
          {t("create")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <EmptyState
          icon={WorkflowIcon}
          title={t("empty")}
          action={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              {t("create")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={workflow.isActive}
                  onCheckedChange={() => toggleWorkflow(workflow.id)}
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">{workflow.name}</p>
                  {workflow.description && (
                    <p className="text-xs text-text-tertiary">{workflow.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHistoryWorkflow(workflow)}
                  className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                  aria-label={t("viewHistory")}
                >
                  <History className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(workflow.id)}
                  className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                  aria-label={t("edit")}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingWorkflow(workflow)}
                  className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={t("delete")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkflowFormSheet open={createOpen} onOpenChange={setCreateOpen} workflow={null} />

      <WorkflowFormSheet
        open={!!editingId && !!editingWorkflow}
        onOpenChange={(open) => !open && setEditingId(null)}
        workflow={editingWorkflow ?? null}
      />

      <DeleteWorkflowDialog
        workflow={deletingWorkflow}
        onOpenChange={(open) => !open && setDeletingWorkflow(null)}
      />

      <WorkflowExecutionsDialog
        workflow={historyWorkflow}
        onOpenChange={(open) => !open && setHistoryWorkflow(null)}
      />
    </div>
  );
}
