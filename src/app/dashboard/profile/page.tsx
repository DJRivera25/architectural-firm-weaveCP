"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { getUserById, updateUserById } from "@/utils/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";
import { uploadProfileImage } from "@/utils/api";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().optional(),
  team: z.enum(["production", "management", "admin"]).optional(),
  image: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 animate-fadeInSlow">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-0 flex flex-col md:flex-row">
          <div className="md:w-1/2 p-10 flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">My Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                <input
                  {...register("name")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  disabled={loading}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Position</label>
                <input
                  {...register("position")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Team</label>
                <select
                  {...register("team")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
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
                className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
          <div className="md:w-1/2 flex items-center justify-center bg-gray-100 relative min-h-[350px]">
            {imagePreview ? (
              <Image src={imagePreview} alt="Profile" className="object-cover w-full h-full" fill priority />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-6xl text-blue-600 font-bold">U</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 rounded-lg px-4 py-2 shadow text-blue-800 font-semibold text-sm pointer-events-none">
              Click to change photo
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
