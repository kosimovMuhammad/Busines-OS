import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { TasksContent } from "@/components/tasks/tasks-content";

export default async function TasksPage() {
  const t = await getTranslations("pages.tasks");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TasksContent />
    </>
  );
}
