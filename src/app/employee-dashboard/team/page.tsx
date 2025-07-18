"use client";

import { useEffect, useState } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { getMyTeams } from "@/utils/api";
import { ITeam } from "@/models/Team";
import { IUser } from "@/models/User";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import {
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EnvelopeIcon,
  StarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

// Helper type guard for IUser
function isIUser(obj: unknown): obj is IUser {
  return (
    !!obj &&
    typeof obj === "object" &&
    typeof (obj as Record<string, unknown>)._id === "string" &&
    typeof (obj as Record<string, unknown>).name === "string" &&
    typeof (obj as Record<string, unknown>).email === "string" &&
    typeof (obj as Record<string, unknown>).role === "string"
  );
}

export default function EmployeeTeamPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<ITeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMyTeams();
        setTeam(data.teams && data.teams.length > 0 ? data.teams[0] : null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get manager data
  const manager = team && isIUser(team.manager) ? team.manager : undefined;
  // Get members data
  const members =
    team && Array.isArray(team.members)
      ? team.members.reduce((acc: IUser[], m) => (isIUser(m) ? [...acc, m] : acc), [])
      : [];
  // Only use IUser objects for allMembers
  const safeAllMembers: IUser[] =
    manager && isIUser(manager) && !members.some((m) => m._id === manager._id) ? [manager, ...members] : members;
  // Filter members based on search and role, only include IUser
  const filteredMembers: IUser[] = safeAllMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter || member.position === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    totalMembers: safeAllMembers.length,
    managers: safeAllMembers.filter((m) => m.role === "manager" || m.role === "admin").length,
    employees: safeAllMembers.filter((m) => m.role === "employee").length,
    activeMembers: safeAllMembers.length, // Assuming all are active for now
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-purple-100 text-purple-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <StarIcon className="w-4 h-4" />;
      case "manager":
        return <UserIcon className="w-4 h-4" />;
      case "employee":
        return <UserGroupIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  if (!team) {
    return (
      <EmployeeDashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Team Assignment</h2>
            <p className="text-gray-600">You are not currently assigned to any team.</p>
            <p className="text-gray-500 text-sm mt-2">Please contact your administrator for team assignment.</p>
          </div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
            <p className="text-gray-600 mt-2">Connect with your team members and collaborate effectively</p>
          </div>
        </div>

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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalMembers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Managers</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.managers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Employees</p>
                      <p className="text-2xl font-bold text-green-600">{stats.employees}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Members</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.activeMembers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Team Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Team Name</p>
                    <p className="font-medium text-gray-900">{team.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Manager</h3>
              {isIUser(manager) ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar src={manager.image} alt={manager.name} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{manager.name}</p>
                    <p className="text-sm text-gray-600">{manager.position || manager.role}</p>
                    <p className="text-sm text-gray-500">{manager.email}</p>
                  </div>
                  <Badge color={getRoleColor(manager.role)}>
                    {getRoleIcon(manager.role)}
                    <span className="ml-1">{manager.role}</span>
                  </Badge>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">No manager assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div key={member._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar src={member.image} alt={member.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                      <Badge color={getRoleColor(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1 text-xs">{member.role}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{member.position || "No position"}</p>
                    <div className="space-y-1">
                      {member.email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <EnvelopeIcon className="w-3 h-3 mr-1" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>
                          Member since {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No team members found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
