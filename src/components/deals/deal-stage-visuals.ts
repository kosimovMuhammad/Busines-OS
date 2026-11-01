import type { DealStage } from "@/types/enums";

// Matches the colors used in the dashboard's pipeline breakdown chart so a
// stage reads the same color everywhere it appears.
export const STAGE_COLOR: Record<DealStage, string> = {
  Lead: "var(--chart-1)",
  Qualified: "var(--chart-2)",
  Proposal: "var(--chart-3)",
  Negotiation: "var(--chart-4)",
  Won: "var(--success)",
  Lost: "var(--danger)",
};
