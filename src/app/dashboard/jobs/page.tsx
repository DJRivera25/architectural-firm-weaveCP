"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { getJobs, createJob, updateJob, deleteJob } from "@/utils/api";
import { JobData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { JOB_TYPES } from "./constants";
import JobForm, { JobFormValues } from "./JobForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  recentJobs: number;
  applicationsCount: number;
  averageSalary: number;
  typeDistribution: { type: string; count: number; active: number }[];
  locationDistribution: { location: string; count: number }[];
}

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    recentJobs: 0,
    applicationsCount: 0, // Would need applications data
    averageSalary: 0,
    typeDistribution: [],
    locationDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      const jobsData = response.data || [];
      setJobs(jobsData);
      calculateStats(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobsData: JobData[]) => {
    const totalJobs = jobsData.length;
    const activeJobs = jobsData.filter((job) => job.isActive).length;
    const inactiveJobs = jobsData.filter((job) => !job.isActive).length;

    const recentJobs = jobsData.filter((job) => {
      const createdDate = new Date(job.createdAt || "");
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate > thirtyDaysAgo;
    }).length;

    const averageSalary =
      jobsData.length > 0
        ? jobsData.reduce((sum, job) => sum + (job.salary.min + job.salary.max) / 2, 0) / jobsData.length
        : 0;

    // Type distribution
    const typeDistribution = JOB_TYPES.map((type) => ({
      type: type.label,
      count: jobsData.filter((job) => job.type === type.value).length,
      active: jobsData.filter((job) => job.type === type.value && job.isActive).length,
    }));

    // Location distribution
    const locationCounts = jobsData.reduce((acc, job) => {
      acc[job.location] = (acc[job.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const locationDistribution = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalJobs,
      activeJobs,
      inactiveJobs,
      recentJobs,
      applicationsCount: 0, // Would need applications data
      averageSalary,
      typeDistribution,
      locationDistribution,
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesStatus = statusFilter === "all" || job.isActive === (statusFilter === "active");
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;

    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };

  const getJobTypeInfo = (type: string) => {
    return JOB_TYPES.find((t) => t.value === type) || JOB_TYPES[0];
  };

  const handleCreateJob = async (values: JobFormValues) => {
    setCreateLoading(true);
    setCreateError("");
    try {
      await createJob({ ...values, type: values.type as "full-time" | "part-time" | "contract" | "internship" });
      setCreateSuccess(true);
      setShowCreateModal(false);
      fetchJobs();
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setCreateError((err as { message?: string }).message || "Failed to create job");
      } else {
        setCreateError("Failed to create job");
      }
    } finally {
      setCreateLoading(false);
      setTimeout(() => setCreateSuccess(false), 2000);
    }
  };

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

  const JobCard = ({ job }: { job: JobData }) => {
    const jobTypeInfo = getJobTypeInfo(job.type);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BriefcaseIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                job.isActive
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              )}
            >
              {job.isActive ? <CheckCircleIcon className="w-4 h-4 mr-1" /> : <XCircleIcon className="w-4 h-4 mr-1" />}
              {job.isActive ? "Active" : "Inactive"}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                jobTypeInfo.color
              )}
            >
              {jobTypeInfo.icon}
              <span className="ml-1">{jobTypeInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
          </div>
        </div>

        {/* Requirements Preview */}
        {job.requirements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Requirements</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((requirement, index) => (
                <div key={index} className="bg-gray-50 rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-700">{requirement}</span>
                </div>
              ))}
              {job.requirements.length > 3 && (
                <div className="bg-gray-50 rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-500">+{job.requirements.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Responsibilities Preview */}
        {job.responsibilities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Responsibilities</p>
            <div className="flex flex-wrap gap-2">
              {job.responsibilities.slice(0, 2).map((responsibility, index) => (
                <div key={index} className="bg-blue-50 rounded-lg px-3 py-1">
                  <span className="text-xs text-blue-700">{responsibility}</span>
                </div>
              ))}
              {job.responsibilities.length > 2 && (
                <div className="bg-blue-50 rounded-lg px-3 py-1">
                  <span className="text-xs text-blue-500">+{job.responsibilities.length - 2} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created: {new Date(job.createdAt || "").toLocaleDateString()}</div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
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
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600 mt-2">Manage career opportunities and job listings</p>
          </div>
          <button
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Job
          </button>
        </div>

        {/* Create Job Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <JobForm onSubmit={handleCreateJob} loading={createLoading} onCancel={() => setShowCreateModal(false)} />
            {createError && <div className="text-red-600 text-sm mt-2">{createError}</div>}
          </DialogContent>
        </Dialog>
        {createSuccess && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50">
            Job created successfully!
          </div>
        )}

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
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Jobs"
                  value={stats.totalJobs}
                  icon={<BriefcaseIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="All job postings"
                />
                <StatCard
                  title="Active Jobs"
                  value={stats.activeJobs}
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="Currently accepting applications"
                  trend={stats.activeJobs > stats.totalJobs / 2 ? "up" : "down"}
                  trendValue={`${stats.activeJobs} active`}
                />
                <StatCard
                  title="Recent Jobs"
                  value={stats.recentJobs}
                  icon={<CalendarDaysIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="Posted in last 30 days"
                />
                <StatCard
                  title="Avg Salary"
                  value={`$${stats.averageSalary.toLocaleString()}`}
                  icon={<CurrencyDollarIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Average annual salary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.typeDistribution.map((type) => (
            <div key={type.type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type.type}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{type.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.active} active</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100">
                  {JOB_TYPES.find((t) => t.label === type.type)?.icon || (
                    <BriefcaseIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  id="location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Locations</option>
                  {Array.from(new Set(jobs.map((job) => job.location))).map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Job Postings ({filteredJobs.length})</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton height={200} />
              </motion.div>
            ) : filteredJobs.length === 0 ? (
              <motion.div
                key="no-jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="text-center py-12">
                  <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-4")}>
                  {filteredJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
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
