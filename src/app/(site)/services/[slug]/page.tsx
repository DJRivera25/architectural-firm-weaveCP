"use client";

import { useParams } from "next/navigation";
import { services } from "@/data/services";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Types
type ServiceType = {
  title: string;
  description: string;
  features: string[];
  color: string;
  gradient: string;
  afterImage: string;
  beforeImage: string;
  slug: string;
};
type ProjectType = {
  name: string;
  description: string;
  afterImage: string;
  beforeImage: string;
  serviceSlug: string;
};

// Each service has at least one completed project using its before/after images
const projects: ProjectType[] = services.map((service: ServiceType) => ({
  name: service.title,
  description: service.description,
  afterImage: service.afterImage,
  beforeImage: service.beforeImage,
  serviceSlug: service.slug,
}));

type Params = { slug: string };
export default function ServiceDetailPage() {
  const { slug } = useParams() as Params;
  const service = services.find((s: ServiceType) => s.slug === slug);
  const otherServices = services.filter((s: ServiceType) => s.slug !== slug);
  const relatedProjects: ProjectType[] = projects.filter((p) => p.serviceSlug === slug);

  // Before/After animation state for commercial section
  const [isMobile, setIsMobile] = useState(false);
  const [mainImageToggle, setMainImageToggle] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => setMainImageToggle((prev) => !prev), 4000);
    return () => clearInterval(interval);
  }, [isMobile]);

  // Before/After animation state for projects section
  const [projectImageToggles, setProjectImageToggles] = useState<{ [key: number]: boolean }>({});
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setProjectImageToggles((prev) => {
        const newStates = { ...prev };
        relatedProjects.forEach((_, idx) => {
          newStates[idx] = !newStates[idx];
        });
        return newStates;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobile, relatedProjects.length]);

  if (!service) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Service not found</h1>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section (Contact-style) */}
      <section className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden mb-8">
        <Image
          src={service.afterImage}
          alt={`${service.title} Hero`}
          fill
          className="object-cover object-center w-full h-full absolute z-0 opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/70 to-white/10 z-10" />
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between h-full">
          {/* Left: Get Started button */}
          <motion.div
            className="hidden md:flex flex-col justify-center items-start h-full w-1/3"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          >
            <a href="/contact" className="relative text-lg font-semibold text-white group cursor-pointer select-none">
              GET STARTED
              <span className="block h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 w-full mt-1 transition-all duration-300 group-hover:h-2 group-hover:bg-yellow-500"></span>
            </a>
          </motion.div>
          {/* Right: Hero text */}
          <motion.div
            className="flex flex-col justify-center items-center md:items-end h-full w-full md:w-2/3"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4 text-center md:text-right">
              {service.title}
            </h1>
            <p className="text-lg md:text-2xl text-blue-100/90 max-w-2xl mb-4 font-medium text-center md:text-right">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Advertising/Advantage Section (Professional, Commercial) */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-100 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/40 via-blue-400/20 to-indigo-200/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-200/30 via-blue-300/20 to-white/0 rounded-full blur-2xl opacity-50" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left: Text & Features */}
          <div className="flex-1 flex flex-col items-start md:items-start">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-lg">
                {service.title}
              </h2>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-800 mb-4 mt-2 md:mt-4">
              Elevate your workflow with our premium {service.title.toLowerCase()} service
            </h3>
            <p className="text-blue-900/90 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">{service.description}</p>
            <ul className="flex flex-wrap gap-4 md:gap-6 mb-8">
              {service.features.map((feature: string) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-blue-800 text-base md:text-lg font-semibold bg-white/80 rounded-full px-5 py-2 shadow hover:shadow-md transition-all"
                >
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {/* Right: Visual/Mockup */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-full max-w-md h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group">
              {/* After Image */}
              <Image
                src={service.afterImage}
                alt={`${service.title} Output`}
                fill
                className={`object-cover object-center w-full h-full transition-all duration-700 ${
                  isMobile ? (mainImageToggle ? "opacity-100" : "opacity-0") : "opacity-100 group-hover:opacity-0"
                }`}
                style={{ zIndex: 1 }}
                priority
              />
              {/* Before Image */}
              <Image
                src={service.beforeImage}
                alt={`${service.title} Before`}
                fill
                className={`object-cover object-center w-full h-full transition-all duration-700 ${
                  isMobile ? (mainImageToggle ? "opacity-0" : "opacity-100") : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ zIndex: 1 }}
                priority
              />
              {/* Badges */}
              <div
                className={`absolute top-4 left-4 z-10 ${
                  isMobile ? (mainImageToggle ? "opacity-0" : "opacity-100") : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Badge color="bg-gray-800/90 text-white">Client&apos;s File</Badge>
              </div>
              <div
                className={`absolute top-4 right-4 z-10 ${
                  isMobile ? (mainImageToggle ? "opacity-100" : "opacity-0") : "opacity-100 group-hover:opacity-0"
                }`}
              >
                <Badge color="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">Weave&apos;s Output</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Completed Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-br from-white via-blue-50 to-indigo-100 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/40 via-blue-400/20 to-indigo-200/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-200/30 via-blue-300/20 to-white/0 rounded-full blur-2xl opacity-50" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-12 text-center drop-shadow-lg">
            Projects Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {relatedProjects.map((project, idx) => {
              const showAfter = isMobile ? !!projectImageToggles[idx] : false;
              const showBefore = isMobile ? !projectImageToggles[idx] : false;
              return (
                <div key={project.name} className="flex flex-col items-center">
                  <div className="relative w-full max-w-lg h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group mb-6 bg-gradient-to-br from-blue-100/40 to-indigo-100/30">
                    {/* After Image */}
                    <Image
                      src={project.afterImage}
                      alt={project.name + " Output"}
                      fill
                      className={`object-cover object-center w-full h-full transition-all duration-700 rounded-3xl ${
                        isMobile
                          ? projectImageToggles[idx]
                            ? "opacity-100"
                            : "opacity-0"
                          : "opacity-100 group-hover:opacity-0"
                      }`}
                      style={{ zIndex: 1 }}
                      priority={idx === 0}
                    />
                    {/* Before Image */}
                    <Image
                      src={project.beforeImage}
                      alt={project.name + " Before"}
                      fill
                      className={`object-cover object-center w-full h-full transition-all duration-700 rounded-3xl ${
                        isMobile
                          ? projectImageToggles[idx]
                            ? "opacity-0"
                            : "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      style={{ zIndex: 1 }}
                      priority={idx === 0}
                    />
                    {/* Badges: Only show one at a time, matching the visible image */}
                    {/* Client's File badge (before image) */}
                    <div
                      className={`absolute top-4 left-4 z-10 transition-all duration-500 ${
                        isMobile
                          ? !projectImageToggles[idx]
                            ? "opacity-100"
                            : "opacity-0"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Badge color="bg-gray-800/90 text-white">Client&apos;s File</Badge>
                    </div>
                    {/* Weave's Output badge (after image) */}
                    <div
                      className={`absolute top-4 right-4 z-10 transition-all duration-500 ${
                        isMobile
                          ? projectImageToggles[idx]
                            ? "opacity-100"
                            : "opacity-0"
                          : "opacity-100 group-hover:opacity-0"
                      }`}
                    >
                      <Badge color="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">Weave&apos;s Output</Badge>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2 text-center drop-shadow-lg">{project.name}</h3>
                  <p className="text-blue-800 text-lg text-center max-w-lg mb-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section (Premium) */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-100 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-yellow-200/40 via-yellow-400/20 to-indigo-200/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-200/30 via-blue-300/20 to-white/0 rounded-full blur-2xl opacity-30" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-12 text-center drop-shadow-lg">
            Explore Other Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {otherServices.map((s: ServiceType, idx: number) => (
              <a
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group block bg-white/90 rounded-3xl shadow-xl border-2 border-blue-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-start min-h-[220px] relative overflow-hidden"
                style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.10)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Optionally add an icon here if you want, e.g. <span>{s.icon}</span> */}
                  <span className="text-xl md:text-2xl font-bold text-blue-900 drop-shadow-lg">{s.title}</span>
                </div>
                <p className="text-blue-800 text-base mb-2 line-clamp-3 flex-1">{s.description}</p>
                <span className="mt-4 inline-block text-xs font-semibold text-blue-700 group-hover:text-yellow-600 transition-colors">
                  Learn More &rarr;
                </span>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-100/0 via-blue-100/0 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
