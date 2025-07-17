"use client";

import { ReactNode } from "react";
import NotificationBell from "@/components/ui/NotificationBell";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  BriefcaseIcon,
  ClipboardIcon,
  ClockIcon,
  BellIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <HomeIcon className="w-5 h-5 mr-3" /> },
  { label: "Content", href: "/dashboard/content", icon: <DocumentTextIcon className="w-5 h-5 mr-3" /> },
  { label: "Team", href: "/dashboard/team", icon: <UsersIcon className="w-5 h-5 mr-3" /> },
  { label: "Jobs", href: "/dashboard/jobs", icon: <BriefcaseIcon className="w-5 h-5 mr-3" /> },
  { label: "Tasks", href: "/dashboard/tasks", icon: <ClipboardIcon className="w-5 h-5 mr-3" /> },
  { label: "Kanban Board", href: "/dashboard/tasks/kanban", icon: <ClipboardIcon className="w-5 h-5 mr-3" /> },
  { label: "Time Tracking", href: "/dashboard/timetracking", icon: <ClockIcon className="w-5 h-5 mr-3" /> },
  { label: "Leave Management", href: "/dashboard/leaves", icon: <CalendarDaysIcon className="w-5 h-5 mr-3" /> },
  { label: "Calendar", href: "/dashboard/calendar", icon: <CalendarIcon className="w-5 h-5 mr-3" /> },
  { label: "Notifications", href: "/dashboard/notifications", icon: <BellIcon className="w-5 h-5 mr-3" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5 mr-3" /> },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userImage = session?.user?.image;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";
  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-archivo">
      <aside className="w-72 bg-blue-900 flex flex-col shadow-xl rounded-2xl m-4 mb-0 h-[calc(100vh-2rem)] sticky top-4 border border-blue-800">
        <div className="h-36 flex items-center justify-center border-b border-blue-800 relative z-10">
          <Image
            src="/weave-hsymbol-tri.png"
            alt="Weave Logo"
            width={250}
            height={150}
            priority
            draggable={false}
            className="shadow-lg bg-white"
          />
        </div>
        <nav className="flex-1 py-6 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-blue-800 text-yellow-400 shadow-md border-l-4 border-yellow-400"
                          : "text-white hover:bg-red-100 hover:text-red-700 hover:border-l-4 hover:border-red-400 border-l-4 border-transparent"
                      }
                    `}
                  >
                    <span className="mr-3 flex items-center">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b-4 border-blue-800 flex items-center justify-between px-10 shadow-sm rounded-bl-2xl mt-4 mr-4">
          <div className="font-extrabold text-2xl tracking-wide text-blue-900 font-archivo flex items-center gap-4">
            CMS Dashboard
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            {userImage ? (
              <Image
                src={userImage}
                alt="User"
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-800 shadow"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl shadow border-2 border-blue-800">
                {userInitial}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="ml-2 px-5 py-2 rounded-full bg-yellow-400 text-blue-900 font-semibold shadow hover:bg-blue-800 hover:text-yellow-400 transition-colors text-base border border-yellow-400 hover:border-blue-800"
            >
              Logout
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-10 py-8 animate-fadeInSlow">{children}</div>
      </main>
    </div>
  );
}
