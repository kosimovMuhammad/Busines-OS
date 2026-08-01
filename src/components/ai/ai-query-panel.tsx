"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useAiQueryMutation, useGetAiQueryResultQuery } from "@/lib/api/ai.api";
import { usePollUntilReady } from "@/lib/hooks/usePolling";

type Exchange = { id: string; question: string };

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

function AnswerBubble({ jobId }: { jobId: string }) {
  const t = useTranslations("pages.ai.query");
  const [isPending, setIsPending] = useState(true);
  const { data, error } = useGetAiQueryResultQuery(jobId, {
    pollingInterval: isPending ? 1500 : 0,
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

  if (status === "pending" || status === "idle") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Loader2 className="size-3 animate-spin" />
        {t("working")}
      </p>
    );
  }

  if (status === "success" && data) {
    return <p className="whitespace-pre-wrap text-sm text-text-primary">{data.answer}</p>;
  }

  return <p className="text-xs text-danger">{t("failed")}</p>;
}

export function AiQueryPanel() {
  const t = useTranslations("pages.ai.query");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [aiQuery, { isLoading }] = useAiQueryMutation();

  const handleAsk = async () => {
    const q = question.trim();
    if (!q) return;
    try {
      const result = await aiQuery({ question: q }).unwrap();
      setHistory((prev) => [...prev, { id: result.id, question: q }]);
      setQuestion("");
    } catch {
      // errorToastMiddleware shows the calm "AI is being activated" toast
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {history.length === 0 ? (
        <EmptyState icon={Sparkles} title={t("empty")} />
      ) : (
        <ul className="space-y-3">
          {history.map((exchange) => (
            <li key={exchange.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-accent-gradient px-4 py-2 text-sm text-white">
                  {exchange.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-surface-elevated px-4 py-2">
                  <AnswerBubble jobId={exchange.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("placeholder")}
          className={`${inputClass} min-h-12 resize-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          aria-label={t("send")}
          onClick={handleAsk}
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}
