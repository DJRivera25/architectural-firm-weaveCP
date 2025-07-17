import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Weave Collaboration Partners",
  description:
    "Leading architectural firm specializing in innovative design solutions, sustainable architecture, and exceptional client experiences.",
  keywords: "architecture, design, sustainable, innovative, construction, planning",
  authors: [{ name: "Weave Collaboration Partners" }],
  icons: {
    icon: "/favicon.png", // path from public folder
  },
  openGraph: {
    title: "Weave Colloboration Partners",
    description:
      "Leading architectural firm specializing in innovative design solutions, sustainable architecture, and exceptional client experiences.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/weave-symbol-tri.png`, // Replace with your actual domain in production
        width: 1200,
        height: 630,
        alt: "Weave Collaboration Partners Logo",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
