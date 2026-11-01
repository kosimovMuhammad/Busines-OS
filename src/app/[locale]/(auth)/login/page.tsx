"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
} from "lucide-react";
import { AuthBrand } from "@/components/layout/auth-brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createLoginUnifiedSchema,
  type LoginUnifiedFormValues,
} from "@/lib/schemas/auth.schema";
import { useLoginMutation, useLoginWithCodeMutation, useResendInviteCodeMutation } from "@/lib/api/auth.api";
import { baseApi } from "@/lib/api/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_SEC = 45;
const CODE_PATTERN = /^\d{6}$/;

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <AuthBrand />

      <div className="rounded-xl border border-border-subtle bg-surface p-8">
        <h2 className="text-xl font-semibold text-text-primary">{t("title")}</h2>
        <p className="mt-1 text-[14px] text-text-tertiary">{t("subtitle")}</p>

        <div className="mt-6">
          <LoginForm />
        </div>

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

function LoginForm() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [showSecret, setShowSecret] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginWithCode, { isLoading: isVerifyingCode }] = useLoginWithCodeMutation();
  const [resendInviteCode, { isLoading: isSendingCode }] = useResendInviteCodeMutation();
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<LoginUnifiedFormValues>({
    resolver: zodResolver(
      createLoginUnifiedSchema({
        invalidEmail: tValidation("invalidEmail"),
        required: tValidation("required"),
      })
    ),
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SEC);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (values: LoginUnifiedFormValues) => {
    const secret = values.secret.trim();
    try {
      const result = CODE_PATTERN.test(secret)
        ? await loginWithCode({ email: values.email, code: secret }).unwrap()
        : await login({ email: values.email, password: secret }).unwrap();
      dispatch(baseApi.util.resetApiState());
      dispatch(setCredentials(result));
      router.push("/dashboard");
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 401 ? t("invalidCredentials") : tCommon("error.generic"));
    }
  };

  const onSendCode = async () => {
    const valid = await trigger("email");
    if (!valid) return;
    try {
      await resendInviteCode({ email: getValues("email") }).unwrap();
      toast.success(t("resendSuccess"));
      setCodeSent(true);
      startCooldown();
    } catch {
      toast.error(tCommon("error.generic"));
    }
  };

  const isLoading = isLoggingIn || isVerifyingCode;

  return (
    <form method="POST" className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
            {t("secretLabel")}
          </label>
          <span className="cursor-not-allowed text-xs text-accent-secondary/60">
            {t("forgotPassword")}
          </span>
        </div>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showSecret ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("secretPlaceholder")}
            className={cn(
              "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-10 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
              errors.secret && "border-danger/60"
            )}
            {...register("secret")}
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
          >
            {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.secret && <p className="text-xs text-danger">{errors.secret.message}</p>}

        <button
          type="button"
          onClick={onSendCode}
          disabled={isSendingCode || cooldown > 0}
          className="flex items-center gap-1.5 text-xs text-accent-secondary hover:underline disabled:cursor-not-allowed disabled:text-text-tertiary disabled:no-underline"
        >
          <RefreshCw className={cn("size-3", isSendingCode && "animate-spin")} />
          {cooldown > 0
            ? t("resendCodeCooldown", { seconds: cooldown })
            : codeSent
              ? t("resendCode")
              : t("sendCode")}
        </button>
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
    </form>
  );
}
