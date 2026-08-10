"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useGetUsersQuery } from "@/lib/api/users.api";
import {
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useUpdateMeetingStatusMutation,
} from "@/lib/api/calendar.api";
import { createMeetingSchema, type MeetingFormValues } from "@/lib/schemas/meeting.schema";
import { cn } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import type { Meeting } from "@/types/api";
import type { MeetingStatus } from "@/types/enums";

const NONE = "__none__";
const STATUSES: MeetingStatus[] = ["Scheduled", "Completed", "Cancelled"];

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function MeetingFormSheet({
  open,
  onOpenChange,
  meeting,
  defaultStartAt,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  defaultStartAt?: Date;
  onDelete?: () => void;
}) {
  const t = useTranslations("pages.calendar.form");
  const tStatus = useTranslations("enums.meetingStatus");
  const tValidation = useTranslations("validation");
  const isEdit = !!meeting;

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: deals } = useGetDealsQuery();
  const { data: users } = useGetUsersQuery();
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateMeetingStatusMutation();
  const isSubmitting = isCreating || isUpdating || isUpdatingStatus;
  const canMutate = useCanMutate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(
      createMeetingSchema({
        required: tValidation("required"),
        endAfterStart: t("endAfterStart"),
      })
    ),
    defaultValues: { title: "", startAt: "", endAt: "" },
  });

  useEffect(() => {
    if (!open) return;
    const start = meeting ? new Date(meeting.startAt) : (defaultStartAt ?? new Date());
    const end = meeting ? new Date(meeting.endAt) : new Date(start.getTime() + 60 * 60000);
    reset({
      title: meeting?.title ?? "",
      contactId: meeting?.contactId ?? "",
      dealId: meeting?.dealId ?? "",
      startAt: toLocalInputValue(start.toISOString()),
      endAt: toLocalInputValue(end.toISOString()),
      location: meeting?.location ?? "",
      description: meeting?.description ?? "",
      attendeeUserIds: meeting?.attendeeUserIds ?? [],
    });
  }, [open, meeting, defaultStartAt, reset]);

  const contactId = watch("contactId");
  const dealId = watch("dealId");
  const attendeeUserIds = watch("attendeeUserIds") ?? [];

  const toggleAttendee = (userId: string) => {
    const current = attendeeUserIds;
    setValue(
      "attendeeUserIds",
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const onSubmit = async (values: MeetingFormValues) => {
    const body = {
      title: values.title,
      contactId: values.contactId || undefined,
      dealId: values.dealId || undefined,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      location: values.location || undefined,
      description: values.description || undefined,
      attendeeUserIds: values.attendeeUserIds,
    };

    try {
      if (isEdit && meeting) {
        await updateMeeting({ id: meeting.id, body }).unwrap();
      } else {
        await createMeeting(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const handleStatusChange = async (status: MeetingStatus) => {
    if (!meeting || status === meeting.status) return;
    try {
      await updateStatus({ id: meeting.id, body: { status } }).unwrap();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          {isEdit && meeting && (
            <div className="space-y-1.5">
              <label htmlFor="meeting-status" className="text-xs font-medium text-text-tertiary uppercase">
                {t("status")}
              </label>
              <Select
                value={meeting.status}
                onValueChange={(value) => handleStatusChange(value as MeetingStatus)}
              >
                <SelectTrigger id="meeting-status" className="w-full">
                  <SelectValue>
                    {(value: string) => tStatus(value as MeetingStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {tStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="meeting-title" className="text-xs font-medium text-text-tertiary uppercase">
              {t("title")}
            </label>
            <input id="meeting-title" className={inputClass} {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="meeting-startAt" className="text-xs font-medium text-text-tertiary uppercase">
                {t("startAt")}
              </label>
              <input id="meeting-startAt" className={inputClass} type="datetime-local" {...register("startAt")} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="meeting-endAt" className="text-xs font-medium text-text-tertiary uppercase">
                {t("endAt")}
              </label>
              <input id="meeting-endAt" className={inputClass} type="datetime-local" {...register("endAt")} />
              {errors.endAt && (
                <p className="text-xs text-danger">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meeting-location" className="text-xs font-medium text-text-tertiary uppercase">
              {t("location")}
            </label>
            <input id="meeting-location" className={inputClass} {...register("location")} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meeting-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="meeting-description"
              className={cn(inputClass, "min-h-20 resize-none")}
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meeting-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedContact")}
            </label>
            <Select
              value={contactId || NONE}
              onValueChange={(value) =>
                setValue("contactId", value === NONE || !value ? "" : value)
              }
            >
              <SelectTrigger id="meeting-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const c = contactsPage?.data.find((x) => x.id === value);
                    return c
                      ? [c.firstName, c.lastName].filter(Boolean).join(" ")
                      : t("none");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("none")}</SelectItem>
                {contactsPage?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meeting-deal" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedDeal")}
            </label>
            <Select
              value={dealId || NONE}
              onValueChange={(value) =>
                setValue("dealId", value === NONE || !value ? "" : value)
              }
            >
              <SelectTrigger id="meeting-deal" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const d = deals?.find((x) => x.id === value);
                    return d ? d.title : t("none");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("none")}</SelectItem>
                {deals?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase">
              {t("attendees")}
            </label>
            <div className="space-y-1.5 rounded-xl border border-border-subtle p-3">
              {users?.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Checkbox
                    checked={attendeeUserIds.includes(u.id)}
                    onCheckedChange={() => toggleAttendee(u.id)}
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
        </form>

        <SheetFooter className={cn(isEdit && "flex-row justify-between")}>
          {isEdit && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={!canMutate}>
              <Trash2 className="size-4" />
              {t("delete")}
            </Button>
          )}
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting || !canMutate}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
