"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayers,
  FiUser,
  FiGrid,
  FiUsers,
  FiBook,
  FiEdit,
  FiEye,
  FiSend,
  FiChevronRight,
  FiChevronLeft,
  FiHome,
  FiMail,
  FiLink,
  FiStar,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import dynamic from "next/dynamic";
import HeroSection from "./HeroSection";
import AboutPreview from "./AboutPreview";
import ProcessPreview from "./ProcessPreview";
import PortfolioPreview from "./PortfolioPreview";
import OurTeam from "./OurTeam";
import ContactCTA from "./ContactCTA";
import WhyWeave from "./WhyWeave";
import Footer, { FooterProps } from "./Footer";

import type { WhyWeaveProps } from "./WhyWeave";
import type { HeroSectionProps } from "./HeroSection";
import type { AboutPreviewProps } from "./AboutPreview";
import type { ProcessPreviewProps } from "./ProcessPreview";
import type { PortfolioPreviewProps } from "./PortfolioPreview";
import type { OurTeamProps } from "./OurTeam";
import type { ContactCTAProps } from "./ContactCTA";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: <FiHome /> },
  { id: "about", label: "About", icon: <FiBook /> },
  { id: "why-weave", label: "Why Weave", icon: <FiStar /> },
  { id: "process", label: "Process", icon: <FiLayers /> },
  { id: "portfolio", label: "Portfolio", icon: <FiGrid /> },
  { id: "team", label: "Team", icon: <FiUsers /> },
  { id: "contact", label: "Contact", icon: <FiMail /> },
  { id: "footer", label: "Footer", icon: <FiLink /> },
];

type ContentSectionEditorProps = {
  sectionId: string;
};

type ContentData = Record<string, unknown>;

type ContentStatus = "draft" | "published" | "unpublished";

