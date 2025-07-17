"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/utils/api";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await requestPasswordReset(data.email);
      setSent(true);
      toast.success("If that email exists, a verification code has been sent.");
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
      <h1 className="text-2xl font-bold mb-2 text-center text-blue-800">Forgot Password</h1>
      <p className="mb-6 text-center text-gray-600">
        Enter your email and we&apos;ll send you a 6-character verification code to reset your password.
      </p>
      {sent ? (
        <div className="text-green-700 text-center font-semibold flex flex-col items-center gap-4">
          <div>If that email exists, a verification code has been sent.</div>
          <div className="text-gray-700 text-sm">
            Enter the code and your new password on the <b>Reset Password</b> page.
          </div>
          <a
            href="/reset-password"
            className="mt-2 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Go to Reset Password
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} autoFocus />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      )}
    </div>
  );
}
