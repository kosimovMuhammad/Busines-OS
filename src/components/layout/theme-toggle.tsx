"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("topbar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only mount flag: server and first client render must match
    // (theme is unknown on the server), so the real icon appears one tick later.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? t("themeToggleLight") : t("themeToggleDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 rounded-full text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
    >
      {mounted && (isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />)}
    </Button>
  );
}
