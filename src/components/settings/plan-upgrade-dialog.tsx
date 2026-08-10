"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, CreditCard, Loader2, LockKeyhole } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  subscriptionApi,
  useGetSubscriptionPlansQuery,
} from "@/lib/api/subscription.api";
import { useAppDispatch } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";
import type { BillingCycle } from "@/types/enums";
import type { SubscriptionPlan } from "@/types/api";

const BILLING_CYCLES: BillingCycle[] = ["Monthly", "Yearly"];

const KNOWN_FEATURE_KEYS = [
  "whatsapp_integration",
  "email_integration",
  "ai_features",
  "advanced_analytics",
  "custom_branding",
  "api_access",
  "max_users",
  "max_contacts",
  "max_deals",
  "storage_mb",
  "automation_workflows",
];

type Step = "plans" | "payment" | "success";

type CardErrors = Partial<Record<"cardName" | "cardNumber" | "expiry" | "cvc", string>>;

type SuccessData = {
  planName: string;
  amount: number;
  currency: string;
  last4: string;
  transactionId: string;
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  currentPlanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId: string;
}) {
  const t = useTranslations("pages.settingsPlan.upgradeDialog");
  const tCycle = useTranslations("enums.billingCycle");
  const tFeature = useTranslations("pages.settingsPlan.featureKey");
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const featureLabel = (key: string) =>
    KNOWN_FEATURE_KEYS.includes(key) ? tFeature(key) : key;

  const { data: plans, isLoading } = useGetSubscriptionPlansQuery();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<CardErrors>({});

  const resetCheckout = () => {
    setStep("plans");
    setSelectedPlan(null);
    setSuccessData(null);
    setIsProcessing(false);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetCheckout();
    onOpenChange(next);
  };

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handleBackToPlans = () => {
    setStep("plans");
    setSelectedPlan(null);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setErrors({});
  };

  const validateCard = () => {
    const next: CardErrors = {};
    if (!cardName.trim()) next.cardName = t("checkout.errorRequired");
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length !== 16) next.cardNumber = t("checkout.errorCardNumber");
    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiryMatch) {
      next.expiry = t("checkout.errorExpiry");
    } else {
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      const now = new Date();
      const expiryDate = new Date(year, month, 0, 23, 59, 59);
      if (month < 1 || month > 12 || expiryDate < now) {
        next.expiry = t("checkout.errorExpiry");
      }
    }
    if (!/^\d{3,4}$/.test(cvc)) next.cvc = t("checkout.errorCvc");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !validateCard()) return;

    setIsProcessing(true);
    const digits = cardNumber.replace(/\D/g, "");
    const amount = billingCycle === "Monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;

    window.setTimeout(() => {
      const periodDays = billingCycle === "Monthly" ? 30 : 365;
      dispatch(
        subscriptionApi.util.updateQueryData("getSubscription", undefined, (draft) => {
          draft.planId = selectedPlan.id;
          draft.planName = selectedPlan.name;
          draft.billingCycle = billingCycle;
          draft.status = "Active";
          draft.pendingPlanId = null;
          draft.cancelAtPeriodEnd = false;
          draft.trialEndsAt = null;
          draft.currentPeriodStart = new Date().toISOString();
          draft.currentPeriodEnd = new Date(
            Date.now() + periodDays * 24 * 60 * 60 * 1000
          ).toISOString();
        })
      );

      setSuccessData({
        planName: selectedPlan.name,
        amount,
        currency: selectedPlan.currency,
        last4: digits.slice(-4),
        transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
      });
      setIsProcessing(false);
      setStep("success");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {step === "payment" ? t("checkout.title") : step === "success" ? t("checkout.successTitle") : t("title")}
          </DialogTitle>
        </DialogHeader>

        {step === "success" && successData ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 space-y-2">
              <div className="flex items-center gap-2 text-success">
                <Check className="size-4 shrink-0" />
                <p className="text-sm font-medium text-text-primary">
                  {t("checkout.successMessage", { plan: successData.planName })}
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                {t("amount")}: {formatCurrency(successData.amount, successData.currency, locale)}
              </p>
              <p className="text-sm text-text-tertiary">
                {t("checkout.cardEnding", { last4: successData.last4 })}
              </p>
              <p className="text-xs text-text-tertiary">
                {t("checkout.transactionId")}: {successData.transactionId}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {t("done")}
              </Button>
            </DialogFooter>
          </div>
        ) : step === "payment" && selectedPlan ? (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-3 space-y-1">
              <p className="text-xs font-medium text-text-tertiary uppercase">
                {t("checkout.orderSummary")}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {selectedPlan.name} · {tCycle(billingCycle)}
                </span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(
                    billingCycle === "Monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly,
                    selectedPlan.currency,
                    locale
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkout-card-name">{t("checkout.cardholderName")}</Label>
              <Input
                id="checkout-card-name"
                autoComplete="cc-name"
                placeholder={t("checkout.cardholderPlaceholder")}
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                aria-invalid={!!errors.cardName}
              />
              {errors.cardName && <p className="text-xs text-destructive">{errors.cardName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkout-card-number">{t("checkout.cardNumber")}</Label>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <Input
                  id="checkout-card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className="pl-8"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  aria-invalid={!!errors.cardNumber}
                />
              </div>
              {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-expiry">{t("checkout.expiry")}</Label>
                <Input
                  id="checkout-expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  aria-invalid={!!errors.expiry}
                />
                {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-cvc">{t("checkout.cvc")}</Label>
                <Input
                  id="checkout-cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  aria-invalid={!!errors.cvc}
                />
                {errors.cvc && <p className="text-xs text-destructive">{errors.cvc}</p>}
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <LockKeyhole className="size-3.5 shrink-0" />
              {t("checkout.secureNotice")}
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleBackToPlans} disabled={isProcessing}>
                {t("checkout.back")}
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="size-4 animate-spin" />}
                {isProcessing
                  ? t("checkout.processing")
                  : t("checkout.pay", {
                      amount: formatCurrency(
                        billingCycle === "Monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly,
                        selectedPlan.currency,
                        locale
                      ),
                    })}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase">
                {t("billingCycle")}
              </label>
              <Select
                value={billingCycle}
                onValueChange={(value) => setBillingCycle((value as BillingCycle) ?? "Monthly")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>{(value: string) => tCycle(value as BillingCycle)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tCycle(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading || !plans ? (
              <div className="no-scrollbar grid max-h-[46vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <div className="no-scrollbar grid max-h-[46vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                {plans.map((plan) => {
                  const isCurrent = plan.id === currentPlanId;
                  const price = billingCycle === "Monthly" ? plan.priceMonthly : plan.priceYearly;
                  const enabledFeatures = plan.features.filter((f) => f.enabled);
                  return (
                    <div
                      key={plan.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                        {isCurrent && <Badge variant="secondary">{t("currentPlanBadge")}</Badge>}
                      </div>
                      <p className="text-xl font-semibold text-text-primary">
                        {formatCurrency(price, plan.currency, locale)}
                        <span className="text-xs font-normal text-text-tertiary">
                          {billingCycle === "Monthly" ? t("perMonth") : t("perYear")}
                        </span>
                      </p>
                      <ul className="flex-1 space-y-1">
                        {enabledFeatures.map((f) => (
                          <li
                            key={f.featureKey}
                            className="flex items-center gap-1.5 text-xs text-text-secondary"
                          >
                            <Check className="size-3 shrink-0 text-success" />
                            {featureLabel(f.featureKey)}
                            {f.limit !== null && ` (${f.limit})`}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent}
                        onClick={() => handleChoosePlan(plan)}
                      >
                        {t("select")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
