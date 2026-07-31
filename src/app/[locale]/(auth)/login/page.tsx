"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { AuthBrand } from "@/components/layout/auth-brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useRouter } from "@/i18n/navigation";
import { createLoginSchema, type LoginFormValues } from "@/lib/schemas/auth.schema";
import { useLoginMutation } from "@/lib/api/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(
      createLoginSchema({
        invalidEmail: tValidation("invalidEmail"),
        required: tValidation("required"),
      })
    ),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials(result));
      router.push("/dashboard");
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(
        status === 401 ? t("invalidCredentials") : tCommon("error.generic")
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthBrand />

      <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-2xl shadow-black/20">
        <h2 className="text-xl font-semibold text-text-primary">{t("title")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                className={cn(
                  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
                  errors.email && "border-danger/60"
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
                {t("passwordLabel")}
              </label>
              <span className="cursor-not-allowed text-xs text-accent-secondary/60">
                {t("forgotPassword")}
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-10 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
                  errors.password && "border-danger/60"
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <Checkbox />
            {t("remember")}
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent-gradient flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {t("submit")}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-[10px] font-medium tracking-widest text-text-tertiary uppercase">
              {t("orDivider")}
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <KeyRound className="size-4" />
              {t("sso")}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <Fingerprint className="size-4" />
              {t("biometric")}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-accent-secondary hover:underline">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
