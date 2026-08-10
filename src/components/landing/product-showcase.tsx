import { CheckCircle2, DollarSign, TrendingUp, Users } from "lucide-react";
import { AmbientGlow } from "@/components/landing/ambient-glow";
import { GlowCard } from "@/components/landing/glow-card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WaveDivider } from "@/components/landing/wave-divider";

const kpis = [
  { icon: DollarSign, label: "Revenue", value: "$427,500", delta: "+18.2%", shadow: "violet" as const },
  { icon: Users, label: "Open Deals", value: "112", delta: "+4.6%", shadow: "blue" as const },
  { icon: CheckCircle2, label: "Tasks Done", value: "23", delta: "+0.8%", shadow: "emerald" as const },
];

const activity = [
  { who: "Farrukh", action: "closed deal with Acme Corp HQ", time: "2m ago" },
  { who: "Nilufar", action: "sent WhatsApp follow-up to Global Logistics", time: "14m ago" },
  { who: "AI Assistant", action: "summarized 45-message thread", time: "1h ago" },
];

const chartBars = [40, 65, 50, 80, 60, 95, 75];

export function ProductShowcase() {
  return (
    <section id="showcase" className="relative pb-24">
      {/* Wave yuqoridan */}
      <WaveDivider direction="up" className="-mt-1" />

      <div className="px-6">
        <ScrollReveal className="relative mx-auto max-w-5xl">
          <AmbientGlow className="top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 opacity-20" />

          <GlowCard
            shadow="aurora"
            className="shadow-2xl"
            contentClassName="overflow-hidden bg-surface backdrop-blur-none"
          >
            {/* Browser toolbar */}
            <div className="flex items-center gap-1.5 border-b border-white/5 bg-surface-elevated px-4 py-3">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-3 text-xs text-text-tertiary">businessos.app</span>
            </div>

            <div className="bg-background p-6 lg:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Welcome back, Team</p>
                  <p className="text-xs text-text-tertiary">Here&apos;s what&apos;s happening today</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Live
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {kpis.map((kpi) => (
                  <GlowCard
                    key={kpi.label}
                    shadow={kpi.shadow}
                    contentClassName="p-4"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
                      <kpi.icon className="size-4" />
                    </span>
                    <p className="mt-3 text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
                      {kpi.label}
                    </p>
                    <p className="text-lg font-bold text-text-primary">{kpi.value}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                      <TrendingUp className="size-3" />
                      {kpi.delta}
                    </span>
                  </GlowCard>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
                {/* Revenue chart */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-3">
                  <p className="mb-4 text-xs font-medium text-text-secondary">Revenue trend</p>
                  <div className="flex h-24 items-end gap-2">
                    {chartBars.map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${
                          i === chartBars.length - 1
                            ? "bg-accent-gradient"
                            : "bg-accent-primary/25"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
                  <p className="mb-3 text-xs font-medium text-text-secondary">Recent activity</p>
                  <ul className="space-y-3">
                    {activity.map((item) => (
                      <li key={item.who} className="flex items-start gap-2">
                        <span className="bg-accent-gradient mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white">
                          {item.who.charAt(0)}
                        </span>
                        <p className="text-[11px] leading-snug text-text-tertiary">
                          <span className="font-medium text-text-secondary">{item.who}</span>{" "}
                          {item.action}
                          <span className="block text-text-tertiary/70">{item.time}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
