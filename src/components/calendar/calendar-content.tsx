"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useGetMeetingsQuery } from "@/lib/api/calendar.api";
import { CalendarFilters } from "./calendar-filters";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { MeetingFormSheet } from "./meeting-form-sheet";
import { DeleteMeetingDialog } from "./delete-meeting-dialog";
import { GoogleCalendarCard } from "./google-calendar-card";
import type { Meeting } from "@/types/api";

export function CalendarContent() {
  const [month, setMonth] = useState(() => new Date());
  const [contactId, setContactId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [defaultStartAt, setDefaultStartAt] = useState<Date | undefined>();
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const { data: meetings } = useGetMeetingsQuery({
    from: gridStart.toISOString(),
    to: gridEnd.toISOString(),
    contactId: contactId || undefined,
    organizerId: organizerId || undefined,
  });

  return (
    <div className="space-y-4">
      <GoogleCalendarCard />

      <CalendarFilters
        contactId={contactId}
        onContactIdChange={setContactId}
        organizerId={organizerId}
        onOrganizerIdChange={setOrganizerId}
        onCreate={() => {
          setEditingMeeting(null);
          setDefaultStartAt(undefined);
          setSheetOpen(true);
        }}
      />

      <CalendarMonthGrid
        month={month}
        onMonthChange={setMonth}
        meetings={meetings ?? []}
        onDayClick={(day) => {
          setEditingMeeting(null);
          setDefaultStartAt(day);
          setSheetOpen(true);
        }}
        onMeetingClick={(meeting) => {
          setEditingMeeting(meeting);
          setSheetOpen(true);
        }}
      />

      <MeetingFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        meeting={editingMeeting}
        defaultStartAt={defaultStartAt}
        onDelete={
          editingMeeting
            ? () => {
                setDeletingMeeting(editingMeeting);
                setSheetOpen(false);
              }
            : undefined
        }
      />

      <DeleteMeetingDialog
        meeting={deletingMeeting}
        onOpenChange={(open) => !open && setDeletingMeeting(null)}
      />
    </div>
  );
}
