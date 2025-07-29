"use client";
import { motion } from "framer-motion";
import { FiEdit, FiHome, FiBook, FiStar, FiLayers, FiGrid, FiUsers, FiMail, FiLink } from "react-icons/fi";
import { cn } from "@/lib/utils";
import React from "react";

export interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const SECTIONS: Section[] = [
  { id: "hero", label: "Hero", icon: <FiHome /> },
  { id: "about", label: "About", icon: <FiBook /> },
  { id: "why-weave", label: "Why Weave", icon: <FiStar /> },
  { id: "process", label: "Process", icon: <FiLayers /> },
  { id: "portfolio", label: "Portfolio", icon: <FiGrid /> },
  { id: "team", label: "Team", icon: <FiUsers /> },
  { id: "contact", label: "Contact", icon: <FiMail /> },
  { id: "footer", label: "Footer", icon: <FiLink /> },
];

interface SidebarNavProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  status: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activeSection, setActiveSection, status }) => (
  <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-blue-100 flex flex-col py-8 px-4 sticky top-0 h-screen shadow-2xl z-20">
    <div className="font-extrabold text-2xl mb-8 pl-2 text-blue-900 tracking-tight flex items-center gap-2">
      <FiEdit className="text-blue-500" /> CMS Editor
    </div>
    <nav className="flex-1 space-y-2">
      {SECTIONS.map((section) => (
        <motion.button
          key={section.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center gap-3 text-left px-5 py-3 rounded-xl font-semibold transition-all duration-200",
            activeSection === section.id
              ? "bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white shadow-lg"
              : "hover:bg-blue-100/60 text-blue-900/80"
          )}
          onClick={() => setActiveSection(section.id)}
        >
          <span className="text-xl">{section.icon}</span>
          <span>{section.label}</span>
          {status === "draft" && activeSection === section.id && (
            <span className="ml-auto inline-block bg-yellow-400/90 text-xs px-2 py-0.5 rounded-full">Draft</span>
          )}
          {status === "published" && activeSection === section.id && (
            <span className="ml-auto inline-block bg-green-500/90 text-xs px-2 py-0.5 rounded-full">Published</span>
          )}
        </motion.button>
      ))}
    </nav>
  </aside>
);

export default SidebarNav;
