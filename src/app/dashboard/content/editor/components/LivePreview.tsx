"use client";

import { useEditor } from "@/components/providers/EditorProvider";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/ui/HeroSection";
import AboutPreview from "@/components/ui/AboutPreview";
import WhyWeave from "@/components/ui/WhyWeave";
import ProcessPreview from "@/components/ui/ProcessPreview";
import ServicesPreview from "@/components/ui/ServicesPreview";
import OurTeam from "@/components/ui/OurTeam";
import ContactCTA from "@/components/ui/ContactCTA";
import Footer from "@/components/ui/Footer";

export default function LivePreview() {
  const { activeSection, draftContent, previewMode, fullscreenPreview, setFullscreenPreview } = useEditor();

  const [currentContent, setCurrentContent] = useState(draftContent[activeSection] || {});

  // Update current content when active section or draft content changes
  useEffect(() => {
    setCurrentContent(draftContent[activeSection] || {});
  }, [activeSection, draftContent]);

  // Get preview container styles based on preview mode
  const getPreviewStyles = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm mx-auto";
      case "tablet":
        return "max-w-2xl mx-auto";
      case "desktop":
      default:
        return "w-full";
    }
  };

  // Render the appropriate component based on active section
  const renderPreviewContent = () => {
    switch (activeSection) {
      case "hero":
        return <HeroSection {...currentContent} />;
      case "about":
        return <AboutPreview {...currentContent} />;
      case "why-weave":
        return <WhyWeave {...currentContent} />;
      case "process":
        return <ProcessPreview {...currentContent} />;
      case "portfolio":
        return <ServicesPreview {...currentContent} />;
      case "team":
        return <OurTeam {...currentContent} />;
      case "contact":
        return <ContactCTA {...currentContent} />;
      case "footer":
        return <Footer {...currentContent} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">Select a section to edit</h3>
              <p className="text-sm">Choose a section from the left sidebar to start editing</p>
            </div>
          </div>
        );
    }
  };

  // Fullscreen preview overlay
  if (fullscreenPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
        {/* Browser-like header */}
        <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white rounded-lg px-3 py-1 text-sm text-gray-600">{activeSection} - Preview</div>
          </div>
          <button
            onClick={() => setFullscreenPreview(false)}
            className="px-4 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Exit Preview
          </button>
        </div>

        {/* Fullscreen content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="min-h-screen">{renderPreviewContent()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className={`min-h-full ${getPreviewStyles()}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg rounded-lg m-4 overflow-hidden"
        >
          {/* Preview header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{previewMode}</span>
              <span>•</span>
              <span>Live</span>
            </div>
          </div>

          {/* Preview content */}
          <div className="p-4">{renderPreviewContent()}</div>
        </motion.div>
      </div>
    </div>
  );
}
