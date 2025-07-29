import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProductivityLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
