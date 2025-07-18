"use client";
import { useState, useEffect } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { getLeaves } from "@/utils/api";
import { LeaveWithUser, LeaveStatus } from "@/types";
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface LeaveStats {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  approvedDays: number;
  pendingDays: number;
  averageApprovalTime: number;
  leaveTypes: { type: string; count: number }[];
  monthlyTrend: "up" | "down";
}

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [stats, setStats] = useState<LeaveStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    approvedDays: 0,
    pendingDays: 0,
    averageApprovalTime: 0,
    leaveTypes: [],
    monthlyTrend: "up",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await getLeaves();
      const leavesData = response.data || [];
      setLeaves(leavesData);
      calculateStats(leavesData);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leavesData: LeaveWithUser[]) => {
    const totalLeaves = leavesData.length;
    const pendingLeaves = leavesData.filter((leave) => leave.status === LeaveStatus.PENDING).length;
    const approvedLeaves = leavesData.filter((leave) => leave.status === LeaveStatus.APPROVED).length;
    const rejectedLeaves = leavesData.filter((leave) => leave.status === LeaveStatus.REJECTED).length;

    const approvedDays = leavesData
      .filter((leave) => leave.status === LeaveStatus.APPROVED)
      .reduce((sum, leave) => sum + (leave.totalDays || 0), 0);

    const pendingDays = leavesData
      .filter((leave) => leave.status === LeaveStatus.PENDING)
      .reduce((sum, leave) => sum + (leave.totalDays || 0), 0);

    // Calculate average approval time
    const approvedLeavesWithDates = leavesData.filter(
      (leave) => leave.status === LeaveStatus.APPROVED && leave.createdAt && leave.updatedAt
    );

    const averageApprovalTime =
      approvedLeavesWithDates.length > 0
        ? approvedLeavesWithDates.reduce((sum, leave) => {
            const created = new Date(leave.createdAt || "");
            const updated = new Date(leave.updatedAt || "");
            return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / approvedLeavesWithDates.length
        : 0;

    // Leave types distribution
    const typeCounts = leavesData.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leaveTypes = Object.entries(typeCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    // Monthly trend (simple calculation)
    const thisMonth = new Date().getMonth();
    const thisMonthLeaves = leavesData.filter(
      (leave) => new Date(leave.createdAt || "").getMonth() === thisMonth
    ).length;
    const lastMonthLeaves = leavesData.filter(
      (leave) => new Date(leave.createdAt || "").getMonth() === (thisMonth - 1 + 12) % 12
    ).length;

    const monthlyTrend = thisMonthLeaves > lastMonthLeaves ? "up" : "down";

    setStats({
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      approvedDays,
      pendingDays,
      averageApprovalTime,
      leaveTypes,
      monthlyTrend,
    });
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || leave.status === statusFilter;
    const matchesType = typeFilter === "all" || leave.leaveType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "bg-green-100 text-green-700 border-green-200";
      case LeaveStatus.PENDING:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case LeaveStatus.REJECTED:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return <CheckCircleIcon className="w-4 h-4" />;
      case LeaveStatus.PENDING:
        return <ClockIcon className="w-4 h-4" />;
      case LeaveStatus.REJECTED:
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
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

  // Inline Card for Leave Request
  function LeaveRequestCard({ leave }: { leave: LeaveWithUser }) {
    const getStatusColor = (status: LeaveStatus) => {
      switch (status) {
        case LeaveStatus.APPROVED:
          return "bg-green-100 text-green-700 border-green-200";
        case LeaveStatus.PENDING:
          return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case LeaveStatus.REJECTED:
          return "bg-red-100 text-red-700 border-red-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    };
    const getStatusIcon = (status: LeaveStatus) => {
      switch (status) {
        case LeaveStatus.APPROVED:
          return <CheckCircleIcon className="w-4 h-4" />;
        case LeaveStatus.PENDING:
          return <ClockIcon className="w-4 h-4" />;
        case LeaveStatus.REJECTED:
          return <XCircleIcon className="w-4 h-4" />;
        default:
          return <ClockIcon className="w-4 h-4" />;
      }
    };
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
              <UserIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {leave.user?.name || "Unknown User"}
              </h3>
              <p className="text-xs text-gray-500">{leave.user?.email || "No email available"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700`}
            >
              <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
              {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                leave.status
              )}`}
            >
              {getStatusIcon(leave.status)}
              <span className="ml-1">{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">
              {leave.startDate} - {leave.endDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">{leave.totalDays} days</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <span className="font-semibold text-gray-600">Reason:</span>
            <span className="text-gray-700">{leave.reason}</span>
          </div>
        </div>
        {leave.description && (
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 mb-2">{leave.description}</div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>Submitted: {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "-"}</span>
          {leave.updatedAt && leave.updatedAt !== leave.createdAt && (
            <span>Updated: {new Date(leave.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            <EyeIcon className="w-4 h-4 mr-1" /> View
          </button>
          {leave.status === LeaveStatus.PENDING && (
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PencilIcon className="w-4 h-4 mr-1" /> Edit
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <ClipboardDocumentListIcon className="w-16 h-16 text-blue-400 animate-pulse mb-4" />
          <div className="text-blue-600 text-xl font-semibold animate-pulse">Loading leave requests...</div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
            <p className="text-gray-600 mt-2">View and track your leave applications</p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Apply for Leave
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leaves"
            value={stats.totalLeaves}
            icon={<UserIcon className="w-6 h-6" />}
            color="bg-gray-100 text-gray-600"
            subtitle="Total leave requests"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<ClockIcon className="w-6 h-6" />}
            color="bg-yellow-100 text-yellow-600"
            subtitle="Leaves awaiting approval"
          />
          <StatCard
            title="Approved Leaves"
            value={stats.approvedLeaves}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
            subtitle="Leaves approved"
          />
          <StatCard
            title="Rejected Leaves"
            value={stats.rejectedLeaves}
            icon={<XCircleIcon className="w-6 h-6" />}
            color="bg-red-100 text-red-600"
            subtitle="Leaves rejected"
          />
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Leave Requests
              </label>
              <div className="relative">
                <ClipboardDocumentListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by reason or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === LeaveStatus.PENDING
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setStatusFilter(LeaveStatus.PENDING)}
              >
                Pending
              </button>
              <button
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === LeaveStatus.APPROVED
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setStatusFilter(LeaveStatus.APPROVED)}
              >
                Approved
              </button>
              <button
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === LeaveStatus.REJECTED
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setStatusFilter(LeaveStatus.REJECTED)}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Leave Requests</h2>
          {filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-500">
                {searchTerm ? "No leave requests match your search." : "You have not submitted any leave requests yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLeaves.map((leave) => (
                <LeaveRequestCard key={leave._id} leave={leave} />
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
