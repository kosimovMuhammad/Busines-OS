"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Mail, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useDraftEmailMutation, useGetDraftEmailResultQuery } from "@/lib/api/ai.api";
import { usePollUntilReady } from "@/lib/hooks/usePolling";


const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function AiDraftEmailPanel() {
  const t = useTranslations("pages.ai.draftEmail");
  const router = useRouter();
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const [draftEmail, { isLoading: isEnqueuing }] = useDraftEmailMutation();

  const [contactId, setContactId] = useState("");
  const [context, setContext] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  const { data, error } = useGetDraftEmailResultQuery(jobId ?? "", {
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

  const handleDraft = async () => {
    if (!contactId) return;
    setJobId(null);
    try {
      const result = await draftEmail({ contactId, context: context.trim() || undefined }).unwrap();
      setJobId(result.id);
    } catch {
      // errorToastMiddleware shows the calm "AI is being activated" toast
    }
  };

  const openInEmailCompose = () => {
    if (!data) return;
    const params = new URLSearchParams({
      contactId,
      subject: data.subject,
      body: data.body,
    });
    router.push(`/communications?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="ai-draft-contact" className="text-xs font-medium text-text-tertiary uppercase">
          {t("contact")}
        </label>
        <Select
          value={contactId || null}
          onValueChange={(value) => setContactId(value || "")}
        >
          <SelectTrigger id="ai-draft-contact" className="w-full">
            <SelectValue>
              {(value: string) => {
                const contact = contactsPage?.data.find((c) => c.id === value);
                return contact
                  ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
                  : t("selectContact");
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {contactsPage?.data.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {[c.firstName, c.lastName].filter(Boolean).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ai-draft-context" className="text-xs font-medium text-text-tertiary uppercase">
          {t("context")}
        </label>
        <textarea
          id="ai-draft-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t("contextPlaceholder")}
          className={`${inputClass} min-h-16 resize-none`}
        />
      </div>

      <Button type="button" onClick={handleDraft} disabled={isEnqueuing || !contactId}>
        {isEnqueuing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {t("draft")}
      </Button>

      {jobId && (status === "pending" || status === "idle") && (
        <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Loader2 className="size-3 animate-spin" />
          {t("working")}
        </p>
      )}

      {status === "failed" || status === "timeout" ? (
        <p className="text-xs text-danger">{t("failed")}</p>
      ) : null}

      {status === "success" && data && (
        <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-4">
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("subject")}</p>
            <p className="text-sm text-text-primary">{data.subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase">{t("body")}</p>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">{data.body}</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={openInEmailCompose}>
            <Mail className="size-3.5" />
            {t("openInEmail")}
          </Button>
        </div>
      )}
    </div>
  );
}
