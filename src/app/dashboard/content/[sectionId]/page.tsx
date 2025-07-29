"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SidebarNav, PreviewPane, TopNav } from ".";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/ui/HeroSection";
import AboutPreview from "@/components/ui/AboutPreview";
import ProcessPreview from "@/components/ui/ProcessPreview";
import ServicesPreview from "@/components/ui/ServicesPreview";
import OurTeam from "@/components/ui/OurTeam";
import ContactCTA from "@/components/ui/ContactCTA";
import WhyWeave from "@/components/ui/WhyWeave";
import type { WhyWeaveProps } from "@/components/ui/WhyWeave";
import type { HeroSectionProps } from "@/components/ui/HeroSection";
import type { AboutPreviewProps } from "@/components/ui/AboutPreview";
import type { ProcessPreviewProps } from "@/components/ui/ProcessPreview";
import type { ServicesPreviewProps } from "@/components/ui/ServicesPreview";
import type { OurTeamProps } from "@/components/ui/OurTeam";
import type { ContactCTAProps } from "@/components/ui/ContactCTA";
import type { FooterProps } from "@/components/ui/Footer";
import HeroSectionInlineEditable from "./HeroSectionInlineEditable";

// Strictly type allDraftData
interface AllDraftData {
  hero: HeroSectionProps;
  about: AboutPreviewProps;
  "why-weave": WhyWeaveProps;
  process: ProcessPreviewProps;
  portfolio: ServicesPreviewProps;
  team: OurTeamProps;
  contact: ContactCTAProps;
  footer: FooterProps;
}

