"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useGetAssistantConversationQuery,
  useSendAssistantMessageMutation,
} from "@/lib/api/ai.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1 py-1">
      <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary" />
    </span>
  );
}

export function AiAssistantPanel() {
  const t = useTranslations("pages.ai.assistant");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sendMessage, { isLoading: isSending }] = useSendAssistantMessageMutation();

  const [awaitingReply, setAwaitingReply] = useState(false);

  const { data: conversation } = useGetAssistantConversationQuery(conversationId ?? "", {
    skip: !conversationId,
    pollingInterval: awaitingReply ? 1500 : 0,
  });

  const messages = conversation?.messages ?? [];

  // Effect (not derived-during-render) since this depends on polled data
  // that changes on its own timer, not a caller-supplied id/prop - only
  // fires when the RTK Query cache reference for `conversation` actually
  // changes, so it can't feed a render-loop the way reading pollingInterval
  // off render-derived state could. Keep polling until the assistant's row
  // leaves "Pending" (Completed or Failed - see AiAssistantMessage).
  useEffect(() => {
    const last = conversation?.messages[conversation.messages.length - 1];
    if (!last) return;
    setAwaitingReply(last.role === "User" || last.status === "Pending");
  }, [conversation]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    setMessage("");
    setAwaitingReply(true);
    try {
      const result = await sendMessage({
        conversationId: conversationId ?? undefined,
        message: text,
      }).unwrap();
      setConversationId(result.conversationId);
    } catch {
      setAwaitingReply(false);
      // errorToastMiddleware shows the calm "AI is being activated" toast
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <EmptyState icon={Sparkles} title={t("empty")} />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            if (m.role === "Assistant" && m.status === "Pending") return null;

            if (m.role === "Assistant" && m.status === "Failed") {
              return (
                <li key={m.id} className="flex justify-start">
                  <div className="flex max-w-[80%] items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
                    <Sparkles className="size-3.5 shrink-0" />
                    {t("messageFailed")}
                  </div>
                </li>
              );
            }

            return (
              <li key={m.id} className={`flex ${m.role === "User" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    m.role === "User"
                      ? "max-w-[80%] rounded-2xl bg-accent-gradient px-4 py-2 text-sm text-white"
                      : "flex max-w-[80%] items-start gap-2 rounded-2xl border border-border-glow/30 bg-surface-elevated px-4 py-2"
                  }
                >
                  {m.role === "Assistant" && <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-primary" />}
                  <span className="whitespace-pre-wrap text-sm text-text-primary">{m.content}</span>
                </div>
              </li>
            );
          })}
          {awaitingReply && (
            <li className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border-glow/30 bg-surface-elevated px-4 py-2">
                <Sparkles className="size-3.5 text-accent-primary" />
                <TypingDots />
              </div>
            </li>
          )}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("placeholder")}
          className={`${inputClass} min-h-12 resize-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          aria-label={t("send")}
          onClick={handleSend}
          disabled={isSending || !message.trim()}
        >
          {isSending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}
