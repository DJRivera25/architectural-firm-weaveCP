"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LeaveWithUser, LeaveStatus, LeaveType } from "@/types";
import { updateLeaveRequest, deleteLeaveRequest } from "@/utils/api";
import {
  UserIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      {/* Header: User info and badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
            <UserIcon className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{leave.user?.name || "Unknown User"}</h3>
            <p className="text-xs text-gray-500">{leave.user?.email || "No email available"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLeaveTypeColor(
              leave.leaveType
            )}`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
            {leave.leaveType.replace("_", " ")}
          </span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              leave.status
            )}`}
          >
            {leave.status === LeaveStatus.APPROVED && <CheckCircleIcon className="w-4 h-4 mr-1" />}
            {leave.status === LeaveStatus.REJECTED && <XCircleIcon className="w-4 h-4 mr-1" />}
            {leave.status === LeaveStatus.PENDING && <ClockIcon className="w-4 h-4 mr-1" />}
            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">{calculateDays()} days</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <span className="font-semibold text-gray-600">Reason:</span>
          <span className="text-gray-700">{leave.reason}</span>
        </div>
      </div>

      {/* Description */}
      {leave.description && (
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 mb-2">{leave.description}</div>
      )}

      {/* Footer: Submitted/Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>Submitted: {new Date(leave.createdAt).toLocaleDateString()}</span>
        {leave.updatedAt !== leave.createdAt && <span>Updated: {new Date(leave.updatedAt).toLocaleDateString()}</span>}
      </div>

      {/* Action Buttons */}
      {(canApprove || canEdit || canDelete) && (
        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          {canApprove && leave.status === LeaveStatus.PENDING && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(LeaveStatus.REJECTED)}
                disabled={isLoading}
              >
                <XCircleIcon className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={() => handleStatusUpdate(LeaveStatus.APPROVED)} disabled={isLoading}>
                <CheckCircleIcon className="w-4 h-4 mr-1" /> Approve
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
              <PencilIcon className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
          {canDelete && leave.status === LeaveStatus.PENDING && (
            <Button size="sm" variant="outline" onClick={handleDelete} disabled={isLoading}>
              <TrashIcon className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
