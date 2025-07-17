import { Suspense } from "react";
import Head from "next/head";
import HeroSection from "@/components/ui/HeroSection";
import AboutPreview from "@/components/ui/AboutPreview";
import ProcessPreview from "@/components/ui/ProcessPreview";
import PortfolioPreview from "@/components/ui/PortfolioPreview";
import ContactCTA from "@/components/ui/ContactCTA";
import ScrollToContactOnLoad from "@/components/ui/ScrollToContactOnLoad";
import { WhyWeaveSection } from "@/components/ui/AboutPreview";
import OurTeam from "@/components/ui/OurTeam";

export default function Home() {
  return (
    <>
      <ScrollToContactOnLoad />
      <Head>
        <title>Architectural Firm | Innovative Design Solutions</title>
        <meta
          name="description"
          content="Discover innovative architectural design solutions, our portfolio, and how we can help bring your vision to life. Explore our process, team, and contact us for your next project."
        />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Head>
      <main className="min-h-screen" id="main-content" aria-label="Main content">
        <section aria-labelledby="hero-heading">
          <HeroSection />
          <AboutPreview />
        </section>
        <WhyWeaveSection />
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="process-heading">
            <ProcessPreview />
          </section>
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="team-heading">
            <OurTeam />
          </section>
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="portfolio-heading">
            <PortfolioPreview />
          </section>
        </Suspense>
        <section aria-labelledby="contact-heading">
          <ContactCTA />
        </section>
      </main>
    </>
  );
}
