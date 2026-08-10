import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ForbiddenPage() {
  const t = await getTranslations("pages.forbidden");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-danger/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 size-[480px] rounded-full bg-accent-primary/20 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border-subtle bg-surface p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">{t("title")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("subtitle")}</p>

        <Link
          href="/dashboard"
          className="bg-accent-gradient mt-8 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
