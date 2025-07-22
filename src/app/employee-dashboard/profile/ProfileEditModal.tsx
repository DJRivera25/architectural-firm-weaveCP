import { useState } from "react";
import Image from "next/image";
import { UserIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { uploadProfileImage, updateUserById } from "@/utils/api";
import toast from "react-hot-toast";
import type { IUser } from "@/models/User";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().optional(),
  image: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfileEditModal({
  open,
  onOpenChange,
  userData,
  onProfileUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: IUser | null;
  onProfileUpdated: (user: IUser) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(userData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userData?.name || "",
      position: userData?.position || "",
      image: userData?.image || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!userData?._id) return;
    setLoading(true);
    try {
      let imageUrl = data.image;
      if (selectedFile) {
        imageUrl = await uploadProfileImage(selectedFile);
      }
      const updated = await updateUserById(userData._id, { ...data, image: imageUrl });
      setImagePreview(imageUrl || null);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
      onProfileUpdated(updated.data);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative max-w-sm mx-auto flex flex-col bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 rounded-2xl shadow-2xl border border-blue-100/70 p-0"
          style={{ minWidth: 260 }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-blue-100/60 rounded-t-2xl bg-white/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-700" />
              <span className="text-base font-bold tracking-tight text-blue-900 font-archivo">Edit Profile</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-1 hover:bg-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => onOpenChange(false)}
              tabIndex={0}
            >
              <XMarkIcon className="w-5 h-5 text-blue-700" />
            </button>
          </div>
          {/* Watermark logo */}
          <Image
            src="/weave-hsymbol-tri.svg"
            alt="Watermark"
            width={48}
            height={48}
            className="pointer-events-none select-none opacity-10 absolute bottom-1 right-1 z-0 w-12 h-12"
          />
          <div className="relative z-10 flex-1 px-6 py-6 flex flex-col gap-6 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-50/60 rounded-b-2xl">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-2">
              <div
                className={`relative group w-28 h-28 flex items-center justify-center transition-all duration-200 rounded-full shadow-xl border-4 border-blue-200 bg-gradient-to-br from-blue-100/60 via-white/80 to-indigo-100/60 hover:scale-105 focus-within:scale-105 cursor-pointer ${
                  dragActive ? "ring-4 ring-blue-400 ring-offset-2 bg-blue-50" : ""
                }`}
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100/40 via-white/60 to-indigo-100/40 z-0" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-blue-200">
                  <Image
                    key={imagePreview || userData?.image || "/weave-hsymbol-tri.svg"}
                    src={imagePreview || userData?.image || "/weave-hsymbol-tri.svg"}
                    alt={userData?.name || "Profile"}
                    fill
                    className="object-cover rounded-full"
                    unoptimized={!!imagePreview && imagePreview.startsWith("data:image/")}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/weave-hsymbol-tri.svg";
                    }}
                  />
                </div>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  onChange={handleImageChange}
                  tabIndex={0}
                  aria-label="Upload profile photo"
                />
                {/* Plus button overlay */}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  style={{ width: 32, height: 32 }}
                  onClick={() => document.getElementById("profile-image-upload")?.click()}
                  tabIndex={0}
                  aria-label="Add or change profile photo"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                {/* Tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-200">
                  <div className="bg-blue-700 text-white text-xs rounded-lg px-3 py-1 shadow-lg font-semibold">
                    Change Photo
                  </div>
                </div>
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-blue-100 bg-opacity-60 z-40 pointer-events-none animate-pulse">
                    <span className="text-blue-700 font-semibold text-base">Drop image to upload</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">JPG, PNG, or GIF. Max 5MB.</div>
            </div>
            {/* Floating label inputs (custom) */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="relative">
                <input
                  id="profile-name"
                  type="text"
                  autoComplete="off"
                  {...register("name")}
                  disabled={loading}
                  className={`peer block w-full px-4 pt-6 pb-2 bg-white/80 border-2 rounded-lg font-semibold text-base text-blue-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ${
                    errors.name ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-blue-100"
                  }`}
                  placeholder=" "
                />
                <label
                  htmlFor="profile-name"
                  className="absolute left-4 top-2 text-base font-bold text-blue-700 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-blue-700"
                >
                  Full Name
                </label>
                {errors.name && <div className="text-red-600 text-xs mt-1 font-semibold">{errors.name.message}</div>}
              </div>
              {/* Email (read-only) */}
              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="block w-full px-4 pt-6 pb-2 bg-gray-100 border-2 border-blue-50 rounded-lg font-semibold text-base text-gray-500 shadow focus:outline-none cursor-not-allowed"
                  placeholder=" "
                />
                <label
                  htmlFor="profile-email"
                  className="absolute left-4 top-2 text-base font-bold text-blue-700 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400"
                >
                  Email Address
                </label>
              </div>
              {/* Position */}
              <div className="relative">
                <input
                  id="profile-position"
                  type="text"
                  autoComplete="off"
                  {...register("position")}
                  disabled={loading}
                  className="peer block w-full px-4 pt-6 pb-2 bg-white/80 border-2 border-blue-100 rounded-lg font-semibold text-base text-blue-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200"
                  placeholder=" "
                />
                <label
                  htmlFor="profile-position"
                  className="absolute left-4 top-2 text-base font-bold text-blue-700 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-blue-700"
                >
                  Position
                </label>
              </div>
            </div>
            {/* Sticky Save Bar (glassmorphic) */}
            <div className="sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl pt-4 pb-4 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 shadow-lg mt-8">
              <button
                type="submit"
                className="inline-flex items-center justify-center font-bold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-7 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
