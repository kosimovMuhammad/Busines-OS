import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarContent } from "@/components/calendar/calendar-content";

export default async function CalendarPage() {
  const t = await getTranslations("pages.calendar");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <CalendarContent />
    </>
  );
}
