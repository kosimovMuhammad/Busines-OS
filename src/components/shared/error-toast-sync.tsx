"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { setErrorMessages } from "@/lib/errorMessages";

export function ErrorToastSync() {
  const t = useTranslations("common.error");

  useEffect(() => {
    setErrorMessages({
      generic: t("generic"),
      conflict: t("conflict"),
      forbidden: t("forbidden"),
      aiUnavailable: t("aiUnavailable"),
      aiPlanRequired: t("aiPlanRequired"),
      integrationUnavailable: t("integrationUnavailable"),
    });
  }, [t]);

  return null;
}
