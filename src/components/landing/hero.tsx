"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function Hero() {
  return (
    <section className="hero-video-section relative isolate flex min-h-screen flex-col overflow-hidden">
      {/* ── Full-screen video background ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 -z-20 size-full object-cover"
        src="/videos/product-demo.mp4"
      />

      {/* ── Dark overlay gradient ── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* ── Corner-pinned text block (bottom-left) ── */}
      <div className="relative mt-auto px-8 pb-20 sm:px-14 lg:px-20">
        <ScrollReveal>
          {/* Kichik badge */}
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-medium tracking-widest text-text-secondary uppercase backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-accent-primary" />
            Business OS — v2.0
          </span>

          {/* Asosiy sarlavha — yagona katta so'z */}
          <h1 className="hero-headline mt-2 max-w-2xl">
            <span className="block text-6xl font-black leading-none tracking-tighter text-white drop-shadow-2xl sm:text-7xl lg:text-8xl xl:text-9xl">
              One.
            </span>
            <span className="mt-2 block text-2xl font-semibold leading-snug text-text-secondary sm:text-3xl lg:text-4xl">
              Dashboard. Every conversation.{" "}
              <span className="bg-accent-gradient bg-clip-text text-transparent">
                All channels.
              </span>
            </span>
          </h1>

          {/* Tavsif */}
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-text-secondary/80 sm:text-base">
            Accept WhatsApp and email in one place, manage your pipeline, and
            let AI summarize the noise — built for teams who are done switching
            apps.
          </p>

          {/* CTA tugmalar */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              render={<Link href="/register" />}
              nativeButton={false}
              className="btn-glow-ring bg-accent-gradient h-12 rounded-full px-8 text-sm font-bold tracking-wide text-white"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              render={<a href="#showcase" />}
              nativeButton={false}
              className="btn-glow-ring h-12 rounded-full border-white/20 bg-white/[0.06] px-8 text-sm font-semibold text-text-primary backdrop-blur-xl hover:bg-white/10"
            >
              Watch Demo ↓
            </Button>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Wave divider (pastga o'tish uchun) ── */}
      <div className="wave-divider absolute bottom-0 left-0 right-0 -z-[5]">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full"
          style={{ display: "block", height: "80px" }}
        >
          <path
            d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,120 L0,120 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
