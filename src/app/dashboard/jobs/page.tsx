"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { JobData } from "@/types";
import { getJobs, createJob, updateJob, deleteJob } from "@/utils/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const JOB_TYPES = [
  {
    value: "full-time",
    label: "Full Time",
    icon: <BriefcaseIcon className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "part-time",
    label: "Part Time",
    icon: <ClockIcon className="w-5 h-5" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "contract",
    label: "Contract",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "internship",
    label: "Internship",
    icon: <AcademicCapIcon className="w-5 h-5" />,
    color: "bg-orange-100 text-orange-800",
  },
];

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingJob, setEditingJob] = useState<JobData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "location" | "salary">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showJobDetails, setShowJobDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs
    .filter((job) => selectedJobType === "all" || job.type === selectedJobType)
    .filter((job) => selectedStatus === "all" || job.isActive === (selectedStatus === "active"))
    .filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "createdAt":
          comparison = new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
        case "salary":
          comparison = a.salary.min - b.salary.min;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleCreateJob = async (formData: FormData) => {
    try {
      const newJob: Partial<JobData> = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        requirements: (formData.get("requirements") as string).split("\n").filter((r) => r.trim()),
        responsibilities: (formData.get("responsibilities") as string).split("\n").filter((r) => r.trim()),
        location: formData.get("location") as string,
        type: formData.get("type") as "full-time" | "part-time" | "contract" | "internship",
        salary: {
          min: parseInt(formData.get("salaryMin") as string),
          max: parseInt(formData.get("salaryMax") as string),
          currency: (formData.get("currency") as string) || "USD",
        },
        isActive: formData.get("isActive") === "true",
      };

      await createJob(newJob as JobData);
      setShowCreateForm(false);
      fetchJobs();
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const handleUpdateJob = async (id: string, formData: FormData) => {
    try {
      const updatedJob: Partial<JobData> = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        requirements: (formData.get("requirements") as string).split("\n").filter((r) => r.trim()),
        responsibilities: (formData.get("responsibilities") as string).split("\n").filter((r) => r.trim()),
        location: formData.get("location") as string,
        type: formData.get("type") as "full-time" | "part-time" | "contract" | "internship",
        salary: {
          min: parseInt(formData.get("salaryMin") as string),
          max: parseInt(formData.get("salaryMax") as string),
          currency: (formData.get("currency") as string) || "USD",
        },
        isActive: formData.get("isActive") === "true",
      };

      await updateJob(id, updatedJob);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteJob(id);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const toggleJobStatus = async (job: JobData) => {
    try {
      await updateJob(job._id!, { isActive: !job.isActive });
      fetchJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const getJobStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((job) => job.isActive).length;
    const inactiveJobs = jobs.filter((job) => !job.isActive).length;

    const typeStats = JOB_TYPES.map((type) => ({
      ...type,
      count: jobs.filter((job) => job.type === type.value).length,
      active: jobs.filter((job) => job.type === type.value).filter((job) => job.isActive).length,
    }));

    return {
      total: totalJobs,
      active: activeJobs,
      inactive: inactiveJobs,
      types: typeStats,
    };
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 border-b-2 border-gray-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getJobStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600">Manage job postings and track applications</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BriefcaseIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-green-600">Active: {stats.active}</span>
              <span className="text-gray-400">•</span>
              <span className="text-red-600">Inactive: {stats.inactive}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Postings</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Currently accepting applications</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employment Types</p>
                <p className="text-2xl font-bold text-gray-900">{JOB_TYPES.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Different employment types</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    jobs.filter((job) => {
                      const jobDate = new Date(job.createdAt || "");
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return jobDate > weekAgo;
                    }).length
                  }
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500">Posted in last 7 days</p>
          </div>
        </div>

        {/* Job Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Job Type Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.types.map((type) => (
              <div
                key={type.value}
                onClick={() => setSelectedJobType(type.value)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedJobType === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${type.color}`}>{type.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-600">{type.count} jobs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "createdAt" | "title" | "location" | "salary")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="location">Sort by Location</option>
                <option value="salary">Sort by Salary</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPinIcon className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            JOB_TYPES.find((t) => t.value === job.type)?.color || "bg-gray-100"
                          }`}
                        >
                          {JOB_TYPES.find((t) => t.value === job.type)?.icon}
                          {JOB_TYPES.find((t) => t.value === job.type)?.label}
                        </span>
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            job.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </div>
                    <p className="text-sm text-gray-600">{job.description.substring(0, 120)}...</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3" />
                      Posted {new Date(job.createdAt || "").toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowJobDetails(job._id!)} className="text-blue-600 hover:text-blue-800">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingJob(job)} className="text-gray-600 hover:text-gray-800">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteJob(job._id!)} className="text-red-600 hover:text-red-800">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {job.description.substring(0, 80)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{job.location}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            JOB_TYPES.find((t) => t.value === job.type)?.color || "bg-gray-100"
                          }`}
                        >
                          {JOB_TYPES.find((t) => t.value === job.type)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(job.createdAt || "").toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowJobDetails(job._id!)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingJob(job)} className="text-gray-600 hover:text-gray-800">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteJob(job._id!)} className="text-red-600 hover:text-red-800">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedJobType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by posting your first job."}
            </p>
          </div>
        )}

        {/* Create/Edit Job Modal */}
        {(showCreateForm || editingJob) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (editingJob) {
                    handleUpdateJob(editingJob._id!, formData);
                  } else {
                    handleCreateJob(formData);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingJob?.title || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingJob?.location || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      name="type"
                      defaultValue={editingJob?.type || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select job type</option>
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                    <input
                      type="number"
                      name="salaryMin"
                      defaultValue={editingJob?.salary.min || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                    <input
                      type="number"
                      name="salaryMax"
                      defaultValue={editingJob?.salary.max || ""}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingJob?.description || ""}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                  <textarea
                    name="requirements"
                    defaultValue={editingJob?.requirements.join("\n") || ""}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List the requirements for this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    name="responsibilities"
                    defaultValue={editingJob?.responsibilities.join("\n") || ""}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List the responsibilities for this position..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingJob?.isActive ?? true}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active job posting</span>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingJob(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingJob ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 full max-w-2xl max-h-[90vh] overflow-y-auto">
              {(() => {
                const job = jobs.find((j) => j._id === showJobDetails);
                if (!job) return null;

                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <button onClick={() => setShowJobDetails(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            JOB_TYPES.find((t) => t.value === job.type)?.color || "bg-gray-100"
                          }`}
                        >
                          {JOB_TYPES.find((t) => t.value === job.type)?.label}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          Posted {new Date(job.createdAt || "").toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowJobDetails(null);
                              setEditingJob(job);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit Job
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
