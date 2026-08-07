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
import { useGetDepartmentsQuery } from "@/lib/api/departments.api";
import { useCreateTeamMutation, useUpdateTeamMutation } from "@/lib/api/teams.api";
import type { Team } from "@/types/api";

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function TeamFormSheet({
  open,
  onOpenChange,
  team,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}) {
  const t = useTranslations("pages.settingsOrganization.teams.form");
  const tNone = useTranslations("pages.settingsOrganization");
  const isEdit = !!team;

  const { data: departments } = useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(team?.name ?? "");
      setDescription(team?.description ?? "");
      setDepartmentId(team?.departmentId ?? "");
      setTeamLeadId(team?.teamLeadId ?? "");
    }
  }

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      departmentId: departmentId || undefined,
      teamLeadId: teamLeadId || undefined,
    };
    try {
      if (isEdit && team) {
        await updateTeam({ id: team.id, body }).unwrap();
      } else {
        await createTeam(body).unwrap();
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
            <label htmlFor="team-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="team-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="team-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="team-description"
              className={`${inputClass} min-h-16 resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="team-department" className="text-xs font-medium text-text-tertiary uppercase">
              {t("department")}
            </label>
            <Select
              value={departmentId || NONE}
              onValueChange={(value) => setDepartmentId(value === NONE ? "" : (value ?? ""))}
            >
              <SelectTrigger id="team-department" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? tNone("none")
                      : (departments?.find((d) => d.id === value)?.name ?? tNone("none"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{tNone("none")}</SelectItem>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="team-lead" className="text-xs font-medium text-text-tertiary uppercase">
              {t("teamLead")}
            </label>
            <Select
              value={teamLeadId || NONE}
              onValueChange={(value) => setTeamLeadId(value === NONE ? "" : (value ?? ""))}
            >
              <SelectTrigger id="team-lead" className="w-full">
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
