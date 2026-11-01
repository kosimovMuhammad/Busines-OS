"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CircleCheck,
  Clock,
  Handshake,
  MessageCircle,
  MessageSquare,
  Receipt,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/i18n/navigation";
import {
  UNREAD_NOTIFICATION_COUNT_POLLING_INTERVAL_MS,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveNotificationMutation,
} from "@/lib/api/notifications.api";
import type { Notification } from "@/types/api";
import type { NotificationType } from "@/types/enums";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  DealAssigned: Handshake,
  DealStageChanged: TrendingUp,
  TaskAssigned: CircleCheck,
  TaskDue: Clock,
  TaskOverdue: AlertTriangle,
  MentionInComment: MessageSquare,
  LeadAssigned: UserPlus,
  PaymentReceived: Receipt,
  InviteAccepted: UserCheck,
  RoleChanged: ShieldCheck,
  NewMessage: MessageCircle,
};

// relatedEntityType strings come from the backend; only entities with a real
// detail route are mapped. Tasks have no dedicated route (they open from a
// sheet on the list page - see tasks-content.tsx), so a Task notification
// falls back to the list rather than a broken deep link.
const ENTITY_ROUTE: Record<string, (id: string) => string> = {
  Deal: (id) => `/deals/${id}`,
  Contact: (id) => `/contacts/${id}`,
  Invoice: (id) => `/invoices/${id}`,
  Task: () => "/tasks",
};

export function NotificationsPanel() {
  const t = useTranslations("topbar.notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: unread } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: UNREAD_NOTIFICATION_COUNT_POLLING_INTERVAL_MS,
  });
  const { data, isLoading } = useGetNotificationsQuery({ limit: 10 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [removeNotification] = useRemoveNotificationMutation();

  const count = unread?.count ?? 0;
  const countLabel = count > 9 ? "9+" : String(count);

  const handleOpenNotification = (notification: Notification) => {
    if (!notification.isRead) markRead(notification.id);
    const route =
      notification.relatedEntityType && notification.relatedEntityId
        ? ENTITY_ROUTE[notification.relatedEntityType]?.(notification.relatedEntityId)
        : undefined;
    setOpen(false);
    if (route) router.push(route);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-none font-semibold text-white">
            {countLabel}
          </span>
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
            data.data.map((notification) => {
              const Icon = TYPE_ICON[notification.type] ?? Bell;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex w-full gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated",
                    !notification.isRead && "bg-surface-elevated/60"
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-start gap-2.5 text-left focus:outline-none"
                    onClick={() => handleOpenNotification(notification)}
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="size-1.5 shrink-0 rounded-full bg-accent-primary" />
                        )}
                        <p className="truncate text-sm font-medium text-text-primary pr-6">
                          {notification.title}
                        </p>
                      </div>
                      {notification.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-text-tertiary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="absolute top-3 right-3 hidden rounded p-1 text-text-tertiary hover:bg-surface hover:text-text-primary group-hover:flex"
                    aria-label={t("delete")}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center border-t border-border-subtle px-4 py-2.5 text-xs font-medium text-accent-primary hover:underline"
        >
          {t("viewAll")}
        </Link>
      </PopoverContent>
    </Popover>
  );
}
