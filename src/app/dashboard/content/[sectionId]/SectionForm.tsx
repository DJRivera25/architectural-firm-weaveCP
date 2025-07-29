"use client";
import React from "react";
import FileUploadField from "./FileUploadField";

interface SectionFormProps {
  sectionId: string;
  draft: Record<string, unknown> | null;
  setDraft: (draft: Record<string, unknown>) => void;
  beforeImageFile: File | null;
  setBeforeImageFile: (file: File | null) => void;
  afterImageFile: File | null;
  setAfterImageFile: (file: File | null) => void;
  whyWeaveCardFiles: (File | null)[];
  setWhyWeaveCardFiles: (files: (File | null)[]) => void;
  portfolioItemFiles: (File | null)[];
  setPortfolioItemFiles: (files: (File | null)[]) => void;
  teamManagementFiles: (File | null)[];
  setTeamManagementFiles: (files: (File | null)[]) => void;
  teamAdminFiles: (File | null)[];
  setTeamAdminFiles: (files: (File | null)[]) => void;
  teamProductionFiles: (File | null)[];
  setTeamProductionFiles: (files: (File | null)[]) => void;
  handleDraftChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (field: string, url: string) => void;
  handleArrayChange: (field: string, value: Record<string, string>[]) => void;
  handleArrayAdd: (field: string, item: Record<string, string>) => void;
  handleArrayRemove: (field: string, index: number) => void;
}

const SectionForm: React.FC<SectionFormProps> = ({
  sectionId,
  draft,
  setDraft,
  beforeImageFile,
  setBeforeImageFile,
  afterImageFile,
  setAfterImageFile,
  whyWeaveCardFiles,
  setWhyWeaveCardFiles,
  portfolioItemFiles,
  setPortfolioItemFiles,
  teamManagementFiles,
  setTeamManagementFiles,
  teamAdminFiles,
  setTeamAdminFiles,
  teamProductionFiles,
  setTeamProductionFiles,
  handleDraftChange,
  handleFileChange,
  handleArrayChange,
  handleArrayAdd,
  handleArrayRemove,
}) => {
  if (!draft) return null;
  switch (sectionId) {
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
    case "whyWeave":
      return (
        <>
          <FileUploadField
            label="Why Weave Card Image"
            name="whyWeaveCardImage"
            value={typeof draft.whyWeaveCardImage === "string" ? draft.whyWeaveCardImage : undefined}
            onChange={(url) => handleFileChange("whyWeaveCardImage", url)}
            fileState={whyWeaveCardFiles[0]}
            setFileState={(file) => setWhyWeaveCardFiles([file])}
          />
          <input
            type="text"
            name="whyWeaveCardTitle"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Why Weave Card Title"
            value={typeof draft.whyWeaveCardTitle === "string" ? draft.whyWeaveCardTitle : ""}
            onChange={handleDraftChange}
          />
          <input
            type="text"
            name="whyWeaveCardDescription"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Why Weave Card Description"
            value={typeof draft.whyWeaveCardDescription === "string" ? draft.whyWeaveCardDescription : ""}
            onChange={handleDraftChange}
          />
        </>
      );
    case "portfolio":
      return (
        <>
          <FileUploadField
            label="Portfolio Item Image"
            name="portfolioItemImage"
            value={typeof draft.portfolioItemImage === "string" ? draft.portfolioItemImage : undefined}
            onChange={(url) => handleFileChange("portfolioItemImage", url)}
            fileState={portfolioItemFiles[0]}
            setFileState={(file) => setPortfolioItemFiles([file])}
          />
          <input
            type="text"
            name="portfolioItemTitle"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Portfolio Item Title"
            value={typeof draft.portfolioItemTitle === "string" ? draft.portfolioItemTitle : ""}
            onChange={handleDraftChange}
          />
          <input
            type="text"
            name="portfolioItemDescription"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Portfolio Item Description"
            value={typeof draft.portfolioItemDescription === "string" ? draft.portfolioItemDescription : ""}
            onChange={handleDraftChange}
          />
        </>
      );
    case "teamManagement":
      return (
        <>
          <FileUploadField
            label="Team Management Image"
            name="teamManagementImage"
            value={typeof draft.teamManagementImage === "string" ? draft.teamManagementImage : undefined}
            onChange={(url) => handleFileChange("teamManagementImage", url)}
            fileState={teamManagementFiles[0]}
            setFileState={(file) => setTeamManagementFiles([file])}
          />
          <input
            type="text"
            name="teamManagementTitle"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Management Title"
            value={typeof draft.teamManagementTitle === "string" ? draft.teamManagementTitle : ""}
            onChange={handleDraftChange}
          />
          <input
            type="text"
            name="teamManagementDescription"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Management Description"
            value={typeof draft.teamManagementDescription === "string" ? draft.teamManagementDescription : ""}
            onChange={handleDraftChange}
          />
        </>
      );
    case "teamAdmin":
      return (
        <>
          <FileUploadField
            label="Team Admin Image"
            name="teamAdminImage"
            value={typeof draft.teamAdminImage === "string" ? draft.teamAdminImage : undefined}
            onChange={(url) => handleFileChange("teamAdminImage", url)}
            fileState={teamAdminFiles[0]}
            setFileState={(file) => setTeamAdminFiles([file])}
          />
          <input
            type="text"
            name="teamAdminTitle"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Admin Title"
            value={typeof draft.teamAdminTitle === "string" ? draft.teamAdminTitle : ""}
            onChange={handleDraftChange}
          />
          <input
            type="text"
            name="teamAdminDescription"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Admin Description"
            value={typeof draft.teamAdminDescription === "string" ? draft.teamAdminDescription : ""}
            onChange={handleDraftChange}
          />
        </>
      );
    case "teamProduction":
      return (
        <>
          <FileUploadField
            label="Team Production Image"
            name="teamProductionImage"
            value={typeof draft.teamProductionImage === "string" ? draft.teamProductionImage : undefined}
            onChange={(url) => handleFileChange("teamProductionImage", url)}
            fileState={teamProductionFiles[0]}
            setFileState={(file) => setTeamProductionFiles([file])}
          />
          <input
            type="text"
            name="teamProductionTitle"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Production Title"
            value={typeof draft.teamProductionTitle === "string" ? draft.teamProductionTitle : ""}
            onChange={handleDraftChange}
          />
          <input
            type="text"
            name="teamProductionDescription"
            className="w-full border rounded px-3 py-2 mb-2 bg-white/60 backdrop-blur placeholder:text-blue-900/40"
            placeholder="Team Production Description"
            value={typeof draft.teamProductionDescription === "string" ? draft.teamProductionDescription : ""}
            onChange={handleDraftChange}
          />
        </>
      );
    default:
      return <div className="text-blue-900/60">No editor for this section yet.</div>;
  }
};

export default SectionForm;
