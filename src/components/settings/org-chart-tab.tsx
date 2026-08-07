"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Network, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetOrgChartForUserQuery, useGetOrgChartQuery } from "@/lib/api/orgChart.api";
import type { OrgChartDepartmentNode, OrgChartPerson } from "@/types/api";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function PersonChip({ person, onClick }: { person: OrgChartPerson; onClick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(person.id)}
      className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-text-primary transition-colors hover:border-accent-primary/50"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-accent-gradient text-[10px] font-semibold text-white">
        {initials(person.name) || <User className="size-3" />}
      </span>
      {person.name}
    </button>
  );
}

function DepartmentNode({
  node,
  depth,
  onSelectUser,
}: {
  node: OrgChartDepartmentNode;
  depth: number;
  onSelectUser: (id: string) => void;
}) {
  const t = useTranslations("pages.settingsOrganization.orgChart");

  return (
    <div style={{ marginInlineStart: depth * 24 }}>
      <div className="rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-2">
          <Network className="size-4 text-accent-primary" />
          <p className="text-sm font-semibold text-text-primary">{node.name}</p>
          {node.managerName && (
            <span className="text-xs text-text-tertiary">
              · {t("managedBy", { name: node.managerName })}
            </span>
          )}
        </div>
        {node.employees.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {node.employees.map((employee) => (
              <PersonChip key={employee.id} person={employee} onClick={onSelectUser} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-text-tertiary">{t("noEmployees")}</p>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <DepartmentNode key={child.id} node={child} depth={depth + 1} onSelectUser={onSelectUser} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserDetailSheet({ userId, onOpenChange }: { userId: string | null; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("pages.settingsOrganization.orgChart");
  const { data, isLoading } = useGetOrgChartForUserQuery(userId ?? "", { skip: !userId });

  return (
    <Sheet open={!!userId} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{data?.user.name ?? ""}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data ? (
            <>
              <div>
                <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
                  {t("managementChain")}
                </p>
                {data.managementChain.length === 0 ? (
                  <p className="mt-2 text-sm text-text-tertiary">{t("noManager")}</p>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {data.managementChain.map((person, i) => (
                      <span key={person.id} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight className="size-3.5 text-text-tertiary" />}
                        <span className="rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-1 text-xs text-text-primary">
                          {person.name}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
                  {t("directReports")}
                </p>
                {data.directReports.length === 0 ? (
                  <p className="mt-2 text-sm text-text-tertiary">{t("noDirectReports")}</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {data.directReports.map((person) => (
                      <div
                        key={person.id}
                        className="rounded-lg bg-surface-elevated px-3 py-1.5 text-sm text-text-primary"
                      >
                        {person.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OrgChartTab() {
  const t = useTranslations("pages.settingsOrganization.orgChart");
  const { data, isLoading } = useGetOrgChartQuery();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const isEmpty =
    !data || (data.departments.length === 0 && data.unassignedEmployees.length === 0);

  if (isEmpty) {
    return <EmptyState icon={Network} title={t("empty")} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {data.departments.map((node) => (
          <DepartmentNode key={node.id} node={node} depth={0} onSelectUser={setSelectedUserId} />
        ))}
      </div>

      {data.unassignedEmployees.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface/50 p-4">
          <p className="text-sm font-semibold text-text-primary">{t("unassigned")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.unassignedEmployees.map((employee) => (
              <PersonChip key={employee.id} person={employee} onClick={setSelectedUserId} />
            ))}
          </div>
        </div>
      )}

      <UserDetailSheet userId={selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)} />
    </div>
  );
}
