"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const justLoggedIn = searchParams.get("justLoggedIn");

  useEffect(() => {
    if (justLoggedIn) {
      toast.success("Login successful!");
    }
  }, [justLoggedIn]);
}
