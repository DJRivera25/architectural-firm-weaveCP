"use client";
import React from "react";
import HeroSection from "@/components/ui/HeroSection";
import AboutPreview from "@/components/ui/AboutPreview";
import ProcessPreview from "@/components/ui/ProcessPreview";
import ServicesPreview from "@/components/ui/ServicesPreview";
import OurTeam from "@/components/ui/OurTeam";
import ContactCTA from "@/components/ui/ContactCTA";
import WhyWeave from "@/components/ui/WhyWeave";
import Footer, { FooterProps } from "@/components/ui/Footer";
import type { WhyWeaveProps } from "@/components/ui/WhyWeave";
import type { HeroSectionProps } from "@/components/ui/HeroSection";
import type { AboutPreviewProps } from "@/components/ui/AboutPreview";
import type { ProcessPreviewProps } from "@/components/ui/ProcessPreview";
import type { ServicesPreviewProps } from "@/components/ui/ServicesPreview";
import type { OurTeamProps } from "@/components/ui/OurTeam";
import type { ContactCTAProps } from "@/components/ui/ContactCTA";

interface PreviewPaneProps {
  sectionId: string;
  draft: Record<string, unknown> | null;
  allDraftData: Record<string, unknown>;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ sectionId, draft, allDraftData }) => {
  if (sectionId === "hero") {
    return <HeroSection {...(draft as HeroSectionProps)} />;
  }
  let previewContent: React.ReactNode = null;
  switch (sectionId) {
    case "about":
      previewContent = <AboutPreview {...(draft as AboutPreviewProps)} />;
      break;
    case "why-weave":
      previewContent = <WhyWeave {...(draft as WhyWeaveProps)} />;
      break;
    case "process":
      previewContent = <ProcessPreview {...(draft as ProcessPreviewProps)} />;
      break;
    case "portfolio":
      previewContent = <ServicesPreview {...(draft as ServicesPreviewProps)} />;
      break;
    case "team":
      previewContent = <OurTeam {...(draft as OurTeamProps)} />;
      break;
    case "contact":
      previewContent = <ContactCTA {...(draft as ContactCTAProps)} />;
      break;
    case "footer":
      previewContent = typeof Footer !== "undefined" ? <Footer {...(draft as FooterProps)} /> : null;
      break;
    default:
      previewContent = (
        <pre className="text-xs text-blue-900/80 whitespace-pre-wrap font-mono">{JSON.stringify(draft, null, 2)}</pre>
      );
  }
  return (
    <div className="relative bg-gradient-to-br from-white/80 to-blue-50/60 border border-blue-100 rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center overflow-auto">
      <div className="absolute -top-4 -left-4 bg-blue-200/40 w-16 h-16 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -right-4 bg-indigo-200/40 w-24 h-24 rounded-full blur-2xl" />
      <div className="w-full max-w-2xl mx-auto">{previewContent}</div>
    </div>
  );
};

export default PreviewPane;
