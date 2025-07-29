"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CogIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const SECTIONS = [
  {
    id: "hero",
    label: "Hero Section",
    description: "Main landing page content",
    icon: <GlobeAltIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    id: "about",
    label: "About Section",
    description: "Company information and story",
    icon: <DocumentTextIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    id: "why-weave",
    label: "Why Weave",
    description: "Value propositions and benefits",
    icon: <CheckCircleIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    id: "process",
    label: "Process Section",
    description: "Workflow and methodology",
    icon: <CogIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Project showcase and gallery",
    icon: <BriefcaseIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
  {
    id: "team",
    label: "Team Section",
    description: "Team member profiles",
    icon: <UserGroupIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
  {
    id: "contact",
    label: "Contact Section",
    description: "Contact information and form",
    icon: <PencilIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-red-500 to-red-600",
  },
  {
    id: "footer",
    label: "Footer",
    description: "Footer links and information",
    icon: <DocumentTextIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
  },
];

interface SectionMeta {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: ContentSectionStatus;
  updatedAt: string;
}

type ContentSectionStatus = "published" | "draft" | "unpublished";

interface ContentStats {
  totalSections: number;
  publishedSections: number;
  draftSections: number;
  unpublishedSections: number;
  lastUpdated: string;
  publishRate: number;
}

export default function ContentDashboardPage() {
  const [sections, setSections] = useState<SectionMeta[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalSections: 0,
    publishedSections: 0,
    draftSections: 0,
    unpublishedSections: 0,
    lastUpdated: "-",
    publishRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentSectionStatus | "all">("all");

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      const response = await fetch("/api/content");
      const data: Array<{ section: string; status: ContentSectionStatus; updatedAt: string }> = await response.json();

      const sectionsWithMeta = SECTIONS.map((section) => {
        const found = data.find((d) => d.section === section.id);
        return {
          ...section,
          status: found?.status ?? "unpublished",
          updatedAt: found?.updatedAt ? new Date(found.updatedAt).toLocaleDateString() : "-",
        };
      });

      setSections(sectionsWithMeta);

      // Calculate stats
      const publishedCount = sectionsWithMeta.filter((s) => s.status === "published").length;
      const draftCount = sectionsWithMeta.filter((s) => s.status === "draft").length;
      const unpublishedCount = sectionsWithMeta.filter((s) => s.status === "unpublished").length;
      const publishRate = (publishedCount / sectionsWithMeta.length) * 100;

      const lastUpdated =
        sectionsWithMeta
          .filter((s) => s.updatedAt !== "-")
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt || "-";

      setStats({
        totalSections: sectionsWithMeta.length,
        publishedSections: publishedCount,
        draftSections: draftCount,
        unpublishedSections: unpublishedCount,
        lastUpdated,
        publishRate,
      });
    } catch (error) {
      console.error("Error fetching content data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || section.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ContentSectionStatus) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "unpublished":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ContentSectionStatus) => {
    switch (status) {
      case "published":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "draft":
        return <ClockIcon className="w-4 h-4" />;
      case "unpublished":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const SectionCard = ({ section }: { section: SectionMeta }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${section.color} text-white`}>{section.icon}</div>
        <div
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
            getStatusColor(section.status)
          )}
        >
          {getStatusIcon(section.status)}
          {section.status}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.label}</h3>
      <p className="text-gray-600 text-sm mb-4">{section.description}</p>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Last updated: {section.updatedAt}</div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/content/editor`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Open Editor
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage your website content and sections</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/content/editor"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Open Editor
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <LoadingSkeleton key={i} height={120} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sections</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSections}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">{stats.publishedSections}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.draftSections}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Publish Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.publishRate.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <ArrowUpIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentSectionStatus | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {/* Sections Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Website Sections ({filteredSections.length})</h2>
            <div className="text-sm text-gray-500">Last updated: {stats.lastUpdated}</div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton height={200} />
              </motion.div>
            ) : filteredSections.length === 0 ? (
              <motion.div
                key="no-sections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSections.map((section) => (
                    <SectionCard key={section.id} section={section} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
