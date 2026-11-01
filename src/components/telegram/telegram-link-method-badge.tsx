import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { TelegramChatLink } from "@/types/api";

const LINK_METHOD_CLASSES: Record<TelegramChatLink["linkMethod"], string> = {
  AutoMatchedByPhone: "bg-success/10 text-success",
  ManuallyLinked: "bg-accent-secondary/10 text-accent-secondary",
  Unlinked: "bg-warning/10 text-warning",
};

export function TelegramLinkMethodBadge({
  linkMethod,
}: {
  linkMethod: TelegramChatLink["linkMethod"];
}) {
  const t = useTranslations("pages.telegram.chatLinks.linkMethodBadge");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        LINK_METHOD_CLASSES[linkMethod]
      )}
    >
      {t(linkMethod)}
    </span>
  );
}
