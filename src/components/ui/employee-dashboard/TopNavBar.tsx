import { Bell, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TopNavBar() {
  const { data: session } = useSession();
  const [notifCount] = useState(3); // Example badge
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="w-full flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-blue-50 transition">
          <Bell className="w-6 h-6 text-gray-700" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {notifCount}
            </span>
          )}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <Image
              src={session?.user?.image || "/weave-hsymbol-blue.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-semibold text-gray-700">{session?.user?.name || "Me"}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <button
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 transition text-left"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/employee-dashboard/profile");
                }}
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 transition text-left"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
