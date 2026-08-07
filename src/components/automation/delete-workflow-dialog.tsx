"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRemoveWorkflowMutation } from "@/lib/api/workflows.api";
import type { WorkflowSummary } from "@/types/api";

export function DeleteWorkflowDialog({
  workflow,
  onOpenChange,
}: {
  workflow: WorkflowSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.automation.workflows");
  const [removeWorkflow, { isLoading }] = useRemoveWorkflowMutation();

  const handleConfirm = async () => {
    if (!workflow) return;
    try {
      await removeWorkflow(workflow.id).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!workflow} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteDialog.description", { name: workflow?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("deleteDialog.cancel")}
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
