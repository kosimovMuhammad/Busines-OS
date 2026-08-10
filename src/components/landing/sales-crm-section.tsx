import { ArrowRight, CheckCircle2 } from "lucide-react";
import { GlowCard } from "@/components/landing/glow-card";
import { LeadFunnel } from "@/components/landing/lead-funnel";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WaveDivider } from "@/components/landing/wave-divider";

const columns = [
  {
    label: "New (4)",
    barColor: "bg-accent-primary",
    deal: { name: "Acme Corp HQ", amount: "$12,000" },
  },
  {
    label: "In Talk (2)",
    barColor: "bg-accent-secondary",
    deal: { name: "Global Logistics", amount: "$4,500" },
  },
  {
    label: "Closed (12)",
    barColor: "bg-success",
    deal: { name: "Stellar Tech", amount: "$28,000", closed: true },
  },
];

export function SalesCrmSection() {
  return (
    <section className="relative pb-20">
      <WaveDivider direction="up" className="-mt-1" />

      <div className="px-6">
        <ScrollReveal className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-primary uppercase">
              Sales &amp; CRM
            </span>
            <h2 className="mt-4 text-2xl font-bold text-text-primary lg:text-3xl">
              Manage every deal, every customer
            </h2>
            <p className="mt-3 max-w-md text-sm text-text-secondary">
              Transform casual chats into qualified leads. Our integrated CRM
              ensures no deal slips through the cracks, with automated tracking
              and visual deal boards.
            </p>
            <LeadFunnel />
            <a
              href="#showcase"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-secondary hover:underline"
            >
              Learn more
              <ArrowRight className="size-4" />
            </a>
          </div>

          <GlowCard shadow="blue" contentClassName="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Deal Pipeline</span>
              <div className="flex gap-1.5">
                <span className="size-2 rounded-full bg-danger/70" />
                <span className="size-2 rounded-full bg-warning/70" />
                <span className="size-2 rounded-full bg-success/70" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {columns.map((col) => (
                <div key={col.label}>
                  <p className="mb-2 text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
                    {col.label}
                  </p>
                  <div className={`mb-2 h-1 rounded-full ${col.barColor}`} />
                  <div className="rounded-lg border border-white/10 bg-background/60 p-2.5">
                    <p className="truncate text-xs font-semibold text-text-primary">
                      {col.deal.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-text-tertiary">{col.deal.amount}</span>
                      {col.deal.closed && (
                        <CheckCircle2 className="size-3.5 text-success" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
