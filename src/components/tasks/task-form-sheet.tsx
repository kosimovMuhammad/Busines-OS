"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/lib/api/tasks.api";
import { createTaskSchema, type TaskFormValues } from "@/lib/schemas/task.schema";
import { cn } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import type { Task } from "@/types/api";
import type { TaskPriority } from "@/types/enums";

const UNASSIGNED = "__unassigned__";
const NONE = "__none__";
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}) {
  const t = useTranslations("pages.tasks.form");
  const tPriority = useTranslations("enums.taskPriority");
  const tValidation = useTranslations("validation");
  const isEdit = !!task;

  const { data: users } = useGetUsersQuery();
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: deals } = useGetDealsQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const isSubmitting = isCreating || isUpdating;
  const canMutate = useCanMutate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema({ required: tValidation("required") })),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "Medium",
      assignedTo: task?.assignedTo ?? "",
      dueDate: task?.dueDate?.slice(0, 10) ?? "",
      dealId: task?.dealId ?? "",
      contactId: task?.contactId ?? "",
    });
  }, [open, task, reset]);

  const priority = watch("priority");
  const assignedTo = watch("assignedTo");
  const dealId = watch("dealId");
  const contactId = watch("contactId");

  const onSubmit = async (values: TaskFormValues) => {
    const body = {
      title: values.title,
      description: values.description || undefined,
      priority: (values.priority as TaskPriority) || undefined,
      assignedTo: values.assignedTo || undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      dealId: values.dealId || undefined,
      contactId: values.contactId || undefined,
    };

    try {
      if (isEdit && task) {
        await updateTask({ id: task.id, body }).unwrap();
      } else {
        await createTask(body).unwrap();
      }
      onOpenChange(false);
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
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-xs font-medium text-text-tertiary uppercase">
              {t("title")}
            </label>
            <input id="task-title" className={inputClass} {...register("title")} />
            {errors.title && (
              <p className="text-xs text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="task-description"
              className={cn(inputClass, "min-h-20 resize-none")}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="task-priority" className="text-xs font-medium text-text-tertiary uppercase">
                {t("priority")}
              </label>
              <Select
                value={priority || "Medium"}
                onValueChange={(value) => setValue("priority", value ?? "Medium")}
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue>
                    {(value: string) => tPriority(value as TaskPriority)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {tPriority(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-dueDate" className="text-xs font-medium text-text-tertiary uppercase">
                {t("dueDate")}
              </label>
              <input id="task-dueDate" className={inputClass} type="date" {...register("dueDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-xs font-medium text-text-tertiary uppercase">
              {t("assignee")}
            </label>
            <Select
              value={assignedTo || UNASSIGNED}
              onValueChange={(value) =>
                setValue("assignedTo", value === UNASSIGNED || !value ? "" : value)
              }
            >
              <SelectTrigger id="task-assignee" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    !value || value === UNASSIGNED
                      ? t("unassigned")
                      : (users?.find((u) => u.id === value)?.name ?? t("unassigned"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>{t("unassigned")}</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedContact")}
            </label>
            <Select
              value={contactId || NONE}
              onValueChange={(value) =>
                setValue("contactId", value === NONE || !value ? "" : value)
              }
            >
              <SelectTrigger id="task-contact" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const contact = contactsPage?.data.find((c) => c.id === value);
                    return contact
                      ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
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
            <label htmlFor="task-deal" className="text-xs font-medium text-text-tertiary uppercase">
              {t("relatedDeal")}
            </label>
            <Select
              value={dealId || NONE}
              onValueChange={(value) =>
                setValue("dealId", value === NONE || !value ? "" : value)
              }
            >
              <SelectTrigger id="task-deal" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const deal = deals?.find((d) => d.id === value);
                    return deal ? deal.title : t("none");
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
        </form>

        <SheetFooter>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !canMutate}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
