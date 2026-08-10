import { FileText, Mail, MessageSquare, Sparkles, Zap } from "lucide-react";
import { GlowCard } from "@/components/landing/glow-card";
import { OrbitGraphic } from "@/components/landing/orbit-graphic";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WaveDivider } from "@/components/landing/wave-divider";

const bars = [30, 38, 55, 48, 68, 90];
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const aiOrbitNodes = [FileText, MessageSquare, Mail, Zap];

export function AiFeatures() {
  return (
    <section className="relative pb-24">
      <WaveDivider direction="up" className="-mt-1" />

      <div className="px-6">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              <Sparkles className="size-3.5 text-accent-primary" />
              Bridging Sales, Support &amp; Comms
            </span>
            <h2 className="mt-4 text-xl font-bold text-text-primary lg:text-2xl">
              End-to-end customer operations for modern teams
            </h2>
          </ScrollReveal>

          <ScrollReveal className="mb-12" delay={80}>
            <OrbitGraphic centerIcon={Sparkles} nodes={aiOrbitNodes} size={200} className="mx-auto" />
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ScrollReveal>
              <GlowCard shadow="aurora" contentClassName="p-6">
                <h3 className="text-sm font-semibold text-text-primary">AI Summaries</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Get instant recaps of long threads. Our AI scans conversations
                  across all channels to provide a concise summary, so you&apos;re
                  always up to date without scrolling.
                </p>
                <div className="mt-5 flex gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-surface-elevated text-text-tertiary">
                    <Zap className="size-4" />
                  </span>
                </div>
              </GlowCard>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <GlowCard shadow="emerald" contentClassName="p-6">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-surface-elevated text-text-tertiary">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Thread Summary</p>
                    <p className="text-[11px] text-text-tertiary">Active for 3 hours &bull; 45 messages</p>
                  </div>
                </div>

                <div className="mt-4 border-l-2 border-accent-primary/50 pl-3 text-xs text-text-secondary">
                  <p>Client is asking for a custom pricing tier for 200+ users and expects a response by EOD.</p>
                  <p className="mt-1">Support team has already clarified technical limits regarding API throughput.</p>
                </div>

                <div className="mt-6 flex h-20 items-end justify-between gap-2">
                  {bars.map((h, i) => (
                    <div key={days[i]} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-t-sm ${
                          i === bars.length - 1 ? "bg-accent-gradient" : "bg-accent-primary/25"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-text-tertiary">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
