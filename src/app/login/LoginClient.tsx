"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import api from "@/utils/axios";
import ResendConfirmationModal from "@/components/ResendConfirmationModal";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginClient() {
  const [serverError, setServerError] = useState("");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { data: session, status } = useSession();
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (error) {
      let message = "Login failed.";
      if (error === "OAuthAccountNotLinked") {
        message = "This email is not registered. Please register first.";
      } else if (error === "Callback") {
        message = "There was a problem with the login callback.";
      } else if (error === "AccessDenied") {
        message = "Access denied. Please contact support.";
      } else if (error === "CustomErrorMessage") {
        message = "This email is not registered or not confirmed.";
      }
      toast.error(message);
    } else if (status === "unauthenticated") {
      // Only show fallback error if redirected from an OAuth attempt (callbackUrl param present)
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        toast.error("Login failed. Please use a registered and confirmed email.");
      }
    }
  }, [error, status, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error || "Login failed");
    } else {
      toast.success("Login successful!");
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard?justLoggedIn=1" });
  };

  const handleResend = async (email: string) => {
    setResendLoading(true);
    setResendMessage("");
    setResendError("");
    try {
      await api.post("/auth/confirm", { email });
      setResendMessage("Confirmation email resent. Please check your inbox.");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setResendError((err.response.data as { message?: string }).message || "Failed to resend email.");
      } else {
        setResendError("Failed to resend email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 mb-2 flex items-center justify-center rounded-full bg-blue-100">
            {/* Replace with your logo if available */}
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sign In</h2>
          <p className="text-gray-500 mt-1 text-center text-base">Welcome back! Please sign in to your account.</p>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.99 17.56 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.99 37.13 46.1 31.36 46.1 24.55z"
              />
              <path
                fill="#FBBC05"
                d="M10.67 28.29a14.5 14.5 0 010-8.58l-7.98-6.2A23.94 23.94 0 000 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.18 0 11.36-2.05 15.15-5.59l-7.19-5.59c-2.01 1.35-4.6 2.15-7.96 2.15-6.44 0-11.87-4.49-13.33-10.5l-7.98 6.2C6.71 42.18 14.82 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-red-600 text-sm text-center">{serverError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
          <br />
          <button
            className="text-blue-600 hover:underline mt-2 focus:outline-none font-medium"
            type="button"
            onClick={() => setShowResendModal(true)}
          >
            Didn&apos;t receive confirmation email?
          </button>
        </div>
        <ResendConfirmationModal
          isOpen={showResendModal}
          onClose={() => {
            setShowResendModal(false);
            setResendMessage("");
            setResendError("");
          }}
          onResend={handleResend}
          loading={resendLoading}
          message={resendMessage}
          error={resendError}
          showToast={(msg: string, type: "success" | "error") =>
            type === "success" ? toast.success(msg) : toast.error(msg)
          }
        />
      </div>
    </div>
  );
}
