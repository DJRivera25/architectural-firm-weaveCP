"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { registerUser, confirmUser } from "@/utils/api";
import { AxiosError } from "axios";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  registrationToken: z.string().min(6, "Registration token is required"),
});

type FormData = z.infer<typeof schema>;

const COUNTDOWN_SECONDS = 30;
const LS_KEY = "register-success";

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(COUNTDOWN_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Restore state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const { email: savedEmail, start } = JSON.parse(saved);
        if (savedEmail && start) {
          setSuccess(true);
          setEmail(savedEmail);
          const elapsed = Math.floor((Date.now() - start) / 1000);
          const remaining = COUNTDOWN_SECONDS - elapsed;
          setTimer(remaining > 0 ? remaining : 0);
        }
      } catch {}
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (success && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [success, timer]);

  // Persist timer/email to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (success && email) {
      if (timer > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify({ email, start: Date.now() - (COUNTDOWN_SECONDS - timer) * 1000 }));
      } else {
        localStorage.setItem(LS_KEY, JSON.stringify({ email, start: Date.now() - COUNTDOWN_SECONDS * 1000 }));
      }
    }
  }, [success, email, timer]);

  // Clear localStorage on unmount if not in success state
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && !success) localStorage.removeItem(LS_KEY);
    };
  }, [success]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccess(false);
    setResendMessage("");
    setEmail(data.email);
    try {
      await registerUser(data);
      setSuccess(true);
      setTimer(COUNTDOWN_SECONDS);
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_KEY, JSON.stringify({ email: data.email, start: Date.now() }));
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setServerError(error.response?.data?.message || "Registration failed");
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await confirmUser(email);
      setResendMessage("Confirmation email resent. Please check your inbox.");
      setTimer(COUNTDOWN_SECONDS);
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_KEY, JSON.stringify({ email, start: Date.now() }));
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setResendMessage(error.response?.data?.message || "Failed to resend email.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-gray-500 mt-1 text-center text-base">Register to access your dashboard and projects.</p>
        </div>
        {success ? (
          <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-5 text-center mb-4">
            Registration successful! Please check your email to confirm your account.
            <br />
            <div className="mt-4 flex flex-col items-center">
              <button
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold disabled:opacity-50 mt-2 shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleResend}
                disabled={timer > 0 || resendLoading}
              >
                {resendLoading ? "Resending..." : "Resend Confirmation Email"}
              </button>
              <div className="text-sm text-gray-600 mt-2">
                {timer > 0 ? `You can resend in ${formatTime(timer)}` : "You can now resend the confirmation email."}
              </div>
              {resendMessage && <div className="text-blue-600 mt-2">{resendMessage}</div>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Name</label>
              <input
                type="text"
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                autoComplete="name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
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
                autoComplete="new-password"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Registration Token</label>
              <input
                type="text"
                {...register("registrationToken")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                autoComplete="off"
              />
              {errors.registrationToken && (
                <p className="text-red-600 text-sm mt-1">{errors.registrationToken.message}</p>
              )}
            </div>
            {serverError && <p className="text-red-600 text-sm text-center">{serverError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
