"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSendWhatsappMessageMutation } from "@/lib/api/whatsapp.api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function WhatsappComposer({ contactId }: { contactId: string }) {
  const t = useTranslations("pages.whatsapp.composer");
  const [sendMessage, { isLoading }] = useSendWhatsappMessageMutation();
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState<"badRequest" | "unavailable" | null>(null);

  const handleSend = async () => {
    if (!contactId || !message.trim()) return;
    setGuidance(null);
    try {
      await sendMessage({ contactId, message: message.trim() }).unwrap();
      setMessage("");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setGuidance(status === 400 ? "badRequest" : "unavailable");
    }
  };

  return (
    <div className="space-y-2">
      {guidance && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{t(guidance)}</span>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("placeholder")}
          disabled={!contactId}
          className={`${inputClass} min-h-16 resize-none`}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={isLoading || !contactId || !message.trim()}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}
