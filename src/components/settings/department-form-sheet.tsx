"use client";

import { useState } from "react";
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
import {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
} from "@/lib/api/departments.api";
import type { Department } from "@/types/api";

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function DepartmentFormSheet({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}) {
  const t = useTranslations("pages.settingsOrganization.departments.form");
  const tNone = useTranslations("pages.settingsOrganization");
  const isEdit = !!department;

  const { data: departments } = useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentDepartmentId, setParentDepartmentId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(department?.name ?? "");
      setDescription(department?.description ?? "");
      setParentDepartmentId(department?.parentDepartmentId ?? "");
      setManagerId(department?.managerId ?? "");
    }
  }

  const canSubmit = name.trim().length >= 2;
  const selectableParents = (departments ?? []).filter((d) => d.id !== department?.id);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentDepartmentId: parentDepartmentId || undefined,
      managerId: managerId || undefined,
    };
    try {
      if (isEdit && department) {
        await updateDepartment({ id: department.id, body }).unwrap();
      } else {
        await createDepartment(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <label htmlFor="dept-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="dept-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dept-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="dept-description"
              className={`${inputClass} min-h-16 resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dept-parent" className="text-xs font-medium text-text-tertiary uppercase">
              {t("parent")}
            </label>
            <Select
              value={parentDepartmentId || NONE}
              onValueChange={(value) => setParentDepartmentId(value === NONE ? "" : (value ?? ""))}
            >
              <SelectTrigger id="dept-parent" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? tNone("none")
                      : (selectableParents.find((d) => d.id === value)?.name ?? tNone("none"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{tNone("none")}</SelectItem>
                {selectableParents.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dept-manager" className="text-xs font-medium text-text-tertiary uppercase">
              {t("manager")}
            </label>
            <Select
              value={managerId || NONE}
              onValueChange={(value) => setManagerId(value === NONE ? "" : (value ?? ""))}
            >
              <SelectTrigger id="dept-manager" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? tNone("none")
                      : (users?.find((u) => u.id === value)?.name ?? tNone("none"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{tNone("none")}</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
