"use client";

import { useLocale, useTranslations } from "next-intl";
import { Bell, BellOff, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/api/notifications.api";

export function NotificationsPanel() {
  const t = useTranslations("topbar.notifications");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" });

  const { data: unread } = useGetUnreadNotificationCountQuery();
  const { data, isLoading } = useGetNotificationsQuery({ limit: 10 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const count = unread?.count ?? 0;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          />
        }
      >
        <Bell className="size-[18px]" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2 items-center justify-center rounded-full bg-danger" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <p className="text-sm font-semibold text-text-primary">{t("title")}</p>
          {count > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-1 text-xs text-accent-primary hover:underline disabled:opacity-50"
            >
              <Check className="size-3" />
              {t("markAllRead")}
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <BellOff className="size-5 text-text-tertiary" />
              <p className="text-sm text-text-tertiary">{t("empty")}</p>
            </div>
          ) : (
            data.data.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => !notification.isRead && markRead(notification.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated",
                  !notification.isRead && "bg-surface-elevated/60"
                )}
              >
                <div className="flex items-center gap-2">
                  {!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-accent-primary" />}
                  <p className="truncate text-sm font-medium text-text-primary">{notification.title}</p>
                </div>
                {notification.body && (
                  <p className="line-clamp-2 text-xs text-text-secondary">{notification.body}</p>
                )}
                <p className="text-[11px] text-text-tertiary">
                  {formatter.format(new Date(notification.createdAt))}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
