"use client";

import { useEditor } from "@/components/providers/EditorProvider";
import {
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TopToolbar() {
  const {
    previewMode,
    setPreviewMode,
    fullscreenPreview,
    setFullscreenPreview,
    saveStatus,
    publishStatus,
    saveDraft,
    publishContent,
    autoSaveEnabled,
    toggleAutoSave,
  } = useEditor();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/content"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">Preview:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`p-1.5 rounded transition-colors ${
                previewMode === "desktop" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              title="Desktop view"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode("tablet")}
              className={`p-1.5 rounded transition-colors ${
                previewMode === "tablet" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              title="Tablet view"
            >
              <DeviceTabletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded transition-colors ${
                previewMode === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              title="Mobile view"
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFullscreenPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Full Preview
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Auto-save toggle */}
        <button
          onClick={toggleAutoSave}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            autoSaveEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? "bg-green-500" : "bg-gray-400"}`}></div>
          <span className="text-sm font-medium">{autoSaveEnabled ? "Auto-save On" : "Auto-save Off"}</span>
        </button>

        {/* Save status indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm">Saving...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Saved</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Error</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveDraft}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Save Draft
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={publishContent}
            disabled={publishStatus === "publishing"}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CloudArrowUpIcon className="w-4 h-4" />
            {publishStatus === "publishing" ? "Publishing..." : "Publish"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
