"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { getContentSection, updateContentSection, publishContentSection } from "@/utils/api";

// Define content data types
interface ContentData {
  [key: string]: string | number | boolean | ContentData | ContentData[];
}

// API response structure
interface ContentSectionApiResponse {
  section: string;
  draftData: ContentData;
  publishedData: ContentData;
  status: "draft" | "published" | "unpublished";
  version: number;
  lastEditedBy: string;
  lastEditedAt: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface EditorContextType {
  // Current editing state
  activeSection: string;
  selectedElement: string | null;
  editMode: "text" | "image" | "layout" | "style";

  // Content state
  draftContent: Record<string, ContentData>;
  publishedContent: Record<string, ContentData>;

  // UI state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  previewMode: "desktop" | "tablet" | "mobile";
  fullscreenPreview: boolean;

  // Workflow state
  saveStatus: "saved" | "saving" | "error";
  publishStatus: "published" | "unpublished" | "publishing";
  autoSaveEnabled: boolean;

  // Actions
  setActiveSection: (section: string) => void;
  selectElement: (elementId: string | null) => void;
  setEditMode: (mode: "text" | "image" | "layout" | "style") => void;
  updateContent: (section: string, data: ContentData) => void;
  saveDraft: () => Promise<void>;
  publishContent: () => Promise<void>;
  toggleSidebar: (side: "left" | "right") => void;
  setPreviewMode: (mode: "desktop" | "tablet" | "mobile") => void;
  setFullscreenPreview: (enabled: boolean) => void;
  toggleAutoSave: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  // Current editing state
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"text" | "image" | "layout" | "style">("text");

  // Content state
  const [draftContent, setDraftContent] = useState<Record<string, ContentData>>({});
  const [publishedContent, setPublishedContent] = useState<Record<string, ContentData>>({});

  // UI state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [fullscreenPreview, setFullscreenPreview] = useState<boolean>(false);

  // Workflow state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [publishStatus, setPublishStatus] = useState<"published" | "unpublished" | "publishing">("unpublished");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial content for all sections
  useEffect(() => {
    const loadAllContent = async () => {
      const sections = ["hero", "about", "why-weave", "process", "portfolio", "team", "contact", "footer"];

      for (const section of sections) {
        try {
          const response = await getContentSection(section);
          const data = response.data;

          if (data && typeof data === "object") {
            // Handle the actual API response structure
            const responseData = data as unknown as Record<string, unknown>;
            const draftData = (responseData.draftData as ContentData) || {};
            const publishedData = (responseData.publishedData as ContentData) || {};

            setDraftContent((prev) => ({
              ...prev,
              [section]: draftData,
            }));
            setPublishedContent((prev) => ({
              ...prev,
              [section]: publishedData,
            }));
          }
        } catch (error) {
          console.error(`Failed to load content for ${section}:`, error);
        }
      }
    };

    loadAllContent();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      if (draftContent[activeSection] && Object.keys(draftContent[activeSection]).length > 0) {
        handleSaveDraft();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [draftContent, activeSection, autoSaveEnabled]);

  // Actions
  const handleSetActiveSection = useCallback((section: string) => {
    setActiveSection(section);
    setSelectedElement(null);
  }, []);

  const handleSelectElement = useCallback((elementId: string | null) => {
    setSelectedElement(elementId);
  }, []);

  const handleUpdateContent = useCallback((section: string, data: ContentData) => {
    setDraftContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
    setSaveStatus("saving");
  }, []);

  const handleSaveDraft = useCallback(async () => {
    try {
      setSaveStatus("saving");
      const currentDraft = draftContent[activeSection];

      if (currentDraft && Object.keys(currentDraft).length > 0) {
        await updateContentSection(activeSection, { draftData: currentDraft });
        setSaveStatus("saved");
        console.log(`Draft saved for ${activeSection}:`, currentDraft);
      }
    } catch (error) {
      setSaveStatus("error");
      console.error("Failed to save draft:", error);
    }
  }, [activeSection, draftContent]);

  const handlePublishContent = useCallback(async () => {
    try {
      setPublishStatus("publishing");
      await publishContentSection(activeSection);
      setPublishStatus("published");
      setSaveStatus("saved");

      // Refresh published content
      const response = await getContentSection(activeSection);
      const data = response.data;
      if (data && typeof data === "object") {
        const responseData = data as unknown as Record<string, unknown>;
        const publishedData = (responseData.publishedData as ContentData) || {};
        setPublishedContent((prev) => ({
          ...prev,
          [activeSection]: publishedData,
        }));
      }
    } catch (error) {
      setPublishStatus("unpublished");
      console.error("Failed to publish content:", error);
    }
  }, [activeSection]);

  const handleToggleSidebar = useCallback((side: "left" | "right") => {
    if (side === "left") {
      setLeftSidebarOpen((prev) => !prev);
    } else {
      setRightSidebarOpen((prev) => !prev);
    }
  }, []);

  const handleToggleAutoSave = useCallback(() => {
    setAutoSaveEnabled((prev) => !prev);
  }, []);

  const value: EditorContextType = {
    // State
    activeSection,
    selectedElement,
    editMode,
    draftContent,
    publishedContent,
    leftSidebarOpen,
    rightSidebarOpen,
    previewMode,
    fullscreenPreview,
    saveStatus,
    publishStatus,
    autoSaveEnabled,

    // Actions
    setActiveSection: handleSetActiveSection,
    selectElement: handleSelectElement,
    setEditMode,
    updateContent: handleUpdateContent,
    saveDraft: handleSaveDraft,
    publishContent: handlePublishContent,
    toggleSidebar: handleToggleSidebar,
    setPreviewMode,
    setFullscreenPreview,
    toggleAutoSave: handleToggleAutoSave,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
