"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LeaveWithUser, LeaveStatus, LeaveType } from "@/types";
import { updateLeaveRequest, deleteLeaveRequest } from "@/utils/api";

interface LeaveRequestCardProps {
  leave: LeaveWithUser;
  onUpdate?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function LeaveRequestCard({
  leave,
  onUpdate,
  canApprove = false,
  canEdit = false,
  canDelete = false,
}: LeaveRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case LeaveStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case LeaveStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case LeaveType.VACATION:
        return "bg-blue-100 text-blue-800";
      case LeaveType.SICK:
        return "bg-red-100 text-red-800";
      case LeaveType.PERSONAL:
        return "bg-purple-100 text-purple-800";
      case LeaveType.MATERNITY:
        return "bg-pink-100 text-pink-800";
      case LeaveType.PATERNITY:
        return "bg-indigo-100 text-indigo-800";
      case LeaveType.BEREAVEMENT:
        return "bg-gray-100 text-gray-800";
      case LeaveType.UNPAID:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDays = () => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleStatusUpdate = async (status: LeaveStatus) => {
    setIsLoading(true);
    try {
      await updateLeaveRequest(leave._id, { status });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating leave status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this leave request?")) return;

    setIsLoading(true);
    try {
      await deleteLeaveRequest(leave._id);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting leave request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{leave.user?.name || "Unknown User"}</h3>
          <p className="text-sm text-gray-600">{leave.user?.email || "No email available"}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
            {leave.leaveType.replace("_", " ")}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
            {leave.status}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duration:</span>
          <span className="font-medium">{calculateDays()} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End Date:</span>
          <span className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Reason:</span>
          <span className="font-medium">{leave.reason}</span>
        </div>
      </div>

      {leave.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{leave.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Submitted: {new Date(leave.createdAt).toLocaleDateString()}</span>
        {leave.updatedAt !== leave.createdAt && <span>Updated: {new Date(leave.updatedAt).toLocaleDateString()}</span>}
      </div>

      {(canApprove || canEdit || canDelete) && (
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          {canApprove && leave.status === LeaveStatus.PENDING && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(LeaveStatus.REJECTED)}
                disabled={isLoading}
              >
                Reject
              </Button>
              <Button size="sm" onClick={() => handleStatusUpdate(LeaveStatus.APPROVED)} disabled={isLoading}>
                Approve
              </Button>
            </>
          )}

          {canEdit && leave.status === LeaveStatus.PENDING && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                /* TODO: Implement edit modal */
              }}
              disabled={isLoading}
            >
              Edit
            </Button>
          )}

          {canDelete && leave.status === LeaveStatus.PENDING && (
            <Button size="sm" variant="outline" onClick={handleDelete} disabled={isLoading}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
