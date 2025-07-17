"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Cog6ToothIcon, ShieldCheckIcon, UserGroupIcon, BellIcon, CloudIcon } from "@heroicons/react/24/outline";
import AdminRegistrationTokenCard from "@/components/ui/AdminRegistrationTokenCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { requestPasswordReset, resetPassword } from "@/utils/api";
import { useEffect } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("system");
  const tabs = [
    { id: "system", label: "System", icon: Cog6ToothIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "users", label: "Users", icon: UserGroupIcon },
    { id: "password", label: "Password Reset", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "integrations", label: "Integrations", icon: CloudIcon },
  ];

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(6, "Current password required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  type PasswordFormData = z.infer<typeof passwordSchema>;
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [code, setCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(() => {
    const ts = typeof window !== "undefined" ? localStorage.getItem("admin-reset-cooldown") : null;
    if (ts) {
      const diff = Math.floor((parseInt(ts) - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 0;
  });
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);
  const handleSendCode = async () => {
    setResendLoading(true);
    setResendMessage("");
    setResendError("");
    try {
      await requestPasswordReset(userEmail);
      setResendMessage("Verification code sent. Please check your email.");
      const next = Date.now() + 60 * 1000;
      localStorage.setItem("admin-reset-cooldown", next.toString());
      setResendCountdown(60);
    } catch (err: unknown) {
      setResendError("Failed to send code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    try {
      await resetPassword({
        email: userEmail,
        code,
        password: data.newPassword,
      });
      toast.success("Password changed successfully.");
      resetPasswordForm();
      setCode("");
    } catch (err: unknown) {
      toast.error("Failed to change password. Check your code and try again.");
    } finally {
      setPasswordLoading(false);
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "system":
        return <div>System Settings Content</div>;
      case "security":
        return <div>Security Settings Content</div>;
      case "users":
        return (
          <div>
            <div>User Management Content</div>
            <AdminRegistrationTokenCard />
          </div>
        );
      case "password":
        return (
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
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6 max-w-md mx-auto">
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
                {...registerPassword("currentPassword")}
                error={passwordErrors.currentPassword?.message}
              />
              <Input
                label="New Password"
                type="password"
                {...registerPassword("newPassword")}
                error={passwordErrors.newPassword?.message}
              />
              <Input
                label="Confirm New Password"
                type="password"
                {...registerPassword("confirmPassword")}
                error={passwordErrors.confirmPassword?.message}
              />
              <Button type="submit" disabled={passwordLoading || !code} className="w-full">
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </>
        );
      case "notifications":
        return <div>Notification Settings Content</div>;
      case "integrations":
        return <div>Integrations Content</div>;
      default:
        return null;
    }
  };
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure application settings and preferences</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
