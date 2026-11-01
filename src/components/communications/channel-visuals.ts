import { Camera, Mail, MessageCircle, Phone, Send, StickyNote } from "lucide-react";
import type { CommChannel } from "@/types/enums";

// Reuses the app's existing chart palette (see dashboard pipeline-breakdown
// / deal-stage-visuals) so a channel dot reads as part of the same design
// system rather than introducing new hues. PhoneCall/ManualNote stay neutral
// since they aren't external branded channels.
export const CHANNEL_COLOR: Record<CommChannel, string> = {
  Whatsapp: "var(--chart-3)",
  Telegram: "var(--chart-2)",
  Instagram: "var(--chart-1)",
  Email: "var(--chart-4)",
  PhoneCall: "var(--text-tertiary)",
  ManualNote: "var(--text-tertiary)",
};

export const CHANNEL_ICON: Record<CommChannel, typeof Mail> = {
  Whatsapp: MessageCircle,
  Telegram: Send,
  Instagram: Camera,
  Email: Mail,
  ManualNote: StickyNote,
  PhoneCall: Phone,
};
