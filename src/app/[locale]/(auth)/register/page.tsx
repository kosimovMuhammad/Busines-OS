"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { AuthBrand } from "@/components/layout/auth-brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createRegisterSchema,
  type RegisterFormValues,
} from "@/lib/schemas/auth.schema";
import { useRegisterMutation } from "@/lib/api/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(
      createRegisterSchema({
        invalidEmail: tValidation("invalidEmail"),
        required: tValidation("required"),
        companyNameMin: tValidation("companyNameMin"),
        nameMin: tValidation("nameMin"),
        passwordMin: tValidation("passwordMin"),
        agreeToTerms: tValidation("agreeToTerms"),
      })
    ),
    defaultValues: { agreeToTerms: false },
  });

  const password = watch("password") ?? "";
  const strength = Math.min(4, Math.floor(password.length / 3));

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerUser({
        companyName: values.companyName,
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();
      dispatch(setCredentials(result));
      router.push("/dashboard");
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(
        status === 409 ? t("emailTaken") : tCommon("error.generic")
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthBrand />

      <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-2xl shadow-black/20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{t("title")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                className={cn(
                  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
                  errors.companyName && "border-danger/60"
                )}
                {...register("companyName")}
              />
            </div>
            {errors.companyName && (
              <p className="text-xs text-danger">{errors.companyName.message}</p>
            )}
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
                className={cn(
                  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
                  errors.name && "border-danger/60"
                )}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
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
            <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            {errors.password ? (
              <p className="text-xs text-danger">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-text-tertiary">{t("passwordHint")}</p>
            )}
          </div>

          <div>
            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
                  <Checkbox
                    className="mt-0.5"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
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
              )}
            />
            {errors.agreeToTerms && (
              <p className="mt-1 text-xs text-danger">{errors.agreeToTerms.message}</p>
            )}
          </div>

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
