"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { getUserById, updateUserById } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import Image from "next/image";
import { uploadProfileImage } from "@/utils/api";
import {
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { IUser } from "@/models/User";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().optional(),
  team: z.enum(["production", "management", "admin"]).optional(),
  image: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserById(userId)
      .then((res) => {
        const user = res.data;
        setUserData(user);
        setValue("name", user.name || "");
        setValue("position", user.position || "");
        setValue("team", user.team || undefined);
        setValue("image", user.image || "");
        setImagePreview(user.image || null);
      })
      .catch(() => {
        toast.error("Failed to load user profile");
      })
      .finally(() => setLoading(false));
  }, [userId, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!userId) return;
    setLoading(true);
    try {
      let imageUrl = data.image;
      if (selectedFile) {
        imageUrl = await uploadProfileImage(selectedFile);
      }
      await updateUserById(userId, { ...data, image: imageUrl });
      setImagePreview(imageUrl || null);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getTeamColor = (team: string) => {
    switch (team) {
      case "production":
        return "bg-blue-100 text-blue-800";
      case "management":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
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

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>
        </div>

        {/* Stats Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{userData?.role || "Employee"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Team</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{userData?.team || "Not Assigned"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-gray-900">Active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userData?.email || ""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      {...register("position")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Junior Architect"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                    <select
                      {...register("team")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={loading}
                    >
                      <option value="">Select team</option>
                      <option value="production">Production</option>
                      <option value="management">Management</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CameraIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
              </div>

              <div className="relative group">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Profile" className="object-cover w-full h-full" fill priority />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No image uploaded</p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg px-4 py-2 shadow-lg">
                      <p className="text-sm font-medium text-gray-700">Click to change photo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Role:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userData?.role || "")}`}>
                    {userData?.role || "Employee"}
                  </span>
                </div>

                {userData?.team && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Team:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTeamColor(userData.team)}`}>
                      {userData.team}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
