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
import { useRemoveMeetingMutation } from "@/lib/api/calendar.api";
import type { Meeting } from "@/types/api";

export function DeleteMeetingDialog({
  meeting,
  onOpenChange,
  onDeleted,
}: {
  meeting: Meeting | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const t = useTranslations("pages.calendar.deleteDialog");
  const tAction = useTranslations("pages.calendar.form");
  const [removeMeeting, { isLoading }] = useRemoveMeetingMutation();

  const handleConfirm = async () => {
    if (!meeting) return;
    try {
      await removeMeeting(meeting.id).unwrap();
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!meeting} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { title: meeting?.title ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("cancel")}</DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {tAction("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
