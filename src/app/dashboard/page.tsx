"use client";

import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <DashboardClient />
      </Suspense>
      {/* ...rest of your dashboard UI... */}
    </>
  );
}
