"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser as setAuthUser } from "@/store/authSlice";
import {
  usersApi,
  useChangePasswordMutation,
  useConfirmEmailChangeMutation,
  useGetMeQuery,
  useRequestEmailChangeMutation,
  useSetPasswordMutation,
  useUpdateUserMutation,
} from "@/lib/api/users.api";
import { EditPhotoDialog } from "@/components/settings/edit-photo-dialog";
import {
  createChangePasswordSchema,
  createEmailChangeSchema,
  createSetPasswordSchema,
  createVerifyCodeSchema,
  type ChangePasswordFormValues,
  type EmailChangeFormValues,
  type SetPasswordFormValues,
  type VerifyCodeFormValues,
} from "@/lib/schemas/auth.schema";
import { cn, initials } from "@/lib/utils";
import type { ProfileMediaTarget, User } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-10 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const inputClassLeftIcon =
  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function ProfileSettingsContent() {
  const t = useTranslations("pages.settingsProfile");
  const user = useAppSelector((s) => s.auth.user);
  const { data: me, isLoading } = useGetMeQuery();

  const hasPassword = me?.hasPassword ?? user?.hasPassword ?? false;
  const current = me ?? user;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="max-w-2xl flex-1 space-y-6">
        {current && <ProfilePhotoCard user={current} />}
        {current && <AccountDetailsCard user={current} />}

        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-text-tertiary" />
            <h3 className="text-sm font-semibold text-text-primary">{t("passwordTitle")}</h3>
          </div>

          {isLoading ? (
            <Skeleton className="mt-4 h-40 w-full" />
          ) : hasPassword ? (
            <ChangePasswordForm />
          ) : (
            <SetPasswordForm />
          )}
        </div>
      </div>

      <aside className="hidden w-full max-w-xs shrink-0 space-y-4 lg:sticky lg:top-6 lg:block">
        <PlanPromoCard />
        <SecurityTipCard />
      </aside>
    </div>
  );
}

function PlanPromoCard() {
  const t = useTranslations("pages.settingsProfile");

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-accent-primary/15 via-surface to-accent-secondary/10 p-5">
      <div className="flex size-9 items-center justify-center rounded-full bg-accent-primary/15 text-accent-primary">
        <Sparkles className="size-[18px]" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("promoTitle")}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{t("promoBody")}</p>
      <Link
        href="/settings/plan"
        className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full")}
      >
        {t("promoCta")}
      </Link>
    </div>
  );
}

function SecurityTipCard() {
  const t = useTranslations("pages.settingsProfile");

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-accent-secondary" />
        <h3 className="text-sm font-semibold text-text-primary">{t("tipsTitle")}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{t("tipsBody")}</p>
    </div>
  );
}

function ProfilePhotoCard({ user }: { user: User }) {
  const t = useTranslations("pages.settingsProfile");
  const [editingTarget, setEditingTarget] = useState<ProfileMediaTarget | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface">
      <div className="relative h-36 w-full bg-surface-elevated">
        {user.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.coverUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="size-full bg-gradient-to-br from-accent-primary/20 via-surface-elevated to-accent-secondary/10" />
        )}

        <button
          type="button"
          onClick={() => setEditingTarget("Cover")}
          aria-label={t("changeCover")}
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100 focus-visible:bg-black/40 focus-visible:opacity-100 focus-visible:outline-none"
        >
          <Camera className="size-5" />
        </button>

        <div className="absolute -bottom-9 left-4">
          <div className="group relative">
            <Avatar className="size-[72px] border-4 border-surface">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="text-base">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => setEditingTarget("Avatar")}
              aria-label={t("changeAvatar")}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100 focus-visible:bg-black/40 focus-visible:opacity-100 focus-visible:outline-none"
            >
              <Camera className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-12 pb-4">
        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">{t("photoHint")}</p>
      </div>

      <EditPhotoDialog
        target={editingTarget ?? "Avatar"}
        open={editingTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTarget(null);
        }}
        imageUrl={editingTarget === "Cover" ? user.coverUrl : user.avatarUrl}
        userName={user.name}
      />
    </div>
  );
}

function AccountDetailsCard({ user }: { user: User }) {
  const t = useTranslations("pages.settingsProfile");

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary">{t("accountTitle")}</h3>
      <div className="mt-4 space-y-5">
        <NameField user={user} />
        <EmailChangeField user={user} />
      </div>
    </div>
  );
}

function NameField({ user }: { user: User }) {
  const t = useTranslations("pages.settingsProfile");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const cancel = () => {
    setName(user.name);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      cancel();
      return;
    }
    try {
      const result = await updateUser({ id: user.id, body: { name: trimmed } }).unwrap();
      dispatch(usersApi.util.upsertQueryData("getMe", undefined, result));
      dispatch(setAuthUser(result));
      toast.success(t("nameSaved"));
      setIsEditing(false);
    } catch {
      toast.error(tCommon("error.generic"));
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-text-tertiary uppercase">{t("name")}</label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-9"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") cancel();
            }}
          />
          <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {t("save")}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex w-full items-center justify-between gap-2 py-1 text-left text-sm text-text-primary transition-colors hover:text-accent-secondary"
        >
          <span>{user.name}</span>
          <Pencil className="size-3.5 shrink-0 text-text-tertiary" />
        </button>
      )}
    </div>
  );
}

type EmailStep = "idle" | "editing" | "codeSent";

