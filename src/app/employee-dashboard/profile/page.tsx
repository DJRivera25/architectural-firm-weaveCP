"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { updateUser } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import Image from "next/image";

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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("position", session.user.position || "");
      setValue("team", (session.user.team as "production" | "management" | "admin" | undefined) || undefined);
      setValue("image", session.user.image || "");
      setImagePreview(session.user.image || null);
    }
  }, [session, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await updateUser(session?.user?.id || "", data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      // TODO: Upload to Cloudinary and setValue("image", url)
    }
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 bg-gray-100">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile" className="object-cover w-full h-full" fill sizes="96px" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-3xl text-blue-600 font-bold">
                  U
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              {...register("position")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              {...register("team")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              disabled={loading}
            >
              <option value="">Select team</option>
              <option value="production">Production</option>
              <option value="management">Management</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </EmployeeDashboardLayout>
  );
}
