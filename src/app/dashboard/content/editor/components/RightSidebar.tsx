"use client";

import { useEditor } from "@/components/providers/EditorProvider";
import {
  PencilIcon,
  PhotoIcon,
  ViewColumnsIcon,
  SwatchIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type EditMode = "text" | "image" | "layout" | "style";

const EDIT_MODES = [
  { id: "text" as const, label: "Text", icon: PencilIcon, color: "bg-blue-500" },
  { id: "image" as const, label: "Image", icon: PhotoIcon, color: "bg-green-500" },
  { id: "layout" as const, label: "Layout", icon: ViewColumnsIcon, color: "bg-purple-500" },
  { id: "style" as const, label: "Style", icon: SwatchIcon, color: "bg-orange-500" },
];

export default function RightSidebar() {
  const {
    editMode,
    setEditMode,
    rightSidebarOpen,
    toggleSidebar,
    selectedElement,
    activeSection,
    draftContent,
    updateContent,
  } = useEditor();

  if (!rightSidebarOpen) {
    return (
      <div className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => toggleSidebar("right")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    );
  }

  const currentContent = draftContent[activeSection] || {};

  const getStringValue = (key: string): string => {
    const value = currentContent[key];
    return typeof value === "string" ? value : "";
  };

  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <button
            onClick={() => toggleSidebar("right")}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {selectedElement ? `Editing: ${selectedElement}` : `Editing: ${activeSection}`}
        </p>
      </div>

      {/* Edit Mode Selector */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Edit Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {EDIT_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(mode.id)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                editMode === mode.id
                  ? "bg-blue-50 border-2 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className={`p-1 rounded ${mode.color} text-white`}>
                <mode.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        {editMode === "text" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Text Content</h3>

            {/* Dynamic text fields based on section */}
            {activeSection === "hero" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <textarea
                    value={getStringValue("tagline")}
                    onChange={(e) => updateContent(activeSection, { tagline: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Enter tagline..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                  <textarea
                    value={getStringValue("subheadline")}
                    onChange={(e) => updateContent(activeSection, { subheadline: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter subheadline..."
                  />
                </div>
              </div>
            )}

            {activeSection === "about" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={getStringValue("title")}
                    onChange={(e) => updateContent(activeSection, { title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={getStringValue("description")}
                    onChange={(e) => updateContent(activeSection, { description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter description..."
                  />
                </div>
              </div>
            )}

            {/* Add more section-specific text fields */}
          </div>
        )}

        {editMode === "image" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Image Management</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={getStringValue("imageUrl")}
                  onChange={(e) => updateContent(activeSection, { imageUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={getStringValue("altText")}
                  onChange={(e) => updateContent(activeSection, { altText: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter alt text..."
                />
              </div>

              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Image</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {editMode === "layout" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Layout Settings</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Layout Type</label>
                <select
                  value={getStringValue("layoutType") || "default"}
                  onChange={(e) => updateContent(activeSection, { layoutType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="centered">Centered</option>
                  <option value="left-aligned">Left Aligned</option>
                  <option value="right-aligned">Right Aligned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
                <select
                  value={getStringValue("spacing") || "normal"}
                  onChange={(e) => updateContent(activeSection, { spacing: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {editMode === "style" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Style Settings</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={getStringValue("backgroundColor") || "#ffffff"}
                  onChange={(e) => updateContent(activeSection, { backgroundColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <input
                  type="color"
                  value={getStringValue("textColor") || "#000000"}
                  onChange={(e) => updateContent(activeSection, { textColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                <select
                  value={getStringValue("fontSize") || "medium"}
                  onChange={(e) => updateContent(activeSection, { fontSize: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">Changes are auto-saved</div>
      </div>
    </aside>
  );
}
