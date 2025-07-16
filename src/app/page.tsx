import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import AboutPreview from "@/components/AboutPreview";
import ProcessPreview from "@/components/ProcessPreview";
import PortfolioPreview from "@/components/PortfolioPreview";
import ContactCTA from "@/components/ContactCTA";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        <AboutPreview />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        <ProcessPreview />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        <PortfolioPreview />
      </Suspense>

      <ContactCTA />
    </div>
  );
}