export default function ContentSectionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId =
    typeof params.sectionId === "string"
      ? params.sectionId
      : Array.isArray(params.sectionId)
      ? params.sectionId[0]
      : "";

  // State and handlers (extracted from ContentSectionEditor)
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [whyWeaveCardFiles, setWhyWeaveCardFiles] = useState<(File | null)[]>([]);
  const [portfolioItemFiles, setPortfolioItemFiles] = useState<(File | null)[]>([]);
  const [teamManagementFiles, setTeamManagementFiles] = useState<(File | null)[]>([]);
  const [teamAdminFiles, setTeamAdminFiles] = useState<(File | null)[]>([]);
  const [teamProductionFiles, setTeamProductionFiles] = useState<(File | null)[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [allDraftData, setAllDraftData] = useState<AllDraftData>({
    hero: {},
    about: {},
    "why-weave": {},
    process: {},
    portfolio: {},
    team: {},
    contact: {},
    footer: { companyInfo: "", quickLinks: [], contactInfo: [] },
  });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [published, setPublished] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<"draft" | "published" | "unpublished">("unpublished");
  const [saving, setSaving] = useState(false);

  // Prevent background scroll when fullscreen preview is active
  useEffect(() => {
    setMounted(true);
    if (fullscreenPreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenPreview]);

  // Fetch all draft data for all sections when entering fullscreen preview
  useEffect(() => {
    if (!fullscreenPreview || !mounted) return;
    const fetchAllDrafts = async () => {
      const sectionIds = [
        "hero",
        "about",
        "why-weave",
        "process",
        "portfolio",
        "team",
        "contact",
        "footer",
      ] as (keyof AllDraftData)[];
      const results: Partial<AllDraftData> = {};
      await Promise.all(
        sectionIds.map(async (id) => {
          const res = await fetch(`/api/content/${id}`);
          const data = await res.json();
          if (id === "hero") {
            results.hero = data?.draftData && Object.keys(data.draftData).length > 0 ? data.draftData : heroDefaults;
          } else {
            results[id] = data?.draftData || {};
          }
        })
      );
      setAllDraftData((prev) => ({ ...prev, ...results }));
    };
    fetchAllDrafts();
  }, [fullscreenPreview, mounted]);

  const heroDefaults: HeroSectionProps & { tagline: string } = {
    beforeImage: "/Before - Anilao Site Plan_page-0001.jpg",
    afterImage: "/After - Anilao Render.jpg",
    subheadline:
      "We are an architecture service outsourcing company that seamlessly translates design concepts into documentation.",
    cta1Text: "View Our Work",
    cta1Link: "/services",
    cta2Text: "Make Inquiry",
    cta2Link: "",
    tagline: "WE DONT OUTSOURCE WE SIDESOURCE",
  };

  // Fetch content for sectionId on mount or section change
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/content?section=${sectionId}`)
      .then((res) => res.json())
      .then((data) => {
        const content = Array.isArray(data) ? data[0] : data;
        if (sectionId === "hero") {
          setDraft(content?.draftData && Object.keys(content.draftData).length > 0 ? content.draftData : heroDefaults);
        } else {
          setDraft(content?.draftData || {});
        }
        setPublished(content?.publishedData || {});
        setStatus(content?.status || "unpublished");
        setContentId(content?._id || null);
        setLoading(false);
      })
      .catch(() => {
        if (sectionId === "hero") {
          setDraft(heroDefaults);
        } else {
          setDraft({});
        }
        setPublished({});
        setStatus("unpublished");
        setContentId(null);
        setLoading(false);
      });
  }, [sectionId]);

  // Save Draft
  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const updatedDraft = { ...draft };
    // TODO: handle image uploads if needed
    let ok = false;
    let newId = contentId;
    if (contentId) {
      const res = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftData: updatedDraft }),
      });
      ok = res.ok;
      if (res.status === 404) newId = null;
    }
    if (!ok) {
      const res = await fetch(`/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionId, data: updatedDraft }),
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
      setStatus("draft");
    } else {
      setError("Failed to save draft");
    }
    setSaving(false);
  }

  // Publish
  async function handlePublish() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const updatedDraft = { ...draft };
    let ok = false;
    let newId = contentId;
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
    if (!ok) {
      const res = await fetch(`/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionId, data: updatedDraft }),
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

  // Revert
  async function handleRevert() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    let ok = false;
    let newId = contentId;
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
        setDraft({});
        setPublished(data?.publishedData || {});
        setStatus(data?.status || "unpublished");
      }
    }
    if (!ok) {
      setError("Nothing to revert. No published content exists for this section.");
    } else {
      setSuccess("Reverted to published");
      setContentId(newId || null);
    }
    setSaving(false);
  }

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

  // Sidebar navigation handler
  function setActiveSection(id: string) {
    if (id !== sectionId) {
      router.push(`/dashboard/content/${id}`);
    }
  }

  // TODO: Add effects for loading/saving data, status, etc.

  return (
    <div className="flex min-h-[80vh] bg-gradient-to-br from-blue-50/60 to-white/80">
      <SidebarNav activeSection={sectionId} setActiveSection={setActiveSection} status={status} />
      <main className="flex-1 flex flex-col">
        <TopNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setFullscreenPreview={setFullscreenPreview}
          sectionId={sectionId}
        />
        {/* Fullscreen Preview Overlay */}
        {/* Always show fullscreen preview with inline editing */}
        {fullscreenPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <button
                onClick={() => setFullscreenPreview(false)}
                className="ml-auto px-4 py-1 rounded bg-white shadow text-blue-900 font-semibold border border-blue-200 hover:bg-blue-50 transition"
              >
                Exit Preview
              </button>
            </div>
            <div className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start">
              <div className="w-full max-w-8xl mx-auto min-h-screen flex flex-col items-center justify-start">
                <main className="min-h-screen w-full" id="main-content" aria-label="Main content">
                  <section aria-labelledby="hero-heading">
                    <HeroSectionInlineEditable
                      {...(draft as HeroSectionProps)}
                      tagline={typeof draft?.tagline === "string" ? draft.tagline : heroDefaults.tagline}
                      onFieldChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
                      showEditButtons
                    />
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
                    <ServicesPreview {...allDraftData.portfolio} />
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
        {/* Main content below TopNav */}
      </main>
    </div>
  );
}
