import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Architectural Firm - Innovative Design Solutions",
  description:
    "Leading architectural firm specializing in innovative design solutions, sustainable architecture, and exceptional client experiences.",
  keywords: "architecture, design, sustainable, innovative, construction, planning",
  authors: [{ name: "Architectural Firm" }],
  openGraph: {
    title: "Architectural Firm - Innovative Design Solutions",
    description:
      "Leading architectural firm specializing in innovative design solutions, sustainable architecture, and exceptional client experiences.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
