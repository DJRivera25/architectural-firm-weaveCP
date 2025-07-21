"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export type FooterQuickLink = { label: string; href: string };
export type FooterContactInfo = { label: string; value: string };

export type FooterProps = {
  companyInfo?: string;
  quickLinks?: FooterQuickLink[];
  contactInfo?: FooterContactInfo[];
};

const defaultQuickLinks: FooterQuickLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const defaultContactInfo: FooterContactInfo[] = [
  { label: "Email", value: "info@weavecp.com" },
  { label: "Phone", value: "+63 912 345 6789" },
];

export default function Footer({
  companyInfo = "Creating innovative design solutions that inspire and transform spaces. We specialize in sustainable architecture and exceptional client experiences.",
  quickLinks = defaultQuickLinks,
  contactInfo = defaultContactInfo,
}: FooterProps) {
  return (
    <footer className="relative w-full min-h-[480px] flex flex-col justify-end overflow-hidden">
      {/* Background image and overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-footer-1.jpg"
          alt="Footer Background"
          fill
          className="object-cover object-center w-full h-full"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/80 to-blue-950/95" />
      </div>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24"
      >
        <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-2xl p-10 md:p-16 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20 border-2 border-yellow-400/30 ring-2 ring-white/10">
          <div className="col-span-1 md:col-span-2 flex flex-col justify-between items-center md:items-start text-center md:text-left">
            <div className="mb-8 flex justify-center md:justify-start w-full">
              <Image
                src="/weave-hworkmark-white.svg"
                alt="Weave Logo"
                width={320}
                height={90}
                className="w-64 md:w-80 h-auto mx-auto md:mx-0 drop-shadow-2xl"
                priority
              />
            </div>
            <p className="text-gray-100 mb-6 text-xl font-semibold max-w-2xl drop-shadow-lg leading-relaxed">
              {companyInfo}
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-5 text-yellow-400 tracking-wide uppercase">Quick Links</h3>
            <ul className="space-y-4 w-full">
              {quickLinks.map((link, idx) => (
                <li key={`${link.href || "nohref"}-${link.label || "nolabel"}-${idx}`} className="w-full">
                  <Link
                    href={link.href}
                    className="relative text-gray-200 hover:text-yellow-400 font-semibold transition text-lg px-1 py-1 inline-block w-full group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-5 text-yellow-400 tracking-wide uppercase">Contact Info</h3>
            <ul className="space-y-4 w-full">
              {contactInfo.map((info, idx) => (
                <li key={`${info.label || "nolabel"}-${idx}`} className="text-gray-200 text-lg">
                  <span className="font-bold text-white">{info.label}:</span> {info.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-200 text-base drop-shadow-lg tracking-wide">
          &copy; {new Date().getFullYear()} Weave Collaboration Partners. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
}
