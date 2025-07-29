"use client";

import { useEditor } from "@/components/providers/EditorProvider";
import {
  HomeIcon,
  DocumentTextIcon,
  StarIcon,
  CogIcon,
  BriefcaseIcon,
  UserGroupIcon,
  EnvelopeIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Hero Section", icon: HomeIcon, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
  {
    id: "about",
    label: "About Section",
    icon: DocumentTextIcon,
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  { id: "why-weave", label: "Why Weave", icon: StarIcon, color: "bg-gradient-to-br from-purple-500 to-purple-600" },
  { id: "process", label: "Process", icon: CogIcon, color: "bg-gradient-to-br from-orange-500 to-orange-600" },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: BriefcaseIcon,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
  { id: "team", label: "Team", icon: UserGroupIcon, color: "bg-gradient-to-br from-pink-500 to-pink-600" },
  { id: "contact", label: "Contact", icon: EnvelopeIcon, color: "bg-gradient-to-br from-red-500 to-red-600" },
  { id: "footer", label: "Footer", icon: LinkIcon, color: "bg-gradient-to-br from-gray-500 to-gray-600" },
];

export default function LeftSidebar() {
  const { activeSection, setActiveSection, leftSidebarOpen, toggleSidebar, draftContent, publishedContent } =
    useEditor();

  if (!leftSidebarOpen) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => toggleSidebar("left")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Content Sections</h2>
          <button
            onClick={() => toggleSidebar("left")}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage your website content</p>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const hasDraft = draftContent[section.id] && Object.keys(draftContent[section.id]).length > 0;
            const hasPublished = publishedContent[section.id] && Object.keys(publishedContent[section.id]).length > 0;
            const isActive = activeSection === section.id;

            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className={`p-2 rounded-lg ${section.color} text-white`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs opacity-75">{hasDraft ? "Draft" : hasPublished ? "Published" : "Empty"}</div>
                </div>
                {hasDraft && !isActive && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                {hasPublished && !hasDraft && !isActive && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">{SECTIONS.length} sections available</div>
      </div>
    </aside>
  );
}
