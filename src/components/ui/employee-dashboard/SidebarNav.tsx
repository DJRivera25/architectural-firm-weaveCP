import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, CalendarDays, CreditCard, Plane, User, Users, Settings } from "lucide-react";

const navItems = [
  { href: "/employee-dashboard", label: "Home", icon: Home },
  { href: "/employee-dashboard/tasks", label: "My Tasks", icon: ListTodo },
  { href: "/employee-dashboard/team", label: "Team", icon: Users },
  { href: "/employee-dashboard/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/employee-dashboard/payroll", label: "Payroll", icon: CreditCard },
  { href: "/employee-dashboard/leave", label: "Leave", icon: Plane },
  { href: "/employee-dashboard/profile", label: "Profile", icon: User },
  { href: "/employee-dashboard/settings", label: "Settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-60 bg-white border-r border-gray-100 min-h-screen flex flex-col py-6 px-2 md:px-4">
      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors text-base
              ${pathname === href ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
