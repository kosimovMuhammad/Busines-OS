"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthBrand } from "@/components/layout/auth-brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const strength = Math.min(4, Math.floor(password.length / 3));

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthBrand />

      <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-2xl shadow-black/20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{t("title")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
        </div>

        <form className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
              {t("companyNameLabel")}
            </label>
            <div className="relative">
              <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                autoComplete="organization"
                placeholder={t("companyNamePlaceholder")}
                className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
              {t("fullNameLabel")}
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                autoComplete="name"
                placeholder={t("fullNamePlaceholder")}
                className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-10 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < strength ? "bg-accent-primary" : "bg-border-subtle"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-text-tertiary">{t("passwordHint")}</p>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
            <Checkbox className="mt-0.5" />
            <span>
              {t.rich("terms", {
                terms: (chunks) => (
                  <span className="text-accent-secondary hover:underline">{chunks}</span>
                ),
                privacy: (chunks) => (
                  <span className="text-accent-secondary hover:underline">{chunks}</span>
                ),
              })}
            </span>
          </label>

          <button
            type="submit"
            className="bg-accent-gradient flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("submit")}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-accent-secondary hover:underline">
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
