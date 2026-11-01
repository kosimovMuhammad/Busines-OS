"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/lib/api/notificationPreferences.api";
import type { NotificationChannel, NotificationType } from "@/types/enums";

const TYPES: NotificationType[] = [
  "DealAssigned",
  "TaskAssigned",
  "TaskDue",
  "TaskOverdue",
  "MentionInComment",
  "LeadAssigned",
  "PaymentReceived",
  "InviteAccepted",
  "RoleChanged",
  "DealStageChanged",
  "NewMessage",
];

const CHANNELS: NotificationChannel[] = ["InApp", "Email", "WhatsApp"];

export function NotificationPreferencesContent() {
  const t = useTranslations("pages.settingsNotifications");
  const tType = useTranslations("enums.notificationType");
  const tChannel = useTranslations("enums.notificationChannel");

  const { data: preferences, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  if (isLoading || !preferences) {
    return <Skeleton className="h-96 w-full" />;
  }

  const toggle = (type: NotificationType, channel: NotificationChannel, enabled: boolean) => {
    const next = preferences.map((p) =>
      p.type === type && p.channel === channel ? { ...p, enabled } : p
    );
    updatePreferences({ preferences: next });
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead>{t("columnType")}</TableHead>
            {CHANNELS.map((channel) => (
              <TableHead key={channel} className="text-center">
                {tChannel(channel)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {TYPES.map((type) => (
            <TableRow key={type} className="border-border-subtle">
              <TableCell className="text-sm font-medium text-text-primary">{tType(type)}</TableCell>
              {CHANNELS.map((channel) => {
                const item = preferences.find((p) => p.type === type && p.channel === channel);
                return (
                  <TableCell key={channel} className="text-center">
                    <Switch
                      checked={item?.enabled ?? false}
                      onCheckedChange={(checked) => toggle(type, channel, checked === true)}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
