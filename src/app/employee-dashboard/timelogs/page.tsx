"use client";

import { useEffect, useState, useMemo } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { TimeLogData, Project, Task } from "@/types";
import { PlusIcon, ClockIcon, CalendarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function EmployeeTimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<(TimeLogData & { _id: string; project?: Project; task?: Task })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("week");
  const [showAdd, setShowAdd] = useState(false);

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

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekLogs = timeLogs.filter((log) => new Date(log.date) >= weekStart);
    const monthLogs = timeLogs.filter((log) => new Date(log.date) >= monthStart);
    const totalWeek = weekLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
    const totalMonth = monthLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
    const overtime = timeLogs.reduce((sum, log) => sum + (log.overtimeHours || 0), 0);
    return { totalWeek, totalMonth, overtime, entries: timeLogs.length };
  }, [timeLogs]);

  // Filtered logs
  const filtered = useMemo(() => {
    let logs = [...timeLogs];
    const now = new Date();
    if (dateFilter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      logs = logs.filter((log) => new Date(log.date) >= weekStart);
    } else if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      logs = logs.filter((log) => new Date(log.date) >= monthStart);
    }
    if (search) {
      logs = logs.filter(
        (log) =>
          log.notes?.toLowerCase().includes(search.toLowerCase()) ||
          log.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
          log.task?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return logs;
  }, [timeLogs, dateFilter, search]);

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Time Logs</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            <PlusIcon className="w-5 h-5" /> Add Time Log
          </button>
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-lg font-bold text-blue-700">{stats.totalWeek.toFixed(2)}h</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalMonth.toFixed(2)}h</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-xs text-gray-500">Overtime</p>
              <p className="text-lg font-bold text-red-600">{stats.overtime.toFixed(2)}h</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Entries</p>
              <p className="text-lg font-bold text-gray-900">{stats.entries}</p>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by notes, project, or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        {/* Time Log Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Time Log History</h2>
          {loading ? (
            <div className="text-center text-blue-600 py-8">Loading...</div>
          ) : filtered.length === 0 ? (
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
                    <th className="px-4 py-2 text-left">Project</th>
                    <th className="px-4 py-2 text-left">Task</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
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
                      <td className="px-4 py-2">{log.project?.name || "-"}</td>
                      <td className="px-4 py-2">{log.task?.name || "-"}</td>
                      <td className="px-4 py-2">{log.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Add Time Log Modal (coming soon) */}
        {/* {showAdd && <AddTimeLogModal onClose={() => setShowAdd(false)} onSave={fetchTimeLogs} />} */}
      </div>
    </EmployeeDashboardLayout>
  );
}
