import { ReactNode } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";

export default function EmployeeProductivityLayout({ children }: { children: ReactNode }) {
  return <EmployeeDashboardLayout>{children}</EmployeeDashboardLayout>;
}
