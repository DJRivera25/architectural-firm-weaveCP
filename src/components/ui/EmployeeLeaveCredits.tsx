"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getLeaveCredits } from "@/utils/api";
import { LeaveCredit, LeaveType } from "@/types";

export default function EmployeeLeaveCredits() {
  const { data: session } = useSession();
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaveCredits = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await getLeaveCredits(`?userId=${session.user.id}`);
      setLeaveCredits(response.data);
    } catch (error) {
      console.error("Error fetching leave credits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchLeaveCredits();
  }, [fetchLeaveCredits]);

  const getLeaveTypeLabel = (type: LeaveType) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getCurrentYearCredits = () => {
    const currentYear = new Date().getFullYear();
    return leaveCredits.filter((credit) => credit.year === currentYear);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentYearCredits = getCurrentYearCredits();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Leave Credits ({new Date().getFullYear()})</h3>

      {currentYearCredits.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No leave credits found for this year.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentYearCredits.map((credit) => (
            <div key={credit._id} className="bg-white rounded-lg shadow border p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{getLeaveTypeLabel(credit.leaveType)}</h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    credit.remainingCredits < 5 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {credit.remainingCredits} remaining
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-medium">{credit.totalCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Used Credits:</span>
                  <span className="font-medium text-red-600">{credit.usedCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className={`font-medium ${credit.remainingCredits < 5 ? "text-red-600" : "text-green-600"}`}>
                    {credit.remainingCredits}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
