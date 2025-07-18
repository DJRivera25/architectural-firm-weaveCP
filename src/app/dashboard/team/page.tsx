"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { getTeams, getUsers } from "@/utils/api";
import mongoose, { Types } from "mongoose";
import { IUser } from "@/models/User";
import { ITeam } from "@/models/Team";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

// Define plain frontend types for Team and User
interface Team {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  manager?: User | string;
  createdAt: string;
  updatedAt: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  image?: string;
  position?: string;
  team?: string;
  createdAt?: string;
}

interface TeamStats {
  totalTeams: number;
  totalMembers: number;
  activeMembers: number;
  averageTeamSize: number;
  managersCount: number;
  recentTeams: number;
  emptyTeams: number;
  memberDistribution: { role: string; count: number }[];
}

export default function TeamManager() {
  // Use Team and User for state and mapping
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalTeams: 0,
    totalMembers: 0,
    activeMembers: 0,
    averageTeamSize: 0,
    managersCount: 0,
    recentTeams: 0,
    emptyTeams: 0,
    memberDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([getTeams(), getUsers()]);
      const teamsData = teamsRes.data || [];
      const usersData = usersRes.data || [];

      // Use Team and User for state and mapping
      const mappedTeams: Team[] = teamsData.map((team: unknown) => {
        const t = team as Partial<Team>;
        return {
          ...t,
          _id: String(t._id),
          manager:
            t.manager && typeof t.manager === "object" && "_id" in t.manager
              ? { ...(t.manager as User), _id: String((t.manager as User)._id) }
              : t.manager,
          members: Array.isArray(t.members)
            ? t.members.map((m: unknown) => {
                if (typeof m === "object" && m && "_id" in m && typeof (m as { _id: unknown })._id === "string") {
                  return String((m as { _id: string })._id);
                }
                if (typeof m === "string") {
                  return m;
                }
                return "";
              })
            : [],
          name: t.name ?? "",
          createdAt: t.createdAt ?? "",
          updatedAt: t.updatedAt ?? "",
        };
      });
      const mappedUsers: User[] = usersData.map((user: unknown) => {
        const u = user as Partial<User>;
        return {
          ...u,
          _id: String(u._id),
          name: u.name ?? "",
          email: u.email ?? "",
          isActive: u.isActive === undefined ? false : u.isActive,
          role: u.role ?? "",
          image: u.image,
          position: u.position ?? "",
          team: u.team ?? "",
          createdAt: u.createdAt ?? "",
        };
      });
      setTeams(mappedTeams);
      setUsers(mappedUsers);
      calculateStats(mappedTeams, mappedUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (teamsData: Team[], usersData: User[]) => {
    const totalMembers = usersData.length;
    const activeMembers = usersData.filter((user) => user.isActive).length;
    const averageTeamSize =
      teamsData.length > 0 ? teamsData.reduce((sum, team) => sum + team.members.length, 0) / teamsData.length : 0;
    const managersCount = usersData.filter((user) => user.role === "manager").length;
    const recentTeams = teamsData.filter((team) => {
      const createdDate = new Date(team.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate > thirtyDaysAgo;
    }).length;
    const emptyTeams = teamsData.filter((team) => team.members.length === 0).length;

    // Calculate role distribution
    const roleCounts = usersData.reduce((acc, user) => {
      acc[user.role ?? "unknown"] = (acc[user.role ?? "unknown"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const memberDistribution = Object.entries(roleCounts).map(([role, count]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      count,
    }));

    setStats({
      totalTeams: teamsData.length,
      totalMembers,
      activeMembers,
      averageTeamSize,
      managersCount,
      recentTeams,
      emptyTeams,
      memberDistribution,
    });
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role ?? "unknown").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

  const TeamCard = ({ team }: { team: Team }) => {
    const getManagerInfo = () => {
      if (team.manager && typeof team.manager === "object" && "name" in team.manager) {
        return team.manager as User;
      }
      return null;
    };

    const manager = getManagerInfo();
    const teamMembers = users.filter((user) => team.members.includes(user._id));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {team.name}
              </h3>
              {team.description && <p className="text-sm text-gray-600 mt-1">{team.description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Active
            </span>
          </div>
        </div>

        {/* Team Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="w-4 h-4 mr-2" />
            <span>{team.members.length} members</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            <span>{manager ? manager.name : "No manager"}</span>
          </div>
        </div>

        {/* Team Members Preview */}
        {teamMembers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Team Members</p>
            <div className="flex flex-wrap gap-2">
              {teamMembers.slice(0, 4).map((member) => (
                <div key={member._id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-gray-700">{member.name}</span>
                </div>
              ))}
              {teamMembers.length > 4 && (
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-500">+{teamMembers.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created: {new Date(team.createdAt).toLocaleDateString()}</div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UserCard = ({ user }: { user: User }) => {
    const getRoleColor = (role: string) => {
      switch (role) {
        case "owner":
          return "bg-blue-100 text-blue-700 border-blue-200";
        case "admin":
          return "bg-green-100 text-green-700 border-green-200";
        case "manager":
          return "bg-purple-100 text-purple-700 border-purple-200";
        case "employee":
          return "bg-yellow-100 text-yellow-700 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    };
    const roleString = typeof user.role === "string" ? user.role : "unknown";
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
              getRoleColor(roleString)
            )}
          >
            {roleString.charAt(0).toUpperCase() + roleString.slice(1)}
          </span>
          {user.isActive && <span className="ml-2 text-green-600 text-xs">Active</span>}
        </div>
        {user.position && <div className="text-xs text-gray-500">Position: {user.position}</div>}
        {user.team && <div className="text-xs text-gray-500">Team: {user.team}</div>}
        <div className="text-xs text-gray-400 mt-2">Joined: {user.createdAt ? user.createdAt : "-"}</div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage your teams and team members</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Team
          </button>
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
                <StatCard
                  title="Total Teams"
                  value={stats.totalTeams}
                  icon={<UserGroupIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Active teams"
                />
                <StatCard
                  title="Total Members"
                  value={stats.totalMembers}
                  icon={<UserIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle={`${stats.activeMembers} active`}
                  trend={stats.activeMembers > stats.totalMembers / 2 ? "up" : "down"}
                  trendValue={`${stats.activeMembers} active`}
                />
                <StatCard
                  title="Average Team Size"
                  value={stats.averageTeamSize.toFixed(1)}
                  icon={<UserGroupIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="Members per team"
                />
                <StatCard
                  title="Managers"
                  value={stats.managersCount}
                  icon={<BriefcaseIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="Team leaders"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Teams & Members
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Teams ({filteredTeams.length})</h2>
            <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton height={200} />
              </motion.div>
            ) : filteredTeams.length === 0 ? (
              <motion.div
                key="no-teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="text-center py-12">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or create a new team.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTeams.map((team) => (
                    <TeamCard key={team._id} team={team} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Team Members Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Team Members ({filteredUsers.length})</h2>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading-users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton height={200} />
              </motion.div>
            ) : filteredUsers.length === 0 ? (
              <motion.div
                key="no-users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredUsers.map((user) => (
                    <UserCard key={user._id} user={user} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
