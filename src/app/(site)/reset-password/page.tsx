"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword, requestPasswordReset } from "@/utils/api";
import Image from "next/image";
import { useEffect } from "react";

const schema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    code: z.string().length(6, "6-character code required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResend = async (email: string) => {
    setResendLoading(true);
    setResendMessage("");
    setResendError("");
    try {
      await requestPasswordReset(email);
      setResendMessage("Verification code resent. Please check your email.");
      setResendCountdown(60);
    } catch (err: unknown) {
      setResendError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await resetPassword({
        email: data.email,
        code: data.code,
        password: data.password,
      });
      toast.success("Password reset successful. You can now log in.");
      router.push("/login");
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" &&
        err &&
        "response" in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data?.error
          ? (err as { response: { data: { error: string } } }).response.data.error
          : "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow flex flex-col items-center">
      <Image src="/weave-symbol-tri.png" alt="Weave Logo" width={56} height={56} className="mb-4" priority />
      <h1 className="text-2xl font-bold mb-2 text-center text-blue-800">Reset Password</h1>
      <p className="mb-6 text-center text-gray-600">
        Enter your email, the 6-character code sent to you, and your new password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} autoFocus />
        <div className="flex items-center gap-2">
          <Input
            label="6-Character Code"
            type="text"
            maxLength={6}
            {...register("code")}
            error={errors.code?.message}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resendLoading || resendCountdown > 0 || !watch("email")}
            onClick={() => handleResend(watch("email"))}
            className="ml-2"
          >
            {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : resendLoading ? "Resending..." : "Resend Code"}
          </Button>
        </div>
        {resendMessage && <div className="text-green-700 text-sm mb-2">{resendMessage}</div>}
        {resendError && <div className="text-red-600 text-sm mb-2">{resendError}</div>}
        <Input label="New Password" type="password" {...register("password")} error={errors.password?.message} />
        <Input
          label="Confirm Password"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
