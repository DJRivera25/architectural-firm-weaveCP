"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginClient from "./LoginClient";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmed = searchParams.get("confirmed");

  if (confirmed === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h2>
          <p className="text-gray-600 mb-6">Thank you for confirming your email. You can now log in to your account.</p>
          <button
            className="bg-blue-600 text-white py-2.5 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <LoginClient />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
