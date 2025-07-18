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
} from "@heroicons/react/24/outline";

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
    description: "Contact information and forms",
    icon: <DocumentTextIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-teal-500 to-teal-600",
  },
  {
    id: "footer",
    label: "Footer",
    description: "Footer content and links",
    icon: <DocumentTextIcon className="w-6 h-6" />,
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
  },
];

type ContentSectionStatus = "draft" | "published" | "unpublished";

interface SectionMeta {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: ContentSectionStatus;
  updatedAt: string;
}

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

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
      </div>
    </div>
  );

  const SectionCard = ({ section }: { section: SectionMeta }) => {
    const getStatusColor = (status: ContentSectionStatus) => {
      switch (status) {
        case "published":
          return "bg-green-100 text-green-700 border-green-200";
        case "draft":
          return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "unpublished":
          return "bg-gray-100 text-gray-500 border-gray-200";
        default:
          return "bg-gray-100 text-gray-500 border-gray-200";
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

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${section.color} text-white`}>{section.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {section.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                getStatusColor(section.status)
              )}
            >
              {getStatusIcon(section.status)}
              <span className="ml-1">{section.status.charAt(0).toUpperCase() + section.status.slice(1)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Last updated: {section.updatedAt}</div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/content/${section.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage your website content and sections</p>
          </div>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Section
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sections"
            value={stats.totalSections}
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle="Website sections"
          />
          <StatCard
            title="Published"
            value={stats.publishedSections}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle={`${stats.publishRate.toFixed(1)}% publish rate`}
            trend={stats.publishRate > 50 ? "up" : "down"}
            trendValue={`${stats.publishRate.toFixed(1)}%`}
          />
          <StatCard
            title="Draft"
            value={stats.draftSections}
            icon={<ClockIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            subtitle="In progress"
          />
          <StatCard
            title="Unpublished"
            value={stats.unpublishedSections}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-gray-500 to-gray-600"
            subtitle="Needs content"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Sections
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ContentSectionStatus | "all")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Website Sections ({filteredSections.length})</h2>
            <div className="text-sm text-gray-500">Last updated: {stats.lastUpdated}</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
