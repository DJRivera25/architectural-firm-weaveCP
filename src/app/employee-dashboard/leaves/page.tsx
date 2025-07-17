"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import LeaveRequestForm from "@/components/ui/LeaveRequestForm";
import LeaveRequestCard from "@/components/ui/LeaveRequestCard";
import EmployeeLeaveCredits from "@/components/ui/EmployeeLeaveCredits";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { getLeaves } from "@/utils/api";
import { LeaveWithUser, LeaveStatus } from "@/types";

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<LeaveStatus | "all">("all");

  const fetchLeaves = async () => {
    try {
      const response = await getLeaves();
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = leaves.filter((leave) => (filter === "all" ? true : leave.status === filter));

  const getStatusCount = (status: LeaveStatus) => {
    return leaves.filter((leave) => leave.status === status).length;
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchLeaves();
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600">Request and manage your leave applications</p>
            </div>
            <Button onClick={() => setShowForm(true)}>Request Leave</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">{getStatusCount(LeaveStatus.PENDING)}</div>
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

          <EmployeeLeaveCredits />

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Leave History</h2>
                <div className="flex space-x-2">
                  <Button size="sm" variant={filter === "all" ? "primary" : "outline"} onClick={() => setFilter("all")}>
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

            <div className="p-6">
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No leave requests found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLeaves.map((leave) => (
                    <LeaveRequestCard
                      key={leave._id}
                      leave={leave}
                      onUpdate={fetchLeaves}
                      canEdit={leave.status === LeaveStatus.PENDING}
                      canDelete={leave.status === LeaveStatus.PENDING}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Request Leave</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <LeaveRequestForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
