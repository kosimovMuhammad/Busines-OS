import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";

export function AuthBrand() {
  const t = useTranslations("brand");

  return (
    <div className="mb-0 flex  justify-center items-center gap-3 mb-3 text-center">
      <div className="bg-accent-gradient glow-accent mb-1  flex size-10 items-center justify-center rounded-xl text-white">
        <Layers className="size-5" />
      </div>
      <div className="flex flex-col  w-36 text-start gap-0 ">
        <h1 className="text-xl font-semibold text-text-primary">{t("name")}</h1>
        <p className=" text-[12px] text-text-secondary">{t("tagline")}</p>
      </div>
    </div>
  );
}
