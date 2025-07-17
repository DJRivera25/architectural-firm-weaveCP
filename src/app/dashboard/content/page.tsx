"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ContentData } from "@/types";
import { getContent, createContent, updateContent, deleteContent } from "@/utils/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HomeIcon,
  InformationCircleIcon,
  CogIcon,
  StarIcon,
  UserGroupIcon,
  PaintBrushIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
const SECTIONS = [
  { value: "home", label: "Homepage", icon: HomeIcon },
  { value: "about", label: "About Us", icon: InformationCircleIcon },
  { value: "process", label: "Our Process", icon: CogIcon },
  { value: "why-choose-us", label: "Why Choose Us", icon: StarIcon },
  { value: "team", label: "Team", icon: UserGroupIcon },
  { value: "portfolio", label: "Portfolio", icon: PaintBrushIcon },
  { value: "careers", label: "Careers", icon: BriefcaseIcon },
];
export default function ContentManagementPage() {
  const [contents, setContents] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [editingContent, setEditingContent] = useState<ContentData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"order" | "title" | "createdAt">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    fetchContents();
  }, []);
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getContent();
      setContents(response.data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredContents = contents
    .filter((content) => selectedSection === "all" || content.section === selectedSection)
    .filter(
      (content) =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "order":
          comparison = a.order - b.order;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  const handleCreate = async (formData: FormData) => {
    try {
      const newContent: Partial<ContentData> = {
        section: formData.get("section") as string,
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        order: parseInt(formData.get("order") as string) || 0,
        isActive: formData.get("isActive") === "true",
        images: [],
      };
      await createContent(newContent as ContentData);
      setShowCreateForm(false);
      fetchContents();
    } catch (error) {
      console.error("Error creating content:", error);
    }
  };
  const handleUpdate = async (id: string, formData: FormData) => {
    try {
      const updatedContent: Partial<ContentData> = {
        section: formData.get("section") as string,
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        order: parseInt(formData.get("order") as string) || 0,
        isActive: formData.get("isActive") === "true",
      };
      await updateContent(id, updatedContent);
      setEditingContent(null);
      fetchContents();
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        await deleteContent(id);
        fetchContents();
      } catch (error) {
        console.error("Error deleting content:", error);
      }
    }
  };
  const toggleActive = async (content: ContentData) => {
    try {
      await updateContent(content._id!, { isActive: !content.isActive });
      fetchContents();
    } catch (error) {
      console.error("Error toggling content status:", error);
    }
  };
  const moveContent = async (content: ContentData, direction: "up" | "down") => {
    const currentIndex = contents.findIndex((c) => c._id === content._id);
    if (currentIndex === -1) return;
    const newOrder = direction === "up" ? content.order - 1 : content.order + 1;
    try {
      await updateContent(content._id!, { order: newOrder });
      fetchContents();
    } catch (error) {
      console.error("Error moving content:", error);
    }
  };
  const getSectionStats = () => {
    const stats = SECTIONS.map((section) => {
      const sectionContents = contents.filter((c) => c.section === section.value);
      return {
        ...section,
        count: sectionContents.length,
        active: sectionContents.filter((c) => c.isActive).length,
        inactive: sectionContents.filter((c) => !c.isActive).length,
      };
    });
    return [
      ...stats,
      {
        value: "all",
        label: "All Sections",
        icon: ChartBarIcon,
        count: contents.length,
        active: contents.filter((c) => c.isActive).length,
        inactive: contents.filter((c) => !c.isActive).length,
      },
    ];
  };
  if (loading) {
    return (
      <DashboardLayout>
        {" "}
        <div className="flex items-center justify-center h-64">
          {" "}
          <div className="animate-spin rounded-full h-12 border-b-2 border-gray-600"></div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-6">
        {" "}
        {/* Header */}{" "}
        <div className="flex justify-between items-center">
          {" "}
          <div>
            {" "}
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>{" "}
            <p className="text-gray-600 mt-1">Manage your website content, sections, and pages</p>{" "}
          </div>{" "}
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {" "}
            <PlusIcon className="w-5 h-5" /> Add Content{" "}
          </button>{" "}
        </div>{" "}
        {/* Stats Cards */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {" "}
          {getSectionStats().map((stat) => (
            <div
              key={stat.value}
              onClick={() => setSelectedSection(stat.value)}
              className={`bg-white p-6 rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                selectedSection === stat.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                {stat.icon && <stat.icon className="w-8 h-8 text-blue-600" />}
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-green-600">Active: {stat.active}</span>
                <span className="text-gray-400">•</span>
                <span className="text-red-600">Inactive: {stat.inactive}</span>
              </div>
            </div>
          ))}
        </div>{" "}
        {/* Filters and Search */}{" "}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {" "}
          <div className="flex flex-col lg:flex-row gap-4">
            {" "}
            <div className="flex-1">
              {" "}
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />{" "}
            </div>{" "}
            <div className="flex gap-2">
              {" "}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "order" | "title" | "createdAt")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {" "}
                <option value="order">Sort by Order</option> <option value="title">Sort by Title</option>{" "}
                <option value="createdAt">Sort by Date</option>{" "}
              </select>{" "}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {" "}
                {sortOrder === "asc" ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.map((content) => (
                  <tr key={content._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {content.content.substring(0, 100)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100">
                        {SECTIONS.find((s) => s.value === content.section)?.label || content.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{content.order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(content)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          content.isActive ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {content.isActive ? (
                          <>
                            <EyeIcon className="w-3 h-3 mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="w-3 h-3 mr-1" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveContent(content, "up")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveContent(content, "down")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingContent(content)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(content._id!)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContents.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedSection !== "all"
                  ? "Try adjusting your search or filters."
                  : "Get started by creating your first content piece."}
              </p>
            </div>
          )}
        </div>
        {/* Create/Edit Modal */}
        {showCreateForm || editingContent ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingContent ? "Edit Content" : "Create New Content"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (editingContent) {
                    handleUpdate(editingContent._id!, formData);
                  } else {
                    handleCreate(formData);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      name="section"
                      defaultValue={editingContent?.section || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a section</option>
                      {SECTIONS.map((section) => (
                        <option key={section.value} value={section.value}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      name="order"
                      defaultValue={editingContent?.order || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingContent?.title || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    defaultValue={editingContent?.content || ""}
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your content here..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={editingContent?.isActive ?? true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingContent(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingContent ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>{" "}
    </DashboardLayout>
  );
}
