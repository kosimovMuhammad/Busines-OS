"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Laptop, Loader2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useGetSessionsQuery,
  useLogoutAllSessionsMutation,
  useRevokeSessionMutation,
} from "@/lib/api/sessions.api";

export function SessionsTab() {
  const t = useTranslations("pages.settingsSecurity.sessions");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const { data: sessions, isLoading } = useGetSessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [logoutAll, { isLoading: isLoggingOutAll }] = useLogoutAllSessionsMutation();

  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const otherSessionsCount = (sessions ?? []).filter((s) => !s.isCurrent).length;

  const handleLogoutAll = async () => {
    try {
      await logoutAll().unwrap();
      setConfirmLogoutAll(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      {otherSessionsCount > 0 && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => setConfirmLogoutAll(true)}>
            <LogOut className="size-3.5" />
            {t("logoutAll")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState icon={Laptop} title={t("empty")} />
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                  <Laptop className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {session.deviceInfo ?? t("unknownDevice")}
                    </p>
                    {session.isCurrent && <Badge>{t("thisDevice")}</Badge>}
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {session.ipAddress ?? "—"} · {t("createdAt", { date: formatter.format(new Date(session.createdAt)) })}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => revokeSession(session.id)}
                  disabled={isRevoking}
                >
                  {t("revoke")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={confirmLogoutAll} onOpenChange={setConfirmLogoutAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("logoutAllDialog.title")}</DialogTitle>
            <DialogDescription>{t("logoutAllDialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("logoutAllDialog.cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleLogoutAll} disabled={isLoggingOutAll}>
              {isLoggingOutAll && <Loader2 className="size-4 animate-spin" />}
              {t("logoutAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
