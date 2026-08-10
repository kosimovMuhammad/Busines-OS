import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AmbientGlow } from "@/components/landing/ambient-glow";
import { GlowCard } from "@/components/landing/glow-card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function FinalCta() {
  return (
    <section className="relative px-6 pb-24">
      <div className="mx-auto max-w-5xl">
        <GlowCard contentClassName="bg-transparent backdrop-blur-none">
          <ScrollReveal className="relative overflow-hidden rounded-2xl">
            <AmbientGlow className="top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
            <div className="bg-accent-gradient relative px-6 py-16 text-center sm:px-12">
              <h2 className="text-3xl leading-tight font-bold text-white lg:text-4xl">
                Ready to run your business
                <br />
                from one place?
              </h2>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                className="btn-glow-ring mt-8 h-11 rounded-full bg-white px-6 text-sm font-semibold text-accent-primary hover:bg-white/90"
              >
                Start Free Trial
              </Button>
              <p className="mt-4 text-xs text-white/70">
                No credit card required. 14-day full access.
              </p>
            </div>
          </ScrollReveal>
        </GlowCard>
      </div>
    </section>
  );
}
