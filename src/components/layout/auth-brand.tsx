import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";

export function AuthBrand() {
  const t = useTranslations("brand");

  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="bg-accent-gradient glow-accent mb-4 flex size-14 items-center justify-center rounded-2xl text-white">
        <Layers className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold text-text-primary">{t("name")}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t("tagline")}</p>
    </div>
  );
}
