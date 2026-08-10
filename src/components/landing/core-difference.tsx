import { Check, ChevronLeft, ChevronRight, Globe, Mail, MessageSquare, Phone, Users } from "lucide-react";
import { GlowCard } from "@/components/landing/glow-card";
import { OrbitGraphic } from "@/components/landing/orbit-graphic";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WaveDivider } from "@/components/landing/wave-divider";

const orbitNodes = [MessageSquare, Mail, Phone, Users];

const bullets = [
  "Instant channel switching",
  "Shared team inboxes",
  "Unified contact history",
];

export function CoreDifference() {
  return (
    <section className="relative pb-20">
      <WaveDivider direction="up" className="-mt-1" />

      <div className="px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium tracking-widest text-accent-secondary uppercase">
                01 / 03
              </p>
              <p className="text-sm font-medium text-text-primary">The Core Difference</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-border-subtle text-text-tertiary">
                <ChevronLeft className="size-4" />
              </span>
              <span className="flex size-8 items-center justify-center rounded-full border border-border-subtle text-text-tertiary">
                <ChevronRight className="size-4" />
              </span>
            </div>
          </div>

          <ScrollReveal>
            <GlowCard shadow="violet" contentClassName="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-10">
              <div>
                <h2 className="text-2xl font-bold text-text-primary lg:text-3xl">
                  10x faster than switching apps
                </h2>
                <p className="mt-3 text-sm text-text-secondary">
                  Stop context switching. Business OS unifies your fragmented
                  communication channels into a single, high-performance workspace
                  designed for speed and clarity.
                </p>
                <ul className="mt-6 space-y-3">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="size-4 shrink-0 text-accent-secondary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/60 p-6">
                <OrbitGraphic centerIcon={Globe} nodes={orbitNodes} size={220} />
                <span className="mt-4 text-[10px] font-medium tracking-widest text-text-tertiary uppercase">
                  Every channel, one hub
                </span>
              </div>
            </GlowCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
