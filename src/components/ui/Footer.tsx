"use client";

import Link from "next/link";
import Image from "next/image";

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
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/#contact" },
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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex">
              <Image
                src="/weave-hworkmark-white.svg"
                alt="Weave Logo"
                width={320}
                height={90}
                className="w-64 md:w-80 h-auto mx-0"
                priority
              />
            </div>
            <p className="text-gray-300 mb-4">{companyInfo}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={`${link.href || "nohref"}-${link.label || "nolabel"}-${idx}`}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Contact Info</h3>
            <ul className="space-y-2">
              {contactInfo.map((info, idx) => (
                <li key={`${info.label || "nolabel"}-${idx}`} className="text-gray-300">
                  <span className="font-medium text-white">{info.label}:</span> {info.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Weave Collaboration Partners. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
