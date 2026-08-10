import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { CoreDifference } from "@/components/landing/core-difference";
import { SalesCrmSection } from "@/components/landing/sales-crm-section";
import { StatsRow } from "@/components/landing/stats-row";
import { AiFeatures } from "@/components/landing/ai-features";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function MarketingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <CoreDifference />
        <SalesCrmSection />
        <StatsRow />
        <AiFeatures />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
