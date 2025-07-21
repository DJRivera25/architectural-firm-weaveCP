"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ExtendedSession } from "@/types";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const router = useRouter();
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/process", label: "Our Process" },
    { href: "/why-weave", label: "Why Weave" },
    { href: "/team", label: "Our Team" },
    { href: "/contact", label: "Contact Us", isContact: true },
  ];

  const servicesDropdown = [
    { href: "/services/3d-model-to-detailed-drawing", label: "3D TO DETAILED DRAWINGS" },
    { href: "/services/cad-to-3d", label: "CAD TO 3D MODEL AND RENDER" },
    { href: "/services/sketchup-to-3d-render", label: "SKETCHUP TO 3D RENDER" },
    { href: "/services/cad-to-detailed-drawings", label: "CAD TO DETAILED DRAWINGS" },
    { href: "/services/image-to-detailed-drawing", label: "IMAGE TO DETAILED DRAWINGS" },
    { href: "/services/bim", label: "BIM LOD200 TO LOD500" },
    { href: "/services/sketch-to-detailed-drawing", label: "SKETCH TO DETAILED DRAWINGS" },
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

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    setIsServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 300);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 font-archivo">
      {/* Top Bar with Contact Information */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="hidden sm:inline">+1 (555) 123-4567</span>
                <span className="sm:hidden">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="hidden sm:inline">info@weavecp.com</span>
                <span className="sm:hidden">info@weavecp.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Mon-Fri: 9AM-6PM</span>
              <span className="sm:hidden">9AM-6PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Area */}
          <div className="flex items-center flex-shrink-0 min-w-[180px] sm:min-w-[180px] min-w-[140px]">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="Weave Home">
              <Image
                src="/weave-hsymbol-tri.svg"
                alt="Weave Logo Symbol"
                width={64}
                height={64}
                className="h-12 w-auto sm:h-16 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                priority
                draggable={false}
              />
            </Link>
          </div>

          {/* Center Nav */}
          <div className="hidden lg:flex flex-1 justify-center items-center space-x-1 xl:space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 rounded-lg text-sm xl:text-base font-semibold transition-all duration-300 group whitespace-nowrap hover:bg-blue-50 ${
                  item.isContact
                    ? "text-blue-600 hover:text-blue-700 animate-pulse hover:animate-none"
                    : "text-gray-700 hover:text-blue-700"
                }`}
              >
                <span
                  className={`relative transition-colors ${
                    item.isContact ? "group-hover:text-blue-700" : "group-hover:text-blue-700"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-1 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full ${
                      item.isContact
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    }`}
                  />
                  {item.isContact && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  )}
                </span>
              </Link>
            ))}
            {/* Dropdown for Services */}
            <div
              className="relative inline-block text-left"
              onMouseEnter={handleServicesMouseEnter}
              onMouseLeave={handleServicesMouseLeave}
            >
              <button className="inline-flex items-center px-3 py-2 rounded-lg text-sm xl:text-base font-semibold text-gray-700 hover:text-blue-700 transition-all duration-300 group focus:outline-none whitespace-nowrap hover:bg-blue-50">
                <span className="relative group-hover:text-blue-700 transition-colors">
                  Services
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
                </span>
                <ChevronDownIcon
                  className="ml-1 h-5 w-5 text-gray-500 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </button>
              <Transition
                show={isServicesOpen}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-200"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
              >
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 w-96 origin-top-center rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white shadow-2xl ring-1 ring-gray-200/50 focus:outline-none z-50 border border-gray-200/30 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />

                    <div className="relative py-6">
                      <div className="space-y-1">
                        {servicesDropdown.map((service, index) => (
                          <Link
                            key={service.href}
                            href={service.href}
                            className="block px-6 py-4 text-sm font-semibold transition-all duration-300 group text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50"
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: "both",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate font-medium">{service.label}</span>
                              <svg
                                className="w-4 h-4 transition-all duration-300 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          {/* Actions (right) */}
          <div className="hidden lg:flex items-center space-x-3 justify-end">
            {session ? (
              <>
                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-50 whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-50 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-blue-700 hover:text-blue-800 focus:outline-none focus:text-blue-800 transition-colors duration-300 p-2 rounded-lg hover:bg-blue-50"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <motion.div
        initial={{ opacity: 0, height: 0, scale: 0.95, y: -10 }}
        animate={
          isMenuOpen ? { opacity: 1, height: "auto", scale: 1, y: 0 } : { opacity: 0, height: 0, scale: 0.95, y: -10 }
        }
        transition={{
          duration: 0.4,
          ease: "easeOut",
          height: {
            duration: 0.5,
            ease: "easeOut",
          },
          scale: {
            duration: 0.3,
            ease: "easeOut",
          },
          y: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
        className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-40 lg:hidden overflow-hidden"
      >
        {/* Dropdown Container */}
        <div className="w-80 bg-gradient-to-br from-white via-gray-50/95 to-white shadow-2xl border border-gray-200/50 backdrop-blur-xl rounded-b-2xl">
          {/* Beautiful Yellow Top Border */}
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

          {/* Navigation Links with Scroll Animation */}
          <div className="p-4 space-y-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -15, height: 0, scale: 0.98 }}
                animate={
                  isMenuOpen
                    ? { opacity: 1, y: 0, height: "auto", scale: 1 }
                    : { opacity: 0, y: -15, height: 0, scale: 0.98 }
                }
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                  ease: "easeOut",
                  height: {
                    duration: 0.25,
                    delay: index * 0.08,
                    ease: "easeOut",
                  },
                  scale: {
                    duration: 0.2,
                    delay: index * 0.08,
                    ease: "easeOut",
                  },
                }}
                className="overflow-hidden"
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.isContact) {
                      handleContactClick(e);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`block w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                    item.isContact
                      ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 animate-pulse hover:animate-none"
                      : "text-gray-700 hover:text-blue-700 hover:bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="relative">
                      {item.label}
                      {item.isContact && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      )}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Services Section with Sub-items */}
            <motion.div
              initial={{ opacity: 0, y: -15, height: 0, scale: 0.98 }}
              animate={
                isMenuOpen
                  ? { opacity: 1, y: 0, height: "auto", scale: 1 }
                  : { opacity: 0, y: -15, height: 0, scale: 0.98 }
              }
              transition={{
                duration: 0.3,
                delay: navItems.length * 0.08,
                ease: "easeOut",
                height: {
                  duration: 0.25,
                  delay: navItems.length * 0.08,
                  ease: "easeOut",
                },
                scale: {
                  duration: 0.2,
                  delay: navItems.length * 0.08,
                  ease: "easeOut",
                },
              }}
              className="space-y-1 overflow-hidden"
            >
              <div className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50">
                <div className="flex items-center justify-between">
                  <span>Services</span>
                  <ChevronDownIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 space-y-0.5">
                {servicesDropdown.map((service, index) => (
                  <motion.div
                    key={service.href}
                    initial={{ opacity: 0, y: -10, height: 0, scale: 0.98 }}
                    animate={
                      isMenuOpen
                        ? { opacity: 1, y: 0, height: "auto", scale: 1 }
                        : { opacity: 0, y: -10, height: 0, scale: 0.98 }
                    }
                    transition={{
                      duration: 0.25,
                      delay: (navItems.length + index) * 0.06,
                      ease: "easeOut",
                      height: {
                        duration: 0.2,
                        delay: (navItems.length + index) * 0.06,
                        ease: "easeOut",
                      },
                      scale: {
                        duration: 0.15,
                        delay: (navItems.length + index) * 0.06,
                        ease: "easeOut",
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <Link
                      href={service.href}
                      className="block w-full px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50/60 transition-all duration-300 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{service.label}</span>
                        <svg
                          className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* User Actions */}
            {session ? (
              <motion.div
                initial={{ opacity: 0, y: -15, height: 0, scale: 0.98 }}
                animate={
                  isMenuOpen
                    ? { opacity: 1, y: 0, height: "auto", scale: 1 }
                    : { opacity: 0, y: -15, height: 0, scale: 0.98 }
                }
                transition={{
                  duration: 0.3,
                  delay: (navItems.length + servicesDropdown.length) * 0.06,
                  ease: "easeOut",
                  height: {
                    duration: 0.25,
                    delay: (navItems.length + servicesDropdown.length) * 0.06,
                    ease: "easeOut",
                  },
                  scale: {
                    duration: 0.2,
                    delay: (navItems.length + servicesDropdown.length) * 0.06,
                    ease: "easeOut",
                  },
                }}
                className="pt-3 space-y-1 border-t border-gray-200/50 overflow-hidden"
              >
                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block w-full px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50/80 transition-all duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50/80 transition-all duration-300 text-center"
                >
                  Logout
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -15, height: 0, scale: 0.98 }}
                animate={
                  isMenuOpen
                    ? { opacity: 1, y: 0, height: "auto", scale: 1 }
                    : { opacity: 0, y: -15, height: 0, scale: 0.98 }
                }
                transition={{
                  duration: 0.3,
                  delay: (navItems.length + servicesDropdown.length) * 0.06,
                  ease: "easeOut",
                  height: {
                    duration: 0.25,
                    delay: (navItems.length + servicesDropdown.length) * 0.06,
                    ease: "easeOut",
                  },
                  scale: {
                    duration: 0.2,
                    delay: (navItems.length + servicesDropdown.length) * 0.06,
                    ease: "easeOut",
                  },
                }}
                className="pt-3 border-t border-gray-200/50 overflow-hidden"
              >
                <Link
                  href="/login"
                  className="block w-full px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
