"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Check, Languages, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const LOCALE_LABELS: Record<AppLocale, string> = {
  ru: "Русский",
  tj: "Тоҷикӣ",
  en: "English",
};

export function PreferencesSettingsContent() {
  return (
    <div className="max-w-lg space-y-6">
      <LanguageCard />
      <ThemeCard />
    </div>
  );
}

function LanguageCard() {
  const t = useTranslations("pages.settingsPreferences");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-center gap-2">
        <Languages className="size-4 text-text-tertiary" />
        <h3 className="text-sm font-semibold text-text-primary">{t("language")}</h3>
      </div>

      <div className="mt-4 space-y-1">
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors",
              l === locale
                ? "bg-surface-elevated text-text-primary"
                : "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
            )}
          >
            {LOCALE_LABELS[l]}
            {l === locale && <Check className="size-4 text-accent-secondary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemeCard() {
  const t = useTranslations("pages.settingsPreferences");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-center gap-2">
        {isDark ? (
          <Moon className="size-4 text-text-tertiary" />
        ) : (
          <Sun className="size-4 text-text-tertiary" />
        )}
        <h3 className="text-sm font-semibold text-text-primary">{t("theme")}</h3>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-elevated px-3.5 py-2.5">
        <span className="text-sm text-text-primary">
          {isDark ? t("themeDark") : t("themeLight")}
        </span>
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
    </div>
  );
}
