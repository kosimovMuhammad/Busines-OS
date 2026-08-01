"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/types/api";

export function CalendarMonthGrid({
  month,
  onMonthChange,
  meetings,
  onDayClick,
  onMeetingClick,
}: {
  month: Date;
  onMonthChange: (date: Date) => void;
  meetings: Meeting[];
  onDayClick: (date: Date) => void;
  onMeetingClick: (meeting: Meeting) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("pages.calendar");

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    weekdayFormatter.format(new Date(2024, 0, 1 + i))
  );

  const meetingsByDay = (day: Date) =>
    meetings.filter((m) => isSameDay(new Date(m.startAt), day));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary capitalize">
          {monthFormatter.format(month)}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={t("previousMonth")}
            onClick={() => onMonthChange(subMonths(month, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onMonthChange(new Date())}>
            {t("today")}
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={t("nextMonth")}
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border-subtle">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="bg-surface-elevated px-2 py-1.5 text-center text-xs font-medium text-text-tertiary capitalize"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dayMeetings = meetingsByDay(day);
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => e.key === "Enter" && onDayClick(day)}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col items-start gap-1 bg-surface p-1.5 text-left transition-colors hover:bg-surface-elevated",
                !inMonth && "opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  isToday ? "bg-accent-primary text-white" : "text-text-secondary"
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex w-full flex-col gap-0.5">
                {dayMeetings.slice(0, 3).map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick(m);
                    }}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-left text-[11px] transition-colors",
                      m.status === "CANCELLED"
                        ? "bg-surface-elevated text-text-tertiary line-through"
                        : "bg-accent-secondary/10 text-accent-secondary hover:bg-accent-secondary/20"
                    )}
                  >
                    {format(new Date(m.startAt), "HH:mm")} {m.title}
                  </button>
                ))}
                {dayMeetings.length > 3 && (
                  <span className="text-[11px] text-text-tertiary">
                    +{dayMeetings.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
