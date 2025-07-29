"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EditorProvider } from "@/components/providers/EditorProvider";
import { LeftSidebar, RightSidebar, TopToolbar, LivePreview, BottomStatus } from "./components";

export default function ContentEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <EditorProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <LeftSidebar />

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Toolbar */}
          <TopToolbar />

          {/* Live Preview Area */}
          <div className="flex-1 overflow-hidden">
            <LivePreview />
          </div>

          {/* Bottom Status Bar */}
          <BottomStatus />
        </main>

        {/* Right Sidebar - Property Panel */}
        <RightSidebar />
      </div>
    </EditorProvider>
  );
}
