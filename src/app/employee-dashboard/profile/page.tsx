"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUserById } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import Image from "next/image";
import toast from "react-hot-toast";
import type { IUser } from "@/models/User";
import ProfileEditModal from "./ProfileEditModal";

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    getUserById(session.user.id)
      .then((res) => setUserData(res.data))
      .catch(() => toast.error("Failed to load user profile"))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  return (
    <EmployeeDashboardLayout>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 relative overflow-x-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-white/0 to-indigo-100/0" />
        {/* Profile Card */}
        <div className="relative z-10 max-w-lg w-full mx-auto mt-16 mb-12">
          <div className="relative bg-white/90 rounded-3xl shadow-2xl border border-blue-100/70 px-8 py-12 flex flex-col items-center text-center transition-all duration-300 hover:shadow-blue-200/80 hover:scale-[1.02]">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full shadow-xl border-4 border-blue-200 bg-gradient-to-br from-blue-100/60 via-white/80 to-indigo-100/60 flex items-center justify-center overflow-hidden">
              <Image
                src={userData?.image || "/weave-symbol-tri.svg"}
                alt={userData?.name || "Profile"}
                fill
                className="object-cover rounded-full"
                unoptimized={!!userData?.image && userData.image.startsWith("data:image/")}
              />
            </div>
            <div className="mt-24" />
            <h2 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight drop-shadow-sm">
              {userData?.name || <span className="text-gray-400">-</span>}
            </h2>
            <div className="text-xl text-blue-700 font-semibold mb-1">
              {userData?.position || <span className="text-gray-400">No position</span>}
            </div>
            <div className="text-base text-gray-500 mb-4">
              {userData?.email || <span className="text-gray-400">No email</span>}
            </div>
            <div className="flex flex-col items-center gap-1 mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 shadow-sm">
                Active
              </span>
              {userData?.role && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 shadow-sm capitalize mt-1">
                  {userData.role}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mb-2">
              Member since: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "-"}
            </div>
            {/* Floating Edit Button */}
            <button
              className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setEditOpen(true)}
              aria-label="Edit Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.978 18.312a4.2 4.2 0 0 1-1.768 1.05l-3.13.939.94-3.13a4.2 4.2 0 0 1 1.05-1.768L16.862 4.487Z"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Profile Edit Modal */}
        <ProfileEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          userData={userData}
          onProfileUpdated={setUserData}
        />
      </div>
    </EmployeeDashboardLayout>
  );
}
