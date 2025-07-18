"use client";

import { ReactNode } from "react";
import NotificationBell from "@/components/ui/NotificationBell";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ClipboardIcon,
  ClockIcon,
  BellIcon,
  UserCircleIcon,
  HomeIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/employee-dashboard", icon: <HomeIcon className="w-5 h-5 mr-3" /> },
  { label: "Tasks", href: "/employee-dashboard/tasks", icon: <ClipboardIcon className="w-5 h-5 mr-3" /> },
  { label: "Team", href: "/employee-dashboard/team", icon: <UsersIcon className="w-5 h-5 mr-3" /> },
  { label: "Time Logs", href: "/employee-dashboard/timelogs", icon: <ClockIcon className="w-5 h-5 mr-3" /> },
  {
    label: "Leave Management",
    href: "/employee-dashboard/leaves",
    icon: <CalendarDaysIcon className="w-5 h-5 mr-3" />,
  },
  { label: "Notifications", href: "/employee-dashboard/notifications", icon: <BellIcon className="w-5 h-5 mr-3" /> },
  { label: "Profile", href: "/employee-dashboard/profile", icon: <UserCircleIcon className="w-5 h-5 mr-3" /> },
  { label: "Calendar", href: "/employee-dashboard/calendar", icon: <CalendarDaysIcon className="w-5 h-5 mr-3" /> },
  { label: "Settings", href: "/employee-dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5 mr-3" /> },
];

export default function EmployeeDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userImage = session?.user?.image;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              let linkClass =
                "flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 group text-white hover:bg-red-100 hover:text-red-700 hover:border-l-4 hover:border-red-400 border-l-4 border-transparent";
              if (mounted && pathname === item.href) {
                linkClass =
                  "flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 group bg-blue-800 text-yellow-400 shadow-md border-l-4 border-yellow-400";
              }
              return (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b-4 border-blue-800 flex items-center justify-between px-10 shadow-sm rounded-bl-2xl mt-4 mr-4 sticky top-4 z-30">
          <div className="font-extrabold text-2xl tracking-wide text-blue-900 font-archivo flex items-center gap-4">
            Overview
          </div>
          <div className="flex items-center gap-6 relative">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold text-sm"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Homepage
            </Link>
            <div className="relative">
              <NotificationBell />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white">
                3
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              {mounted && status === "authenticated" ? (
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt="User"
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border-2 border-blue-800 shadow cursor-pointer"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl shadow border-2 border-blue-800 cursor-pointer">
                      {userInitial}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-100 animate-pulse" />
              )}
              {mounted && dropdownOpen && status === "authenticated" && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-blue-800 py-2 z-50 animate-fadeInSlow">
                  <div className="px-4 py-2 text-blue-800 font-semibold text-base">{session?.user?.name}</div>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-yellow-200 hover:text-black font-semibold rounded-b-xl transition-colors border-t border-blue-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-8 animate-fadeInSlow">{children}</div>
      </main>
    </div>
  );
}
