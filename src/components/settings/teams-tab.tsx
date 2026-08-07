"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2, UserMinus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetDepartmentsQuery } from "@/lib/api/departments.api";
import {
  useAddTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetTeamsQuery,
  useRemoveTeamMemberMutation,
  useRemoveTeamMutation,
} from "@/lib/api/teams.api";
import { TeamFormSheet } from "./team-form-sheet";
import type { Team } from "@/types/api";

function TeamMembers({ team, canManage }: { team: Team; canManage: boolean }) {
  const t = useTranslations("pages.settingsOrganization.teams");
  const { data: members, isLoading } = useGetTeamMembersQuery(team.id);
  const { data: users } = useGetUsersQuery();
  const [addTeamMember, { isLoading: isAdding }] = useAddTeamMemberMutation();
  const [removeTeamMember] = useRemoveTeamMemberMutation();
  const [selectedUserId, setSelectedUserId] = useState("");

  const availableUsers = (users ?? []).filter(
    (u) => !members?.some((m) => m.userId === u.id)
  );

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addTeamMember({ id: team.id, body: { userId: selectedUserId } }).unwrap();
      setSelectedUserId("");
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-3 border-t border-border-subtle px-4 py-3">
      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : !members || members.length === 0 ? (
        <p className="text-xs text-text-tertiary">{t("noMembers")}</p>
      ) : (
        <div className="space-y-1.5">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-1.5 text-sm text-text-primary"
            >
              {m.userName}
              {canManage && (
                <button
                  type="button"
                  onClick={() => removeTeamMember({ id: team.id, userId: m.userId })}
                  className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={t("removeMember")}
                >
                  <UserMinus className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="flex items-center gap-2">
          <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string) => availableUsers.find((u) => u.id === value)?.name ?? t("addMemberPlaceholder")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={handleAdd} disabled={!selectedUserId || isAdding}>
            {isAdding && <Loader2 className="size-3.5 animate-spin" />}
            {t("addMember")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function TeamsTab({ canManage }: { canManage: boolean }) {
  const t = useTranslations("pages.settingsOrganization.teams");
  const { data: teams, isLoading } = useGetTeamsQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const [removeTeam, { isLoading: isRemoving }] = useRemoveTeamMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const handleDelete = async () => {
    if (!deletingTeam) return;
    try {
      await removeTeam(deletingTeam.id).unwrap();
      setDeletingTeam(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              setEditingTeam(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            {t("create")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !teams || teams.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={t("empty")}
          action={
            canManage ? (
              <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="size-3.5" />
                {t("create")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {teams.map((team) => {
            const expanded = expandedId === team.id;
            const departmentName = departments?.find((d) => d.id === team.departmentId)?.name;
            return (
              <div key={team.id} className="rounded-2xl border border-border-subtle bg-surface">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : team.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {expanded ? (
                      <ChevronUp className="size-4 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="size-4 text-text-tertiary" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-primary">{team.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {departmentName ?? t("noDepartment")}
                        {team.teamLeadName ? ` · ${t("leadBy", { name: team.teamLeadName })}` : ""}
                      </p>
                    </div>
                  </button>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeam(team);
                          setSheetOpen(true);
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                        aria-label={t("edit")}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTeam(team)}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label={t("delete")}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {expanded && <TeamMembers team={team} canManage={canManage} />}
              </div>
            );
          })}
        </div>
      )}

      <TeamFormSheet open={sheetOpen} onOpenChange={setSheetOpen} team={editingTeam} />

      <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingTeam?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("deleteDialog.cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isRemoving}>
              {isRemoving && <Loader2 className="size-4 animate-spin" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
