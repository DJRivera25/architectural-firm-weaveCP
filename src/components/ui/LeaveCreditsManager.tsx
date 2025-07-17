"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getLeaveCredits, getUsers, createLeaveCredit } from "@/utils/api";
import { LeaveCredit, LeaveType } from "@/types";
import { IUser } from "@/models/User";

interface LeaveCreditsManagerProps {
  onUpdate?: () => void;
}

export default function LeaveCreditsManager({ onUpdate }: LeaveCreditsManagerProps) {
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    year: new Date().getFullYear(),
    leaveType: "" as LeaveType,
    totalCredits: 0,
  });

  const fetchData = async () => {
    try {
      const [creditsResponse, usersResponse] = await Promise.all([getLeaveCredits(), getUsers()]);
      setLeaveCredits(creditsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.leaveType || formData.totalCredits <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createLeaveCredit({
        ...formData,
        usedCredits: 0,
        remainingCredits: formData.totalCredits,
      });

      setShowAddForm(false);
      setFormData({
        userId: "",
        year: new Date().getFullYear(),
        leaveType: "" as LeaveType,
        totalCredits: 0,
      });

      fetchData();
      onUpdate?.();
    } catch (error) {
      console.error("Error creating leave credit:", error);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown User";
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Leave Credits Management</h2>
        <Button onClick={() => setShowAddForm(true)}>Add Leave Credits</Button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Credits
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveCredits.map((credit) => (
                <tr key={credit._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getUserName(credit.userId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{credit.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getLeaveTypeLabel(credit.leaveType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{credit.totalCredits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{credit.usedCredits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`font-medium ${credit.remainingCredits < 5 ? "text-red-600" : "text-green-600"}`}>
                      {credit.remainingCredits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add Leave Credits</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  ✕
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">Select employee</option>
                  {users.map((user) => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
                  min={new Date().getFullYear() - 1}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <Select
                  value={formData.leaveType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, leaveType: e.target.value as LeaveType }))}
                >
                  <option value="">Select leave type</option>
                  <option value={LeaveType.VACATION}>Vacation</option>
                  <option value={LeaveType.SICK}>Sick Leave</option>
                  <option value={LeaveType.PERSONAL}>Personal Leave</option>
                  <option value={LeaveType.MATERNITY}>Maternity Leave</option>
                  <option value={LeaveType.PATERNITY}>Paternity Leave</option>
                  <option value={LeaveType.BEREAVEMENT}>Bereavement</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits *</label>
                <Input
                  type="number"
                  value={formData.totalCredits}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalCredits: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Credits</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
