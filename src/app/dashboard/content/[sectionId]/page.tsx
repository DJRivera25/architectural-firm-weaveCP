"use client";
import { useParams } from "next/navigation";
import { ContentSectionEditor } from "@/components/ui/ContentSectionEditor";

export default function ContentSectionEditorPage() {
  const params = useParams();
  const sectionId =
    typeof params.sectionId === "string"
      ? params.sectionId
      : Array.isArray(params.sectionId)
      ? params.sectionId[0]
      : "";
  return <ContentSectionEditor sectionId={sectionId} />;
}
