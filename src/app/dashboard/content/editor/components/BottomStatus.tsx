"use client";

import { useEditor } from "@/components/providers/EditorProvider";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function BottomStatus() {
  const { saveStatus, publishStatus, activeSection, autoSaveEnabled } = useEditor();

  const getStatusIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "saving":
        return <ClockIcon className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "error":
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case "saved":
        return "All changes saved";
      case "saving":
        return "Saving changes...";
      case "error":
        return "Error saving changes";
      default:
        return "Ready to edit";
    }
  };

  const getPublishStatusText = () => {
    switch (publishStatus) {
      case "published":
        return "Published";
      case "publishing":
        return "Publishing...";
      case "unpublished":
        return "Not published";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-6 text-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-gray-700">{getStatusText()}</span>
        </div>

        <div className="h-4 w-px bg-gray-300"></div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">Auto-save:</span>
          <span className={`font-medium ${autoSaveEnabled ? "text-green-600" : "text-gray-400"}`}>
            {autoSaveEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Section:</span>
          <span className="font-medium text-gray-700 capitalize">{activeSection.replace("-", " ")}</span>
        </div>

        <div className="h-4 w-px bg-gray-300"></div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">Status:</span>
          <span
            className={`font-medium ${
              publishStatus === "published"
                ? "text-green-600"
                : publishStatus === "publishing"
                ? "text-yellow-600"
                : "text-gray-400"
            }`}
          >
            {getPublishStatusText()}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <span>Keyboard shortcuts:</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
          <span>Save,</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+P</kbd>
          <span>Publish</span>
        </div>
      </div>
    </div>
  );
}
