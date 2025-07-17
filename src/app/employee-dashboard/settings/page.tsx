"use client";

import { useState } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { requestPasswordReset, resetPassword } from "@/utils/api";
import { useEffect } from "react";

const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function EmployeeSettingsPage() {
  const [activeTab, setActiveTab] = useState("password");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [code, setCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ts = localStorage.getItem("emp-reset-cooldown");
    if (ts) {
      const diff = Math.floor((parseInt(ts) - Date.now()) / 1000);
      setResendCountdown(diff > 0 ? diff : 0);
    }
  }, []);

  const handleSendCode = async () => {
    setResendLoading(true);
    setResendMessage("");
    setResendError("");
    try {
      await requestPasswordReset(userEmail);
      setResendMessage("Verification code sent. Please check your email.");
      if (typeof window !== "undefined") {
        const next = Date.now() + 60 * 1000;
        localStorage.setItem("emp-reset-cooldown", next.toString());
      }
      setResendCountdown(60);
    } catch (err: unknown) {
      setResendError("Failed to send code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await resetPassword({
        email: userEmail,
        code,
        password: data.newPassword,
      });
      toast.success("Password changed successfully.");
      reset();
      setCode("");
    } catch (err: unknown) {
      toast.error("Failed to change password. Check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("password")}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "password"
                    ? "border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>Password Reset</span>
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === "password" && (
              <>
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm text-center font-medium">
                  To reset your password, first send a code to your email. Enter the code below along with your new
                  password.
                </div>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resendLoading || resendCountdown > 0 || !userEmail}
                    onClick={handleSendCode}
                  >
                    {resendCountdown > 0
                      ? `Send Code (${resendCountdown}s)`
                      : resendLoading
                      ? "Sending..."
                      : "Send Code to Email"}
                  </Button>
                  <span className="text-gray-700 text-sm">{userEmail}</span>
                </div>
                {resendMessage && <div className="text-green-700 text-sm mb-2 text-center">{resendMessage}</div>}
                {resendError && <div className="text-red-600 text-sm mb-2">{resendError}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
                  <Input
                    label="Verification Code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    error={!code ? "Code is required" : undefined}
                    maxLength={6}
                  />
                  <Input
                    label="Current Password"
                    type="password"
                    {...register("currentPassword")}
                    error={errors.currentPassword?.message}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    {...register("newPassword")}
                    error={errors.newPassword?.message}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                  />
                  <Button type="submit" disabled={loading || !code} className="w-full">
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
