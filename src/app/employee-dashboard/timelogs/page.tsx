"use client";

import { useEffect, useState } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { TimeLogData, Project, Task } from "@/types";

export default function EmployeeTimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<(TimeLogData & { _id: string; project?: Project; task?: Task })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  const fetchTimeLogs = async () => {
    setLoading(true);
    const res = await fetch("/api/timelogs");
    if (res.ok) {
      const data = await res.json();
      setTimeLogs(data);
    }
    setLoading(false);
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">My Time Logs</h1>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Time Log History</h2>
          {loading ? (
            <div className="text-center text-blue-600 py-8">Loading...</div>
          ) : timeLogs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No time logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time In</th>
                    <th className="px-4 py-2 text-left">Time Out</th>
                    <th className="px-4 py-2 text-left">Total Hours</th>
                    <th className="px-4 py-2 text-left">Overtime</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.map((log) => (
                    <tr key={log._id} className="border-b">
                      <td className="px-4 py-2">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{log.timeIn ? new Date(log.timeIn).toLocaleTimeString() : "-"}</td>
                      <td className="px-4 py-2">{log.timeOut ? new Date(log.timeOut).toLocaleTimeString() : "-"}</td>
                      <td className="px-4 py-2">{log.totalHours?.toFixed(2) ?? "-"}</td>
                      <td className="px-4 py-2">
                        {log.overtimeHours && log.overtimeHours > 0 ? (
                          <span className="text-red-600 font-semibold">{log.overtimeHours.toFixed(2)}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">{log.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