function EmailChangeField({ user }: { user: User }) {
  const t = useTranslations("pages.settingsProfile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [step, setStep] = useState<EmailStep>("idle");
  const [pendingEmail, setPendingEmail] = useState("");
  const [requestEmailChange, { isLoading: isRequesting }] = useRequestEmailChangeMutation();
  const [confirmEmailChange, { isLoading: isConfirming }] = useConfirmEmailChangeMutation();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmailForm,
    formState: { errors: emailErrors },
  } = useForm<EmailChangeFormValues>({
    resolver: zodResolver(createEmailChangeSchema({ invalidEmail: tValidation("invalidEmail") })),
    defaultValues: { newEmail: user.email },
  });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    reset: resetCodeForm,
    formState: { errors: codeErrors },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(createVerifyCodeSchema({ required: tValidation("required") })),
  });

  const backToIdle = () => {
    setStep("idle");
    resetEmailForm({ newEmail: user.email });
    resetCodeForm({ code: "" });
  };

  const onRequestSubmit = async (values: EmailChangeFormValues) => {
    try {
      await requestEmailChange({ newEmail: values.newEmail }).unwrap();
      setPendingEmail(values.newEmail);
      setStep("codeSent");
      toast.success(t("emailCodeSentToast"));
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 409 ? t("emailTaken") : tCommon("error.generic"));
    }
  };

  const onConfirmSubmit = async (values: VerifyCodeFormValues) => {
    try {
      await confirmEmailChange({ code: values.code }).unwrap();
      toast.success(t("emailChangeSuccess", { email: pendingEmail }));
      backToIdle();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(
        status === 401 || status === 400 ? t("invalidEmailCode") : tCommon("error.generic")
      );
    }
  };

  const onResend = async () => {
    try {
      await requestEmailChange({ newEmail: pendingEmail }).unwrap();
      toast.success(t("resendSuccess"));
    } catch {
      toast.error(tCommon("error.generic"));
    }
  };

  if (step === "idle") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">{t("email")}</label>
        <button
          type="button"
          onClick={() => setStep("editing")}
          className="flex w-full items-center justify-between gap-2 py-1 text-left text-sm text-text-primary transition-colors hover:text-accent-secondary"
        >
          <span>{user.email}</span>
          <Pencil className="size-3.5 shrink-0 text-text-tertiary" />
        </button>
      </div>
    );
  }

  if (step === "editing") {
    return (
      <form onSubmit={handleEmailSubmit(onRequestSubmit)} className="space-y-1.5" noValidate>
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("newEmailLabel")}
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="email"
              autoComplete="email"
              placeholder={t("newEmailPlaceholder")}
              className={cn(inputClassLeftIcon, emailErrors.newEmail && "border-danger/60")}
              {...registerEmail("newEmail")}
            />
          </div>
          <Button type="submit" size="sm" disabled={isRequesting}>
            {isRequesting && <Loader2 className="size-3.5 animate-spin" />}
            {t("verifyEmailButton")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={backToIdle}>
            {t("cancelEmailChange")}
          </Button>
        </div>
        {emailErrors.newEmail && (
          <p className="text-xs text-danger">{emailErrors.newEmail.message}</p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleCodeSubmit(onConfirmSubmit)}
      className="space-y-2 rounded-xl border border-border-subtle bg-background p-3"
      noValidate
    >
      <p className="text-xs text-text-secondary">
        {t("emailCodeSentSubtitle", { email: pendingEmail })}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("emailCodePlaceholder")}
          className={cn(
            "w-32 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-center text-base tracking-[0.4em] text-text-primary placeholder:tracking-normal placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none",
            codeErrors.code && "border-danger/60"
          )}
          {...registerCode("code")}
        />
        <Button type="submit" size="sm" disabled={isConfirming}>
          {isConfirming && <Loader2 className="size-3.5 animate-spin" />}
          {t("confirmEmailChange")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={backToIdle}>
          {t("cancelEmailChange")}
        </Button>
      </div>
      {codeErrors.code && <p className="text-xs text-danger">{codeErrors.code.message}</p>}
      <button
        type="button"
        onClick={onResend}
        className="flex items-center gap-1.5 text-xs text-accent-secondary hover:underline"
      >
        <RefreshCw className="size-3" />
        {t("resendCode")}
      </button>
    </form>
  );
}

function SetPasswordForm() {
  const t = useTranslations("pages.settingsProfile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const [setPassword, { isLoading }] = useSetPasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(
      createSetPasswordSchema({
        passwordMin: tValidation("passwordMin"),
        passwordMismatch: tValidation("passwordMismatch"),
      })
    ),
  });

  const onSubmit = async (values: SetPasswordFormValues) => {
    try {
      await setPassword({ newPassword: values.newPassword }).unwrap();
      toast.success(t("setSuccess"));
      reset();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 409 ? t("alreadySet") : tCommon("error.generic"));
    }
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-xs text-text-tertiary">{t("setHint")}</p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("newPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(inputClass, errors.newPassword && "border-danger/60")}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-danger">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(inputClass, errors.confirmPassword && "border-danger/60")}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {t("setSubmit")}
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const t = useTranslations("pages.settingsProfile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      createChangePasswordSchema({
        required: tValidation("required"),
        passwordMin: tValidation("passwordMin"),
        passwordMismatch: tValidation("passwordMismatch"),
      })
    ),
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success(t("changeSuccess"));
      reset();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 401 ? t("wrongCurrentPassword") : tCommon("error.generic"));
    }
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <ShieldCheck className="size-3.5 text-accent-secondary" />
        {t("changeHint")}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("currentPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(inputClass, errors.currentPassword && "border-danger/60")}
            {...register("currentPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-danger">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("newPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(inputClass, errors.newPassword && "border-danger/60")}
            {...register("newPassword")}
          />
        </div>
        {errors.newPassword && <p className="text-xs text-danger">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(inputClass, errors.confirmPassword && "border-danger/60")}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {t("changeSubmit")}
      </Button>
    </form>
  );
}
