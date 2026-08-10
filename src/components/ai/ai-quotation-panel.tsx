"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useGenerateQuotationMutation, useGetQuotationResultQuery } from "@/lib/api/ai.api";
import { usePollUntilReady } from "@/lib/hooks/usePolling";
import type { QuotationItem } from "@/types/api";

const NO_DEAL = "__no_deal__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

const emptyItem: QuotationItem = { description: "", quantity: 1, unitPrice: 0 };

export function AiQuotationPanel() {
  const t = useTranslations("pages.ai.quotation");
  const { data: deals } = useGetDealsQuery();
  const [generateQuotation, { isLoading: isEnqueuing }] = useGenerateQuotationMutation();

  const [dealId, setDealId] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([{ ...emptyItem }]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  const { data, error } = useGetQuotationResultQuery(jobId ?? "", {
    skip: !jobId,
    pollingInterval: jobId && isPending ? 1500 : 0,
  });
  const status = usePollUntilReady({ id: jobId, data, error, timeoutMs: 30000 });

  // Adjusted during render (not in an effect) per React's documented
  // pattern for deriving state from a changing value - this feeds back
  // into pollingInterval above on the next render.
  const [trackedStatus, setTrackedStatus] = useState(status);
  if (status !== trackedStatus) {
    setTrackedStatus(status);
    setIsPending(status === "pending" || status === "idle");
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  const updateItem = (index: number, patch: Partial<QuotationItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const canSubmit =
    dealId && items.length > 0 && items.every((item) => item.description.trim());

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setJobId(null);
    try {
      const result = await generateQuotation({ dealId, items }).unwrap();
      setJobId(result.id);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="ai-quote-deal" className="text-xs font-medium text-text-tertiary uppercase">
          {t("deal")}
        </label>
        <Select
          value={dealId || NO_DEAL}
          onValueChange={(value) => setDealId(value === NO_DEAL || !value ? "" : value)}
        >
          <SelectTrigger id="ai-quote-deal" className="w-full">
            <SelectValue>
              {(value: string) => {
                const deal = deals?.find((d) => d.id === value);
                return deal ? deal.title : t("selectDeal");
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_DEAL} disabled>
              {t("selectDeal")}
            </SelectItem>
            {deals?.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-text-tertiary uppercase">
          {t("items")}
        </label>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              className={inputClass}
              placeholder={t("description")}
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
            />
            <input
              className={`${inputClass} w-20`}
              type="number"
              min={1}
              placeholder={t("quantity")}
              value={item.quantity}
              onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 0 })}
            />
            <input
              className={`${inputClass} w-28`}
              type="number"
              min={0}
              placeholder={t("unitPrice")}
              value={item.unitPrice}
              onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={t("removeItem")}
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              disabled={items.length === 1}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
        >
          <Plus className="size-3.5" />
          {t("addItem")}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-2.5">
        <span className="text-sm text-text-secondary">{t("subtotal")}</span>
        <span className="text-sm font-medium text-text-primary">{subtotal.toFixed(2)}</span>
      </div>

      <Button type="button" onClick={handleGenerate} disabled={isEnqueuing || !canSubmit}>
        {isEnqueuing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {t("generate")}
      </Button>

      {jobId && (status === "pending" || status === "idle") && (
        <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Loader2 className="size-3 animate-spin" />
          {t("working")}
        </p>
      )}

      {(status === "failed" || status === "timeout") && (
        <div className="space-y-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <p>{t("failed")}</p>
          <Button type="button" size="sm" variant="outline" onClick={handleGenerate}>
            {t("tryAgain")}
          </Button>
        </div>
      )}

      {status === "success" && data && data.status === "Failed" && (
        <div className="space-y-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <p>{t("failed")}</p>
          <Button type="button" size="sm" variant="outline" onClick={handleGenerate}>
            {t("tryAgain")}
          </Button>
        </div>
      )}

      {status === "success" && data && data.status !== "Failed" && (
        <div className="space-y-2 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t("total")}</span>
            <span className="font-medium text-text-primary">{data.totalAmount.toFixed(2)}</span>
          </div>
          {data.downloadUrl && (
            <a
              href={data.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-primary underline-offset-4 hover:underline"
            >
              {t("download")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
