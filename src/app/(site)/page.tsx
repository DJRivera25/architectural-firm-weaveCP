import { Suspense } from "react";
import Head from "next/head";
import HeroSection, { HeroSectionProps } from "@/components/ui/HeroSection";
import AboutPreview, { AboutPreviewProps } from "@/components/ui/AboutPreview";
import ProcessPreview, { ProcessPreviewProps } from "@/components/ui/ProcessPreview";
import ServicesPreview, { ServicesPreviewProps } from "@/components/ui/ServicesPreview";
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

  const [hero, about, whyWeave, process, services, team, contact] = await Promise.all([
    fetchSection("hero"),
    fetchSection("about"),
    fetchSection("why-weave"),
    fetchSection("process"),
    fetchSection("services"),
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
          <div id="aboutPreview">
            <AboutPreview {...(about as AboutPreviewProps)} />
          </div>
          <div id="whyWeave">
            <WhyWeave {...(whyWeave as WhyWeaveProps)} />
          </div>
        </section>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="process-heading">
            <ProcessPreview {...(process as ProcessPreviewProps)} />
          </section>
        </Suspense>
        <AdvantageSection />
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="team-heading">
            <div id="ourTeam">
              <OurTeam {...(team as OurTeamProps)} />
            </div>
          </section>
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <section aria-labelledby="services-heading">
            <ServicesPreview {...(services as ServicesPreviewProps)} />
          </section>
        </Suspense>
        <section aria-labelledby="contact-heading">
          <ContactCTA {...(contact as ContactCTAProps)} />
        </section>
      </main>
    </>
  );
}
