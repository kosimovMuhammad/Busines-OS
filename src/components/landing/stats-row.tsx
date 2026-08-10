import { GlowCard } from "@/components/landing/glow-card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WaveDivider } from "@/components/landing/wave-divider";

const stats = [
  { value: "50K+", label: "Contacts Managed", shadow: "violet" as const },
  { value: "120K+", label: "Messages Synced Daily", shadow: "blue" as const },
  { value: "500+", label: "Companies Onboarded", shadow: "emerald" as const },
  { value: "3.5h", label: "Avg. Time Saved / Week", accent: true, shadow: "aurora" as const },
];

export function StatsRow() {
  return (
    <section className="relative pb-20">
      <WaveDivider direction="up" className="-mt-1" />

      <div className="px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 80}>
              <GlowCard shadow={stat.shadow} contentClassName="px-5 py-6 text-center">
                <p
                  className={
                    stat.accent
                      ? "bg-accent-gradient bg-clip-text text-2xl font-bold text-transparent lg:text-3xl"
                      : "text-2xl font-bold text-text-primary lg:text-3xl"
                  }
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                  {stat.label}
                </p>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
