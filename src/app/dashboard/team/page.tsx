"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { IUser } from "@/models/User";
import { getUsers, updateUser } from "@/utils/api";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Crown, Wrench } from "lucide-react";
import Image from "next/image";

type UserForm = {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "employee" | "manager";
  team?: "production" | "management" | "admin";
  position?: string;
  image?: string;
  isActive?: boolean;
};

const TEAMS = [
  {
    value: "production",
    label: "Production",
    icon: <BuildingOfficeIcon className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "management",
    label: "Management",
    icon: <UserGroupIcon className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-800",
  },
  { value: "admin", label: "Admin", icon: <Cog6ToothIcon className="w-6 h-6" />, color: "bg-red-100 text-red-800" },
];

const ROLES = [
  { value: "owner", label: "Owner", icon: <Crown className="w-6 h-6" />, color: "bg-yellow-100 text-yellow-800" },
  { value: "admin", label: "Admin", icon: <ShieldCheckIcon className="w-6 h-6" />, color: "bg-red-100 text-red-800" },
  {
    value: "manager",
    label: "Manager",
    icon: <UserGroupIcon className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "employee",
    label: "Employee",
    icon: <Wrench className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-800",
  },
];

export default function TeamManagementPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<UserForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter((user) => selectedTeam === "all" || user.team === selectedTeam)
    .filter((user) => selectedRole === "all" || user.role === selectedRole)
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleUpdateUser = async (id: string, formData: FormData) => {
    try {
      const updatedUser: Partial<IUser> = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as "owner" | "admin" | "employee" | "manager",
        team: formData.get("team") as "production" | "management" | "admin" | undefined,
        position: formData.get("position") as string,
      };

      await updateUser(id, updatedUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const toggleUserStatus = async (user: IUser) => {
    try {
      if (user._id) {
        await updateUser(user._id, { isActive: !user.isActive });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const getTeamStats = () => {
    return TEAMS.map((team) => {
      const teamUsers = users.filter((u) => u.team === team.value);
      return {
        ...team,
        count: teamUsers.length,
        active: teamUsers.filter((u) => u.isActive !== false).length,
        inactive: teamUsers.filter((u) => u.isActive === false).length,
      };
    });
  };

  const getRoleStats = () => {
    return ROLES.map((role) => {
      const roleUsers = users.filter((u) => u.role === role.value);
      return {
        ...role,
        count: roleUsers.length,
        active: roleUsers.filter((u) => u.isActive !== false).length,
        inactive: roleUsers.filter((u) => u.isActive === false).length,
      };
    });
  };

  const getRecentActivity = () => {
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 border-b-2 border-gray-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage team members, roles, and permissions</p>
          </div>
          <button
            onClick={() =>
              setEditingUser({
                _id: "",
                name: "",
                email: "",
                role: "employee",
                team: "production",
                position: "",
                image: "",
                isActive: true,
              })
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getTeamStats().map((stat) => (
            <div
              key={stat.value}
              onClick={() => setSelectedTeam(stat.value)}
              className={`bg-white p-6 rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                selectedTeam === stat.value
                  ? "border-blue-500 hover:border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-green-600">Active: {stat.active}</span>
                <span className="text-gray-400">•</span>
                <span className="text-red-600">Inactive: {stat.inactive}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getRoleStats().map((role) => (
              <div
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRole === role.value
                    ? "border-blue-500 hover:border-blue-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{role.label}</p>
                    <p className="text-sm text-gray-600">{role.count} members</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Team Members */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id || user.email}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.position || "No position"}</p>
                    </div>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`p-2 rounded-full ${
                        user.isActive !== false ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                      }`}
                    >
                      {user.isActive !== false ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <XCircleIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          TEAMS.find((t) => t.value === user.team)?.color || "bg-gray-100"
                        }`}
                      >
                        {TEAMS.find((t) => t.value === user.team)?.icon}{" "}
                        {TEAMS.find((t) => t.value === user.team)?.label || "No team"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ROLES.find((r) => r.value === user.role)?.color || "bg-gray-100"
                        }`}
                      >
                        {ROLES.find((r) => r.value === user.role)?.icon}{" "}
                        {ROLES.find((r) => r.value === user.role)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUserDetails(user._id || user.email)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingUser(user)} className="text-gray-600 hover:text-gray-800">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id || user.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <UserIcon className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            TEAMS.find((t) => t.value === user.team)?.color || "bg-gray-100"
                          }`}
                        >
                          {TEAMS.find((t) => t.value === user.team)?.icon}{" "}
                          {TEAMS.find((t) => t.value === user.team)?.label || "No team"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ROLES.find((r) => r.value === user.role)?.color || "bg-gray-100"
                          }`}
                        >
                          {ROLES.find((r) => r.value === user.role)?.icon}{" "}
                          {ROLES.find((r) => r.value === user.role)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100"
                          }`}
                        >
                          {user.isActive !== false ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 mr-1" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowUserDetails(user._id || user.email)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingUser(user)} className="text-gray-600 hover:text-gray-800">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedTeam !== "all" || selectedRole !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first team member."}
            </p>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {getRecentActivity().map((user) => (
              <div key={user._id || user.email} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name} joined the team</p>
                  <p className="text-xs text-gray-500">Date: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    TEAMS.find((t) => t.value === user.team)?.color || "bg-gray-100"
                  }`}
                >
                  {TEAMS.find((t) => t.value === user.team)?.label || "No team"}{" "}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Team Member</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (editingUser._id) {
                    handleUpdateUser(editingUser._id, formData);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={editingUser.position || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    name="team"
                    defaultValue={editingUser.team || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a team</option>
                    {TEAMS.map((team) => (
                      <option key={team.value} value={team.value}>
                        {team.icon} {team.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md max-h-[90vh] overflow-y-auto">
              {(() => {
                const user = users.find((u) => u._id === showUserDetails || u.email === showUserDetails);
                if (!user) return null;

                return (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">User Details</h2>
                      <button onClick={() => setShowUserDetails(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                          <UserIcon className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.position || "No position"}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <UserGroupIcon className="w-5 h-5 text-gray-400" />
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            TEAMS.find((t) => t.value === user.team)?.color || "bg-gray-100"
                          }`}
                        >
                          {TEAMS.find((t) => t.value === user.team)?.icon}{" "}
                          {TEAMS.find((t) => t.value === user.team)?.label || "No team"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ROLES.find((r) => r.value === user.role)?.color || "bg-gray-100"
                          }`}
                        >
                          {ROLES.find((r) => r.value === user.role)?.icon}{" "}
                          {ROLES.find((r) => r.value === user.role)?.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100"
                          }`}
                        >
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
