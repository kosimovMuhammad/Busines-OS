"use client";

import { useTranslations } from "next-intl";
import { useGetUsersQuery } from "@/lib/api/users.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/types/enums";

const ALL = "__all__";
const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];

export function TasksFilters({
  status,
  onStatusChange,
  assignedTo,
  onAssignedToChange,
  onCreate,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  assignedTo: string;
  onAssignedToChange: (value: string) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.tasks");
  const tStatus = useTranslations("enums.taskStatus");
  const { data: users } = useGetUsersQuery();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status || ALL}
        onValueChange={(value) => onStatusChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL ? t("allStatuses") : tStatus(value as TaskStatus)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {tStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={assignedTo || ALL}
        onValueChange={(value) => onAssignedToChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL
                ? t("allAssignees")
                : (users?.find((u) => u.id === value)?.name ?? t("allAssignees"))
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allAssignees")}</SelectItem>
          {users?.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={onCreate} className="ml-auto">
        {t("createTask")}
      </Button>
    </div>
  );
}
