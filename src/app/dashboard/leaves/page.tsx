"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import LeaveRequestCard from "@/components/ui/LeaveRequestCard";
import LeaveCreditsManager from "@/components/ui/LeaveCreditsManager";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getLeaves } from "@/utils/api";
import { LeaveWithUser, LeaveStatus } from "@/types";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<LeaveStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaves = async () => {
    try {
      const response = await getLeaves();
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = leaves.filter((leave) => {
    const matchesFilter = filter === "all" ? true : leave.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      (leave.user?.name && leave.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.user?.email && leave.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status: LeaveStatus) => {
    return leaves.filter((leave) => leave.status === status).length;
  };

  const getPendingCount = () => {
    return getStatusCount(LeaveStatus.PENDING);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600">Review and approve employee leave requests</p>
            </div>
            {getPendingCount() > 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
                {getPendingCount()} pending request{getPendingCount() !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-yellow-600">{getStatusCount(LeaveStatus.PENDING)}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">{getStatusCount(LeaveStatus.APPROVED)}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-red-600">{getStatusCount(LeaveStatus.REJECTED)}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-gray-600">{leaves.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by name, email, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={filter === "all" ? "primary" : "outline"}
                      onClick={() => setFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === LeaveStatus.PENDING ? "primary" : "outline"}
                      onClick={() => setFilter(LeaveStatus.PENDING)}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === LeaveStatus.APPROVED ? "primary" : "outline"}
                      onClick={() => setFilter(LeaveStatus.APPROVED)}
                    >
                      Approved
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === LeaveStatus.REJECTED ? "primary" : "outline"}
                      onClick={() => setFilter(LeaveStatus.REJECTED)}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? "No leave requests match your search." : "No leave requests found."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLeaves.map((leave) => (
                    <LeaveRequestCard
                      key={leave._id}
                      leave={leave}
                      onUpdate={fetchLeaves}
                      canApprove={true}
                      canEdit={false}
                      canDelete={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <LeaveCreditsManager onUpdate={fetchLeaves} />
        </div>
      </div>
    </DashboardLayout>
  );
}
