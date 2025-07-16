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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded hover:bg-gray-50 transition-colors mb-4"
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
          Sign in with Google
        </button>
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" {...register("email")} className="w-full border rounded px-3 py-2" />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input type="password" {...register("password")} className="w-full border rounded px-3 py-2" />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-red-600 text-sm text-center">{serverError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
