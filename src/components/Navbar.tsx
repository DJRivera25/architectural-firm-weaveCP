"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ExtendedSession } from "@/types";
import NotificationBell from "@/components/NotificationBell";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const contactRef = useRef<HTMLAnchorElement>(null);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/process", label: "Our Process" },
    { href: "/why-weave", label: "Why Weave" },
    { href: "/team", label: "Our Team" },
  ];

  const workDropdown = [
    { href: "/portfolio", label: "Portfolio" },
    { href: "/careers", label: "Careers" },
  ];

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#contact");
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 font-archivo">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo Area */}
          <div className="flex items-center flex-shrink-0 min-w-[180px]">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="Weave Home">
              <Image
                src="/weave-hsymbol-tri.svg"
                alt="Weave Logo Symbol"
                width={64}
                height={64}
                className="h-14 w-auto transition-transform group-hover:scale-105"
                priority
                draggable={false}
              />
            </Link>
          </div>

          {/* Center Nav */}
          <div className="hidden lg:flex flex-1 justify-center items-center space-x-1 xl:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-2 py-1.5 rounded-md text-sm xl:text-base font-medium text-gray-700 hover:text-blue-700 transition-colors group whitespace-nowrap"
              >
                <span className="relative group-hover:text-blue-700 transition-colors">
                  {item.label}
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
                </span>
              </Link>
            ))}
            {/* Dropdown for Our Work */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex items-center px-2 py-1.5 rounded-md text-sm xl:text-base font-medium text-gray-700 hover:text-blue-700 transition-colors group focus:outline-none whitespace-nowrap">
                <span className="relative group-hover:text-blue-700 transition-colors">
                  Our Work
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
                </span>
                <ChevronDownIcon
                  className="ml-1 h-5 w-5 text-gray-500 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-blue-100">
                  <div className="py-2">
                    {workDropdown.map((item) => (
                      <Menu.Item key={item.href}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            className={`block px-5 py-2 text-base font-medium rounded-lg transition-colors ${
                              active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            {/* Contact Us Button */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="ml-3 px-4 py-1.5 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm xl:text-base whitespace-nowrap"
              ref={contactRef}
            >
              Contact Us
            </a>
          </div>

          {/* Actions (right) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-3 min-w-[160px] justify-end">
            {session ? (
              <>
                <NotificationBell />
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm xl:text-base font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-700 px-2 py-1.5 rounded-md text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-600 px-2 py-1.5 rounded-md text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm xl:text-base font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-700 focus:outline-none focus:text-blue-700"
              aria-label="Open menu"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <Transition
        show={isMenuOpen}
        as={Fragment}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 z-40 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center space-y-8 p-8 lg:hidden">
          {/* Logo and Close */}
          <div className="absolute top-8 left-8 flex items-center">
            <Image
              src="/weave-hsymbol-tri.svg"
              alt="Weave Logo Symbol"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
              draggable={false}
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 text-gray-700 hover:text-blue-700 focus:outline-none"
            aria-label="Close menu"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Nav Links */}
          <div className="flex flex-col items-center space-y-6 mt-12 w-full">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-2xl font-semibold text-gray-800 hover:text-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Dropdown for Our Work in mobile */}
            <Menu as="div" className="relative w-full flex flex-col items-center">
              <Menu.Button className="inline-flex items-center text-2xl font-semibold text-gray-800 hover:text-blue-700 transition-colors focus:outline-none">
                Our Work
                <ChevronDownIcon
                  className="ml-2 h-6 w-6 text-gray-500 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="mt-2 w-48 origin-top rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-blue-100">
                  <div className="py-2">
                    {workDropdown.map((item) => (
                      <Menu.Item key={item.href}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            className={`block px-5 py-2 text-lg font-medium rounded-lg transition-colors ${
                              active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <a
              href="#contact"
              onClick={handleContactClick}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-2xl"
            >
              Contact Us
            </a>
            {/* User Actions */}
            {session ? (
              <div className="flex flex-col items-center space-y-4 mt-4">
                <NotificationBell />
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md text-2xl font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-gray-800 hover:text-blue-700 px-6 py-3 rounded-md text-2xl font-semibold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-800 hover:text-red-600 px-6 py-3 rounded-md text-2xl font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-md text-2xl font-semibold hover:bg-blue-700 transition-colors mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
}
