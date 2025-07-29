"use client";
import React from "react";
import { FiEdit, FiEye } from "react-icons/fi";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavProps {
  activeTab: "edit" | "preview";
  setActiveTab: (tab: "edit" | "preview") => void;
  setFullscreenPreview: (val: boolean) => void;
  sectionId: string;
}

const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, setFullscreenPreview, sectionId }) => (
  <div className="flex items-center border-b bg-white/60 backdrop-blur px-10 py-4 sticky top-0 z-10 shadow">
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard/content"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
      >
        {/* You can add an icon here if desired */}
        Back to Dashboard
      </Link>
      <div className="font-bold text-2xl text-blue-900 tracking-tight flex items-center gap-2">
        {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
      </div>
    </div>
    <div className="flex gap-2 ml-auto">
      <button
        className={cn(
          "px-6 py-2 rounded-t-xl font-semibold border-b-4 transition flex items-center gap-2 text-lg",
          activeTab === "edit"
            ? "border-blue-600 text-blue-700 bg-blue-50/60"
            : "border-transparent text-blue-900/60 hover:bg-blue-100/40"
        )}
        onClick={() => setActiveTab("edit")}
      >
        <FiEdit /> Edit
      </button>
      <button
        className={cn(
          "px-6 py-2 rounded-t-xl font-semibold border-b-4 transition flex items-center gap-2 text-lg",
          activeTab === "preview"
            ? "border-blue-600 text-blue-700 bg-blue-50/60"
            : "border-transparent text-blue-900/60 hover:bg-blue-100/40"
        )}
        onClick={() => setFullscreenPreview(true)}
      >
        <FiEye /> Preview
      </button>
    </div>
  </div>
);

export default TopNav;
