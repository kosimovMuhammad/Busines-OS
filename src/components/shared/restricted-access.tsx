import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function RestrictedAccess() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface/50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
        <Lock className="size-5" />
      </div>
      <p className="text-sm text-text-secondary">{t("restrictedAccess")}</p>
    </div>
  );
}
