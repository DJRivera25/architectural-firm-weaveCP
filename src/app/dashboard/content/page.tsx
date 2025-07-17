"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "why-weave", label: "Why Weave" },
  { id: "process", label: "Process" },
  { id: "portfolio", label: "Portfolio" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

type ContentSectionStatus = "draft" | "published" | "unpublished";

interface SectionMeta {
  id: string;
  label: string;
  status: ContentSectionStatus;
  updatedAt: string;
}

export default function ContentDashboardPage() {
  const [sections, setSections] = useState<SectionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data: Array<{ section: string; status: ContentSectionStatus; updatedAt: string }>) => {
        setSections(
          SECTIONS.map((section) => {
            const found = data.find((d) => d.section === section.id);
            return {
              id: section.id,
              label: section.label,
              status: found?.status ?? "unpublished",
              updatedAt: found?.updatedAt ?? "-",
            };
          })
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {SECTIONS.map((section) => (
              <div key={section.id} className="h-14 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between bg-white border rounded px-4 py-3 shadow-sm"
            >
              <div>
                <div className="font-medium">{section.label}</div>
                <div className="text-xs text-gray-500">Last updated: {section.updatedAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded",
                    section.status === "published"
                      ? "bg-green-100 text-green-700"
                      : section.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                </span>
                <Link
                  href={`/dashboard/content/${section.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
