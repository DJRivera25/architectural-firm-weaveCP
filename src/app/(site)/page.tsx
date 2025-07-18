import { Suspense } from "react";
import Head from "next/head";
import HeroSection, { HeroSectionProps } from "@/components/ui/HeroSection";
import AboutPreview, { AboutPreviewProps } from "@/components/ui/AboutPreview";
import ProcessPreview, { ProcessPreviewProps } from "@/components/ui/ProcessPreview";
import PortfolioPreview, { PortfolioPreviewProps } from "@/components/ui/PortfolioPreview";
import ContactCTA, { ContactCTAProps } from "@/components/ui/ContactCTA";
import ScrollToContactOnLoad from "@/components/ui/ScrollToContactOnLoad";
import WhyWeave, { WhyWeaveProps } from "@/components/ui/WhyWeave";
import OurTeam, { OurTeamProps } from "@/components/ui/OurTeam";
import AdvantageSection from "@/components/ui/AdvantageSection";
import { motion } from "framer-motion";

async function fetchSection(section: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/content?section=${section}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return Array.isArray(data) ? data[0]?.publishedData || {} : data?.publishedData || {};
  } catch {
    return {};
  }
}

export default async function Home() {
  // Test database connection
  try {
    const { connectDB } = await import("@/lib/db");
    await connectDB();
    console.log("✅ Database connection successful in home page");
  } catch (error) {
    console.error("❌ Database connection failed in home page:", error);
  }

  const [hero, about, whyWeave, process, portfolio, team, contact] = await Promise.all([
    fetchSection("hero"),
    fetchSection("about"),
    fetchSection("why-weave"),
    fetchSection("process"),
    fetchSection("portfolio"),
    fetchSection("team"),
    fetchSection("contact"),
    fetchSection("footer"),
  ]);
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
          <HeroSection {...(hero as HeroSectionProps)} />
          <AboutPreview {...(about as AboutPreviewProps)} />
          <WhyWeave {...(whyWeave as WhyWeaveProps)} />
        </section>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="process-heading">
            <ProcessPreview {...(process as ProcessPreviewProps)} />
          </section>
        </Suspense>
        <AdvantageSection />
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="team-heading">
            <OurTeam {...(team as OurTeamProps)} />
          </section>
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="portfolio-heading">
            <PortfolioPreview {...(portfolio as PortfolioPreviewProps)} />
          </section>
        </Suspense>
        <section aria-labelledby="contact-heading">
          <ContactCTA {...(contact as ContactCTAProps)} />
        </section>
      </main>
    </>
  );
}
