"use client";

import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/lib/api/users.api";

export function PasswordNudgeBanner() {
  const t = useTranslations("common.passwordNudge");
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });

  if (!me || me.hasPassword) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <KeyRound className="size-4 shrink-0" />
      <p className="flex-1">{t("message")}</p>
      <Link
        href="/profile"
        className="shrink-0 font-medium underline-offset-2 hover:underline"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