function FileUploadField({
  value,
  onChange,
  label,
  name,
  fileState,
  setFileState,
}: {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  name: string;
  fileState: File | null;
  setFileState: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileState(file);
    setPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  const showPreview = preview && preview !== "";

  return (
    <div className="mb-2 w-full min-w-0">
      <label className="block text-xs font-medium mb-1 text-blue-900/80 truncate">{label}</label>
      <div className="flex flex-wrap items-center gap-4 min-w-0">
        <button
          type="button"
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 text-xs font-semibold transition min-w-[120px]"
          onClick={() => inputRef.current?.click()}
        >
          {fileState ? "Change Image" : value ? "Change Image" : "Upload Image"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {showPreview && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200 shadow flex-shrink-0">
            <Image src={preview!} alt={label} fill className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentSectionEditor({ sectionId }: ContentSectionEditorProps) {
  const [draft, setDraft] = useState<ContentData | null>(null);
  const [published, setPublished] = useState<ContentData | null>(null);
  const [status, setStatus] = useState<ContentStatus>("unpublished");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState(sectionId);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  // Use only NEXT_PUBLIC_SITE_URL for client-safe env
  const siteUrl = mounted ? process.env.NEXT_PUBLIC_SITE_URL : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add state for each image field (example for hero section)
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);

  // Add file state arrays for image uploads
  const [whyWeaveCardFiles, setWhyWeaveCardFiles] = useState<(File | null)[]>([]);
  const [portfolioItemFiles, setPortfolioItemFiles] = useState<(File | null)[]>([]);
  const [teamManagementFiles, setTeamManagementFiles] = useState<(File | null)[]>([]);
  const [teamAdminFiles, setTeamAdminFiles] = useState<(File | null)[]>([]);
  const [teamProductionFiles, setTeamProductionFiles] = useState<(File | null)[]>([]);

  // Add AllDraftData type and defaultAllDraftData

  type AllDraftData = {
    hero: HeroSectionProps;
    about: AboutPreviewProps;
    "why-weave": WhyWeaveProps;
    process: ProcessPreviewProps;
    portfolio: PortfolioPreviewProps;
    team: OurTeamProps;
    contact: ContactCTAProps;
    footer: FooterProps;
  };
  const defaultAllDraftData: AllDraftData = {
    hero: {},
    about: {},
    "why-weave": {},
    process: {},
    portfolio: {},
    team: {},
    contact: {},
    footer: {
      companyInfo: "",
      quickLinks: [],
      contactInfo: [],
    },
  };
  // Add state for allDraftData
  const [allDraftData, setAllDraftData] = useState<AllDraftData>(defaultAllDraftData);

  // Add state to track contentId for the current section
  const [contentId, setContentId] = useState<string | null>(null);

  // Prevent background scroll when fullscreen preview is active
  useEffect(() => {
    if (!mounted) return;
    if (fullscreenPreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenPreview, mounted]);

  // Calculate preview scale for fullscreen overlay based on content size
  useEffect(() => {
    if (!mounted) return;
    function calcScale() {
      const frameWidth = 1200;
      const frameHeight = 750;
      let contentWidth = frameWidth;
      let contentHeight = frameHeight;
      if (previewContentRef.current) {
        contentWidth = previewContentRef.current.scrollWidth;
        contentHeight = previewContentRef.current.scrollHeight;
      }
      const scale = Math.min(window.innerWidth / contentWidth, (window.innerHeight - 40) / contentHeight, 1);
      setPreviewScale(scale);
    }
    if (fullscreenPreview) {
      calcScale();
      window.addEventListener("resize", calcScale);
      // Recalc on content changes
      const observer = new MutationObserver(calcScale);
      if (previewContentRef.current) {
        observer.observe(previewContentRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      }
      return () => {
        window.removeEventListener("resize", calcScale);
        observer.disconnect();
      };
    }
  }, [fullscreenPreview, sectionId, mounted, JSON.stringify(draft)]);

  // When entering fullscreenPreview, fetch all draft data for all sections
  useEffect(() => {
    if (!fullscreenPreview || !mounted) return;
    const fetchAllDrafts = async () => {
      const sectionIds = ["hero", "about", "why-weave", "process", "portfolio", "team", "contact", "footer"];
      const results: Partial<AllDraftData> = {};
      await Promise.all(
        sectionIds.map(async (id) => {
          const res = await fetch(`/api/content/${id}`);
          const data = await res.json();
          results[id as keyof AllDraftData] = data?.draftData || {};
        })
      );
      setAllDraftData((prev) => ({ ...prev, ...results }));
    };
    fetchAllDrafts();
  }, [fullscreenPreview, mounted]);

  // Helper to upload a file and return the URL
  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url || null;
  }

  // Update useEffect to fetch content by section and store _id
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/content?section=${activeSection}`)
      .then((res) => res.json())
      .then((data) => {
        const content = Array.isArray(data) ? data[0] : data;
        setDraft(content?.draftData || {});
        setPublished(content?.publishedData || {});
        setStatus(content?.status || "unpublished");
        setContentId(content?._id || null);
        setLoading(false);
      })
      .catch(() => {
        setDraft({});
        setPublished({});
        setStatus("unpublished");
        setContentId(null);
        setLoading(false);
      });
  }, [activeSection]);

  useEffect(() => {
    if (activeTab !== "preview") return;
    const wrapper = previewWrapperRef.current;
    const content = previewContentRef.current;
    if (!wrapper || !content) return;
    function updateScale() {
      if (!wrapper || !content) return;
      const wrapperWidth = wrapper.clientWidth;
      const contentWidth = content.scrollWidth;
      let scale = 1;
      if (contentWidth > wrapperWidth && wrapperWidth > 0) {
        scale = wrapperWidth / contentWidth;
      }
      wrapper.style.setProperty("--preview-scale", String(scale));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [activeTab, activeSection, draft]);

  function handleDraftChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(field: string, url: string) {
    setDraft((prev) => ({ ...prev, [field]: url }));
  }

  function handleArrayChange(field: string, value: Record<string, string>[]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleArrayAdd(field: string, item: Record<string, string>) {
    setDraft((prevRaw) => {
      const prev = prevRaw ?? {};
      const arr = Array.isArray(prev[field]) ? (prev[field] as Record<string, string>[]) : [];
      return {
        ...prev,
        [field]: [...arr, item],
      };
    });
  }

  function handleArrayRemove(field: string, index: number) {
    setDraft((prevRaw) => {
      const prev = prevRaw ?? {};
      const arr = Array.isArray(prev[field]) ? (prev[field] as Record<string, string>[]) : [];
      return {
        ...prev,
        [field]: arr.filter((_, i) => i !== index),
      };
    });
  }

  // Update handleSaveDraft to upsert
  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const updatedDraft = { ...draft };
    if (beforeImageFile) {
      const url = await uploadImage(beforeImageFile);
      if (url) updatedDraft.beforeImage = url;
      setBeforeImageFile(null);
    }
    if (afterImageFile) {
      const url = await uploadImage(afterImageFile);
      if (url) updatedDraft.afterImage = url;
      setAfterImageFile(null);
    }
    let ok = false;
    let newId = contentId;
    // Try PATCH by _id if known
    if (contentId) {
      const res = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftData: updatedDraft }),
      });
      ok = res.ok;
      if (res.status === 404) newId = null;
    }
    // If no _id or PATCH failed, POST to create
    if (!ok) {
      const res = await fetch(`/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeSection, data: updatedDraft }),
      });
      ok = res.ok;
      if (ok) {
        const data = await res.json();
        newId = data._id;
      }
    }
    if (ok) {
      setSuccess("Draft saved");
      setDraft(updatedDraft);
      setContentId(newId || null);
    } else {
      setError("Failed to save draft");
    }
    setSaving(false);
  }

  async function handlePublish() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const updatedDraft = { ...draft };
    if (beforeImageFile) {
      const url = await uploadImage(beforeImageFile);
      if (url) updatedDraft.beforeImage = url;
      setBeforeImageFile(null);
    }
    if (afterImageFile) {
      const url = await uploadImage(afterImageFile);
      if (url) updatedDraft.afterImage = url;
      setAfterImageFile(null);
    }
    let ok = false;
    let newId = contentId;
    // Try PATCH by _id if known
    if (contentId) {
      const res = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", draftData: updatedDraft }),
      });
      ok = res.ok;
      if (res.status === 404) newId = null;
      if (ok) {
        const data = await res.json();
        setDraft(data?.draftData || {});
        setPublished(data?.publishedData || {});
        setStatus(data?.status || "unpublished");
      }
    }
    // If no _id or PATCH failed, POST to create (publish = create and set publishedData)
    if (!ok) {
      const res = await fetch(`/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeSection, data: updatedDraft }),
      });
      ok = res.ok;
      if (ok) {
        const data = await res.json();
        newId = data._id;
        setDraft(data?.draftData || {});
        setPublished(data?.publishedData || {});
        setStatus(data?.status || "unpublished");
      }
    }
    if (ok) {
      setSuccess("Published");
      setContentId(newId || null);
    } else {
      setError("Failed to publish");
    }
    setSaving(false);
  }

  async function handleRevert() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    let ok = false;
    let newId = contentId;
    // Try PATCH by _id if known
    if (contentId) {
      const res = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert" }),
      });
      ok = res.ok;
      if (res.status === 404) newId = null;
      if (ok) {
        const data = await res.json();
        setDraft({}); // Clear draftData after revert
        setPublished(data?.publishedData || {});
        setStatus(data?.status || "unpublished");
      }
    }
    // If no _id or PATCH failed, POST to create (revert to published is a no-op if not exists)
    if (!ok) {
      setError("Nothing to revert. No published content exists for this section.");
    } else {
      setSuccess("Reverted to published");
      setContentId(newId || null);
    }
    setSaving(false);
  }

  function renderFields() {
    if (!draft) return null;
    switch (activeSection) {
      case "hero":
        return (
          <>
            <FileUploadField
              label="Before Image"
              name="beforeImage"
              value={typeof draft.beforeImage === "string" ? draft.beforeImage : undefined}
              onChange={(url) => handleFileChange("beforeImage", url)}
              fileState={beforeImageFile}
              setFileState={setBeforeImageFile}
            />
            <FileUploadField
              label="After Image"
              name="afterImage"
              value={typeof draft.afterImage === "string" ? draft.afterImage : undefined}
              onChange={(url) => handleFileChange("afterImage", url)}
              fileState={afterImageFile}
              setFileState={setAfterImageFile}
            />
            <input
              type="text"
              name="subheadline"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Subheadline"
              value={typeof draft.subheadline === "string" ? draft.subheadline : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta1Text"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 1 Text"
              value={typeof draft.cta1Text === "string" ? draft.cta1Text : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta1Link"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 1 Link"
              value={typeof draft.cta1Link === "string" ? draft.cta1Link : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta2Text"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 2 Text"
              value={typeof draft.cta2Text === "string" ? draft.cta2Text : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta2Link"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 2 Link"
              value={typeof draft.cta2Link === "string" ? draft.cta2Link : ""}
              onChange={handleDraftChange}
            />
          </>
        );
      case "why-weave":
        return (
          <>
            <input
              type="text"
              name="heading"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Section Heading"
              value={typeof draft.heading === "string" ? draft.heading : ""}
              onChange={handleDraftChange}
            />
            {(Array.isArray(draft.cards) ? draft.cards : []).map(
              (card: { title: string; description: string; image: string }, idx: number) => (
                <div
                  key={card.title ? `${idx}-${card.title}` : `card-${idx}`}
                  className="mb-4 border rounded-lg p-3 bg-white/50"
                >
                  <input
                    type="text"
                    name={`cards.${idx}.title`}
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Card Title"
                    value={card.title}
                    onChange={handleDraftChange}
                  />
                  <textarea
                    name={`cards.${idx}.description`}
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Card Description"
                    value={card.description}
                    onChange={handleDraftChange}
                    rows={2}
                  />
                  <FileUploadField
                    label="Card Image"
                    name={`cards.${idx}.image`}
                    value={card.image}
                    onChange={(url) =>
                      handleArrayChange(
                        "cards",
                        (draft.cards as { title: string; description: string; image: string }[]).map((c, i) =>
                          i === idx ? { ...c, image: url } : c
                        )
                      )
                    }
                    fileState={whyWeaveCardFiles[idx] || null}
                    setFileState={(file) =>
                      setWhyWeaveCardFiles((prev) => {
                        const arr = [...prev];
                        arr[idx] = file;
                        return arr;
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleArrayRemove("cards", idx);
                      setWhyWeaveCardFiles((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 mt-2"
                  >
                    Remove Card
                  </button>
                </div>
              )
            )}
            <button
              type="button"
              onClick={() => {
                handleArrayAdd("cards", { title: "", description: "", image: "" });
                setWhyWeaveCardFiles((prev) => [...prev, null]);
              }}
              className="text-blue-600 mb-4"
            >
              Add Card
            </button>
          </>
        );
      case "process":
        return renderArrayField(
          "Steps",
          Array.isArray(draft?.steps) ? (draft.steps as Record<string, string>[]) : [],
          [
            { name: "number", label: "Step Number", type: "text" },
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "text" },
          ],
          (items) => handleArrayChange("steps", items)
        );
      case "portfolio":
        return (
          <>
            {(Array.isArray(draft.items) ? draft.items : []).map(
              (item: { title: string; category: string; image: string }, idx: number) => (
                <div
                  key={item.title ? `${idx}-${item.title}` : `item-${idx}`}
                  className="mb-4 border rounded-lg p-3 bg-white/50"
                >
                  <input
                    type="text"
                    name={`items.${idx}.title`}
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Project Title"
                    value={item.title}
                    onChange={handleDraftChange}
                  />
                  <input
                    type="text"
                    name={`items.${idx}.category`}
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Category"
                    value={item.category}
                    onChange={handleDraftChange}
                  />
                  <FileUploadField
                    label="Project Image"
                    name={`items.${idx}.image`}
                    value={item.image}
                    onChange={(url) =>
                      handleArrayChange(
                        "items",
                        (draft.items as { title: string; category: string; image: string }[]).map((c, i) =>
                          i === idx ? { ...c, image: url } : c
                        )
                      )
                    }
                    fileState={portfolioItemFiles[idx] || null}
                    setFileState={(file) =>
                      setPortfolioItemFiles((prev) => {
                        const arr = [...prev];
                        arr[idx] = file;
                        return arr;
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleArrayRemove("items", idx);
                      setPortfolioItemFiles((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 mt-2"
                  >
                    Remove Project
                  </button>
                </div>
              )
            )}
            <button
              type="button"
              onClick={() => {
                handleArrayAdd("items", { title: "", category: "", image: "" });
                setPortfolioItemFiles((prev) => [...prev, null]);
              }}
              className="text-blue-600 mb-4"
            >
              Add Project
            </button>
          </>
        );
      case "team":
        return (
          <>
            <div className="mb-6">
              <div className="font-bold text-lg mb-2">Management</div>
              {(Array.isArray(draft.management) ? draft.management : []).map(
                (member: { name: string; role: string; image: string }, idx: number) => (
                  <div
                    key={member.name ? `${idx}-${member.name}` : `management-${idx}`}
                    className="mb-4 border rounded-lg p-3 bg-white/50"
                  >
                    <input
                      type="text"
                      name={`management.${idx}.name`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Name"
                      value={member.name}
                      onChange={handleDraftChange}
                    />
                    <input
                      type="text"
                      name={`management.${idx}.role`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Role"
                      value={member.role}
                      onChange={handleDraftChange}
                    />
                    <FileUploadField
                      label="Profile Image"
                      name={`management.${idx}.image`}
                      value={member.image}
                      onChange={(url) =>
                        handleArrayChange(
                          "management",
                          (draft.management as { name: string; role: string; image: string }[]).map((m, i) =>
                            i === idx ? { ...m, image: url } : m
                          )
                        )
                      }
                      fileState={teamManagementFiles[idx] || null}
                      setFileState={(file) =>
                        setTeamManagementFiles((prev) => {
                          const arr = [...prev];
                          arr[idx] = file;
                          return arr;
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleArrayRemove("management", idx);
                        setTeamManagementFiles((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-red-500 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  handleArrayAdd("management", { name: "", role: "", image: "" });
                  setTeamManagementFiles((prev) => [...prev, null]);
                }}
                className="text-blue-600 mb-4"
              >
                Add Management
              </button>
            </div>
            <div className="mb-6">
              <div className="font-bold text-lg mb-2">Admin</div>
              {(Array.isArray(draft.admin) ? draft.admin : []).map(
                (member: { name: string; role: string; image: string }, idx: number) => (
                  <div
                    key={member.name ? `${idx}-${member.name}` : `admin-${idx}`}
                    className="mb-4 border rounded-lg p-3 bg-white/50"
                  >
                    <input
                      type="text"
                      name={`admin.${idx}.name`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Name"
                      value={member.name}
                      onChange={handleDraftChange}
                    />
                    <input
                      type="text"
                      name={`admin.${idx}.role`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Role"
                      value={member.role}
                      onChange={handleDraftChange}
                    />
                    <FileUploadField
                      label="Profile Image"
                      name={`admin.${idx}.image`}
                      value={member.image}
                      onChange={(url) =>
                        handleArrayChange(
                          "admin",
                          (draft.admin as { name: string; role: string; image: string }[]).map((m, i) =>
                            i === idx ? { ...m, image: url } : m
                          )
                        )
                      }
                      fileState={teamAdminFiles[idx] || null}
                      setFileState={(file) =>
                        setTeamAdminFiles((prev) => {
                          const arr = [...prev];
                          arr[idx] = file;
                          return arr;
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleArrayRemove("admin", idx);
                        setTeamAdminFiles((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-red-500 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  handleArrayAdd("admin", { name: "", role: "", image: "" });
                  setTeamAdminFiles((prev) => [...prev, null]);
                }}
                className="text-blue-600 mb-4"
              >
                Add Admin
              </button>
            </div>
            <div className="mb-6">
              <div className="font-bold text-lg mb-2">Production</div>
              {(Array.isArray(draft.production) ? draft.production : []).map(
                (member: { name: string; role: string; image: string }, idx: number) => (
                  <div
                    key={member.name ? `${idx}-${member.name}` : `production-${idx}`}
                    className="mb-4 border rounded-lg p-3 bg-white/50"
                  >
                    <input
                      type="text"
                      name={`production.${idx}.name`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Name"
                      value={member.name}
                      onChange={handleDraftChange}
                    />
                    <input
                      type="text"
                      name={`production.${idx}.role`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Role"
                      value={member.role}
                      onChange={handleDraftChange}
                    />
                    <FileUploadField
                      label="Profile Image"
                      name={`production.${idx}.image`}
                      value={member.image}
                      onChange={(url) =>
                        handleArrayChange(
                          "production",
                          (draft.production as { name: string; role: string; image: string }[]).map((m, i) =>
                            i === idx ? { ...m, image: url } : m
                          )
                        )
                      }
                      fileState={teamProductionFiles[idx] || null}
                      setFileState={(file) =>
                        setTeamProductionFiles((prev) => {
                          const arr = [...prev];
                          arr[idx] = file;
                          return arr;
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleArrayRemove("production", idx);
                        setTeamProductionFiles((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-red-500 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  handleArrayAdd("production", { name: "", role: "", image: "" });
                  setTeamProductionFiles((prev) => [...prev, null]);
                }}
                className="text-blue-600 mb-4"
              >
                Add Production
              </button>
            </div>
          </>
        );
      case "contact":
        return (
          <>
            <input
              type="text"
              name="heading"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Heading"
              value={typeof draft.heading === "string" ? draft.heading : ""}
              onChange={handleDraftChange}
            />
            <textarea
              name="description"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Description"
              value={typeof draft.description === "string" ? draft.description : ""}
              onChange={handleDraftChange}
              rows={3}
            />
            <input
              type="text"
              name="cta1Text"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 1 Text"
              value={typeof draft.cta1Text === "string" ? draft.cta1Text : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta1Link"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 1 Link"
              value={typeof draft.cta1Link === "string" ? draft.cta1Link : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta2Text"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 2 Text"
              value={typeof draft.cta2Text === "string" ? draft.cta2Text : ""}
              onChange={handleDraftChange}
            />
            <input
              type="text"
              name="cta2Link"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="CTA 2 Link"
              value={typeof draft.cta2Link === "string" ? draft.cta2Link : ""}
              onChange={handleDraftChange}
            />
            {renderArrayField(
              "Stats",
              Array.isArray(draft?.stats) ? (draft.stats as Record<string, string>[]) : [],
              [
                { name: "label", label: "Label", type: "text" },
                { name: "value", label: "Value", type: "text" },
              ],
              (items) => handleArrayChange("stats", items)
            )}
          </>
        );
      case "footer":
        return (
          <>
            <input
              type="text"
              name="companyInfo"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Company Info"
              value={typeof draft.companyInfo === "string" ? draft.companyInfo : ""}
              onChange={handleDraftChange}
            />
            <div className="mb-2">
              <div className="font-semibold mb-1">Quick Links</div>
              {(Array.isArray(draft.quickLinks) ? draft.quickLinks : []).map(
                (link: { label: string; href: string }, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      name={`quickLinks.${idx}.label`}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Label"
                      value={link.label}
                      onChange={handleDraftChange}
                    />
                    <input
                      type="text"
                      name={`quickLinks.${idx}.href`}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Href"
                      value={link.href}
                      onChange={handleDraftChange}
                    />
                    <button type="button" onClick={() => handleArrayRemove("quickLinks", idx)} className="text-red-500">
                      Remove
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => handleArrayAdd("quickLinks", { label: "", href: "" })}
                className="text-blue-600"
              >
                Add Link
              </button>
            </div>
            <div className="mb-2">
              <div className="font-semibold mb-1">Contact Info</div>
              {(Array.isArray(draft.contactInfo) ? draft.contactInfo : []).map(
                (info: { label: string; value: string }, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      name={`contactInfo.${idx}.label`}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Label"
                      value={info.label}
                      onChange={handleDraftChange}
                    />
                    <input
                      type="text"
                      name={`contactInfo.${idx}.value`}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Value"
                      value={info.value}
                      onChange={handleDraftChange}
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("contactInfo", idx)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => handleArrayAdd("contactInfo", { label: "", value: "" })}
                className="text-blue-600"
              >
                Add Contact
              </button>
            </div>
          </>
        );
      case "about":
        return (
          <>
            <textarea
              name="paragraph1"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Paragraph 1"
              value={typeof draft.paragraph1 === "string" ? draft.paragraph1 : ""}
              onChange={handleDraftChange}
              rows={4}
            />
            <textarea
              name="paragraph2"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Paragraph 2"
              value={typeof draft.paragraph2 === "string" ? draft.paragraph2 : ""}
              onChange={handleDraftChange}
              rows={4}
            />
            <input
              type="text"
              name="ctaLink"
              className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
              placeholder="Call to Action Link"
              value={typeof draft.ctaLink === "string" ? draft.ctaLink : ""}
              onChange={handleDraftChange}
            />
            <div className="flex gap-4">
              <input
                type="number"
                name="yearsExperience"
                className="w-full border rounded px-3 py-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
                placeholder="Years Experience"
                value={
                  typeof draft.yearsExperience === "number"
                    ? draft.yearsExperience
                    : draft?.yearsExperience
                    ? String(draft.yearsExperience)
                    : ""
                }
                onChange={handleDraftChange}
              />
              <input
                type="number"
                name="projectsCompleted"
                className="w-full border rounded px-3 py-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
                placeholder="Projects Completed"
                value={
                  typeof draft.projectsCompleted === "number"
                    ? draft.projectsCompleted
                    : draft?.projectsCompleted
                    ? String(draft.projectsCompleted)
                    : ""
                }
                onChange={handleDraftChange}
              />
            </div>
          </>
        );
      default:
        return <div className="text-blue-900/60">No editor for this section yet.</div>;
    }
  }

  function renderPreview() {
    let previewContent: React.ReactNode = null;
    switch (activeSection) {
      case "hero":
        previewContent = <HeroSection {...(draft as HeroSectionProps)} />;
        break;
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
        previewContent = <PortfolioPreview {...(draft as PortfolioPreviewProps)} />;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative bg-gradient-to-br from-white/80 to-blue-50/60 border border-blue-100 rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center overflow-auto"
      >
        <div className="absolute -top-4 -left-4 bg-blue-200/40 w-16 h-16 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -right-4 bg-indigo-200/40 w-24 h-24 rounded-full blur-2xl" />
        <div className="w-full max-w-2xl mx-auto">{previewContent}</div>
      </motion.div>
    );
  }

  function renderArrayField(
    label: string,
    items: Record<string, string>[],
    fields: { name: string; label: string; type: "text" | "image" }[],
    onChange: (items: Record<string, string>[]) => void,
    // Add image upload logic for each item
    renderImageUploadField?: (index: number, onChangeImage: (url: string) => void) => React.ReactNode
  ) {
    return (
      <div className="mb-4">
        <div className="font-semibold mb-2 text-blue-900/80 flex items-center gap-2">
          <FiGrid className="inline-block text-blue-400" /> {label}
        </div>
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            className="flex gap-2 mb-2 items-end bg-white/60 backdrop-blur rounded-lg p-2 shadow"
          >
            {fields.map((field) => (
              <div key={field.name} className="flex-1">
                <label className="block text-xs font-medium mb-1 text-blue-900/60">{field.label}</label>
                <input
                  type="text"
                  value={item[field.name] || ""}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx][field.name] = e.target.value;
                    onChange(newItems);
                  }}
                  className="block w-full border rounded px-2 py-1 bg-white/80 placeholder:text-blue-900/30"
                  placeholder={field.type === "image" ? "Image URL or path" : undefined}
                />
              </div>
            ))}
            {renderImageUploadField &&
              renderImageUploadField(idx, (url) => {
                const newItems = [...items];
                newItems[idx].image = url;
                onChange(newItems);
              })}
            <button
              type="button"
              className="text-red-600 font-bold px-2 hover:scale-110 transition"
              onClick={() => {
                const newItems = items.filter((_, i) => i !== idx);
                onChange(newItems);
              }}
            >
              Remove
            </button>
          </motion.div>
        ))}
        <button
          type="button"
          className="text-blue-600 font-semibold mt-1 hover:underline hover:scale-105 transition"
          onClick={() => {
            onChange([...items, {}]);
          }}
        >
          Add {label.slice(0, -1)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] bg-gradient-to-br from-blue-50/60 to-white/80">
      {/* Sidebar Navigation */}
      {!fullscreenPreview && (
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
                  <span className="ml-auto inline-block bg-green-500/90 text-xs px-2 py-0.5 rounded-full">
                    Published
                  </span>
                )}
              </motion.button>
            ))}
          </nav>
        </aside>
      )}
      {/* Main Content */}
      <main className={fullscreenPreview ? "flex-1" : "flex-1 flex flex-col"}>
        {/* Top Tab Navigation */}
        {!fullscreenPreview && (
          <div className="flex items-center border-b bg-white/60 backdrop-blur px-10 py-4 sticky top-0 z-10 shadow">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/content"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="font-bold text-2xl text-blue-900 tracking-tight flex items-center gap-2">
                {SECTIONS.find((s) => s.id === activeSection)?.icon}
                {SECTIONS.find((s) => s.id === activeSection)?.label}
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
        )}
        {/* Card Layout with Side-by-Side Edit/Preview */}
        <div
          className={
            fullscreenPreview
              ? "fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-hidden"
              : "flex-1 flex flex-col md:flex-row gap-8 p-10 bg-gradient-to-br from-white/80 to-blue-50/60"
          }
          style={fullscreenPreview ? { overscrollBehavior: "none" } : {}}
        >
          {fullscreenPreview && mounted && (
            <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
              <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                {siteUrl && <span className="ml-4 text-xs text-gray-500 select-none">{siteUrl}</span>}
                <button
                  onClick={() => setFullscreenPreview(false)}
                  className="ml-auto px-4 py-1 rounded bg-white shadow text-blue-900 font-semibold border border-blue-200 hover:bg-blue-50 transition"
                >
                  Exit Preview
                </button>
              </div>
              <div className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden bg-white flex flex-col items-center justify-start">
                <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-start">
                  {/* Render the full homepage preview, not just a single section */}
                  <main className="min-h-screen w-full" id="main-content" aria-label="Main content">
                    <section aria-labelledby="hero-heading">
                      <HeroSection {...allDraftData.hero} />
                      <AboutPreview {...allDraftData.about} />
                    </section>
                    <WhyWeave {...allDraftData["why-weave"]} />
                    <section aria-labelledby="process-heading">
                      <ProcessPreview {...allDraftData.process} />
                    </section>
                    <section aria-labelledby="team-heading">
                      <OurTeam {...allDraftData.team} />
                    </section>
                    <section aria-labelledby="portfolio-heading">
                      <PortfolioPreview {...allDraftData.portfolio} />
                    </section>
                    <section aria-labelledby="contact-heading">
                      <ContactCTA {...allDraftData.contact} />
                    </section>
                    {typeof Footer !== "undefined" && <Footer {...allDraftData.footer} />}
                  </main>
                </div>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {activeTab === "edit" && (
              <motion.div
                key={"editor" + activeSection}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex-1 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 max-w-md mx-auto border border-blue-100 relative"
              >
                {loading ? (
                  <div className="animate-pulse h-40 bg-blue-100/60 rounded-xl" />
                ) : activeTab === "edit" ? (
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveDraft();
                    }}
                  >
                    {error && <div className="text-red-600 mb-2 font-semibold">{error}</div>}
                    {success && <div className="text-green-600 mb-2 font-semibold">{success}</div>}
                    {renderFields()}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="fixed md:static left-0 right-0 bottom-0 md:bottom-auto z-30 bg-white/80 backdrop-blur-xl border-t border-blue-100 flex flex-row flex-wrap gap-x-2 gap-y-2 px-4 py-3 md:rounded-b-3xl shadow-2xl md:shadow-none justify-center items-center mt-4"
                    >
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-600 disabled:opacity-60 flex items-center gap-2 transition min-w-[80px]"
                        disabled={saving}
                      >
                        <FiSend /> {saving ? "Saving..." : "Draft"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 flex items-center gap-2 transition min-w-[80px]"
                        onClick={handlePublish}
                        disabled={saving}
                      >
                        <FiChevronRight /> Publish
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg font-semibold shadow hover:from-gray-500 hover:to-gray-700 disabled:opacity-60 flex items-center gap-2 transition min-w-[80px]"
                        onClick={handleRevert}
                        disabled={saving}
                      >
                        <FiChevronLeft /> Revert
                      </button>
                    </motion.div>
                  </form>
                ) : (
                  renderPreview()
                )}
              </motion.div>
            )}
            <motion.div
              key={"preview" + activeSection + activeTab}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={
                activeTab === "preview"
                  ? "flex-1 w-full max-w-7xl mx-auto min-h-[600px] flex items-center justify-center"
                  : "flex-1 hidden md:flex items-center justify-center max-w-3xl"
              }
              style={activeTab === "preview" ? { minWidth: 0 } : {}}
            >
              <div
                ref={previewWrapperRef}
                className="w-full max-w-5xl mx-auto overflow-x-hidden flex items-center justify-center"
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    ref={previewContentRef}
                    className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden group cursor-pointer"
                    style={{
                      width: "1200px",
                      height: "750px",
                      aspectRatio: "16/10",
                      background: "#fff",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      transform: "scale(var(--preview-scale, 1))",
                      transformOrigin: "top center",
                      transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                    }}
                  >
                    <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                      {siteUrl && <span className="ml-4 text-xs text-gray-500 select-none">{siteUrl}</span>}
                    </div>
                    <div className="flex-1 overflow-auto min-w-0 min-h-0">{renderPreview()}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
