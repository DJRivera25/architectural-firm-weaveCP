"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export type ServiceItem = {
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  gradient: string;
  afterImage: string;
  beforeImage: string;
  slug: string;
};

export type ServicesPreviewProps = {
  services?: ServiceItem[];
  intro?: string;
};

const defaultServices: ServiceItem[] = [
  {
    title: "3D TO DETAILED DRAWINGS",
    description:
      "Transform your 3D models into comprehensive technical drawings with precise measurements and specifications.",
    icon: "🎯",
    features: ["Precision Engineering", "Technical Specifications", "Multi-view Documentation", "Quality Assurance"],
    color: "from-blue-500 to-indigo-600",
    gradient: "from-blue-400/20 to-indigo-500/20",
    afterImage: "/3D-to-detailed-drawing-after.png",
    beforeImage: "/3D-to-detailed-drawing-before.png",
    slug: "3d-model-to-detailed-drawing",
  },
  {
    title: "CAD TO 3D MODEL AND RENDER",
    description: "Convert your 2D CAD designs into stunning 3D visualizations that bring your concepts to life.",
    icon: "🔄",
    features: ["3D Visualization", "Realistic Rendering", "Interactive Models", "Design Validation"],
    color: "from-emerald-500 to-teal-600",
    gradient: "from-emerald-400/20 to-teal-500/20",
    afterImage: "/cad-to-3d-after.png",
    beforeImage: "/cad-to-3d-before.png",
    slug: "cad-to-3d",
  },
  {
    title: "SKETCHUP TO 3D RENDER",
    description:
      "Transform your SketchUp models into photorealistic 3D renders with professional lighting and materials.",
    icon: "🎨",
    features: ["Photorealistic Rendering", "Professional Lighting", "Material Mapping", "High-Resolution Output"],
    color: "from-purple-500 to-pink-600",
    gradient: "from-purple-400/20 to-pink-500/20",
    afterImage: "/sketchup-to-3drender-after.png",
    beforeImage: "/sketchup-to-3drender-before.png",
    slug: "sketchup-to-3d-render",
  },
  {
    title: "CAD TO DETAILED DRAWINGS",
    description:
      "Convert your CAD files into comprehensive technical drawings with precise measurements and annotations.",
    icon: "📐",
    features: [
      "Technical Documentation",
      "Precision Measurements",
      "Professional Standards",
      "Complete Specifications",
    ],
    color: "from-orange-500 to-red-600",
    gradient: "from-orange-400/20 to-red-500/20",
    afterImage: "/cad-to-detailed-after.png",
    beforeImage: "/cad-to-detailed-before.png",
    slug: "cad-to-detailed-drawings",
  },
  {
    title: "IMAGE TO DETAILED DRAWINGS",
    description: "Transform photographs and sketches into precise architectural drawings and technical documentation.",
    icon: "📸",
    features: ["Image Analysis", "Precision Conversion", "Scale Accuracy", "Professional Documentation"],
    color: "from-cyan-500 to-blue-600",
    gradient: "from-cyan-400/20 to-blue-500/20",
    afterImage: "/image-to-detailed-drawing-after.png",
    beforeImage: "/image-to-detailed-drawing-before.png",
    slug: "image-to-detailed-drawing",
  },
  {
    title: "BIM LOD200 TO LOD500",
    description: "Building Information Modeling services for comprehensive project management and collaboration.",
    icon: "🏗️",
    features: ["3D Modeling", "Data Integration", "Collaboration Tools", "Project Management"],
    color: "from-indigo-500 to-purple-600",
    gradient: "from-indigo-400/20 to-purple-500/20",
    afterImage: "/bim-after.png",
    beforeImage: "/bim-before.png",
    slug: "bim",
  },
  {
    title: "SKETCH TO DETAILED DRAWINGS",
    description: "Convert hand-drawn sketches into professional architectural drawings with complete specifications.",
    icon: "✏️",
    features: ["Sketch Interpretation", "Technical Drawing", "Specification Details", "Professional Standards"],
    color: "from-green-500 to-emerald-600",
    gradient: "from-green-400/20 to-emerald-500/20",
    afterImage: "/sketch-to-detailed-after.png",
    beforeImage: "/sketch-to-detailed-before.png",
    slug: "sketch-to-detailed-drawing",
  },
];

export default function ServicesPreview({
  services = defaultServices,
  intro = "Transform your architectural vision into reality with our comprehensive suite of professional services.",
}: ServicesPreviewProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [mobileImageStates, setMobileImageStates] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-animate images on mobile every 5 seconds
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setMobileImageStates((prev) => {
        const newStates = { ...prev };
        services.forEach((_, index) => {
          newStates[index] = !newStates[index];
        });
        return newStates;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, services.length]);

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const cardVariants = {
    rest: { rotateY: 0 },
    hover: {
      rotateY: 2,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Image with Blur and White Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/bg-image-services-1.PNG"
          alt="Architectural Background"
          fill
          className="object-cover blur-sm opacity-30"
          sizes="100vw"
          priority
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6"
          >
            Our Services
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            {intro}
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {services.map((service, index) => (
            <motion.div key={service.title} variants={itemVariants} className="relative">
              <motion.div
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden h-[320px] flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-80 overflow-hidden group">
                  {/* After Image (Final Result) - Shown by default on desktop, animated on mobile */}
                  <Image
                    src={service.afterImage}
                    alt={`${service.title} - Final Result`}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      isMobile
                        ? mobileImageStates[index]
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-100 group-hover:opacity-0"
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Before Image (Raw/Unprocessed) - Revealed on hover on desktop, animated on mobile */}
                  <Image
                    src={service.beforeImage}
                    alt={`${service.title} - Before Processing`}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      isMobile
                        ? mobileImageStates[index]
                          ? "opacity-0"
                          : "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Scanning Line Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-300 ${
                      isMobile
                        ? mobileImageStates[index]
                          ? "opacity-0"
                          : "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full bg-white/60 shadow-lg transition-transform duration-1000 ease-out ${
                        isMobile
                          ? mobileImageStates[index]
                            ? "-translate-x-full"
                            : "translate-x-full"
                          : "transform -translate-x-full group-hover:translate-x-full"
                      }`}
                    />
                  </div>

                  {/* Client's File Badge - Appears on hover on desktop, animated on mobile */}
                  <div
                    className={`absolute top-4 left-4 transition-all duration-500 transform translate-y-2 ${
                      isMobile
                        ? mobileImageStates[index]
                          ? "opacity-0 translate-y-2"
                          : "opacity-100 translate-y-0"
                        : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <div className="bg-gray-800/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-gray-600/30">
                      Client&apos;s File
                    </div>
                  </div>

                  {/* Weave's Output Badge - Hidden on hover on desktop, animated on mobile */}
                  <div
                    className={`absolute top-4 right-4 transition-all duration-500 ${
                      isMobile
                        ? mobileImageStates[index]
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-100 group-hover:opacity-0"
                    }`}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-blue-500/30">
                      Weave&apos;s Output
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-center">
                  {/* Title and Toggle Button */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">{service.title}</h3>
                    <motion.button
                      onClick={() => toggleCard(index)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${service.color} text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 relative z-10`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: expandedCards.has(index) ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </motion.svg>
                    </motion.button>
                  </div>

                  {/* Description - Hidden by default */}
                  <AnimatePresence>
                    {expandedCards.has(index) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 mb-3 leading-relaxed text-sm">{service.description}</p>

                        {/* Features List */}
                        <ul className="space-y-1.5 mb-3">
                          {service.features.map((feature, featureIndex) => (
                            <motion.li
                              key={feature}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                              className="flex items-center text-xs text-gray-600"
                            >
                              <div
                                className={`w-1.5 h-1.5 bg-gradient-to-r ${service.color} rounded-full mr-2 flex-shrink-0`}
                              />
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hover effect border */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
              </motion.div>

              {/* See Details Link - Outside the card */}
              <div className="mt-3 text-right">
                <Link
                  href={`/services/${service.slug}`}
                  className={`group/link relative inline-flex items-center text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 md:hover:scale-105`}
                >
                  <span className="relative z-10 text-lg">See Details</span>

                  {/* Animated underline that becomes thicker - hidden on mobile, animated on desktop */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${service.color} transition-all duration-500 ease-out md:w-0 md:group-hover/link:w-full md:group-hover/link:h-1 w-full`}
                  />

                  {/* Arrow with enhanced animation - only on desktop */}
                  <motion.svg
                    className="ml-2 w-4 h-4 relative z-10 text-current hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>

                  {/* Simple arrow for mobile */}
                  <svg
                    className="ml-2 w-4 h-4 relative z-10 text-current md:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>

                  {/* Glow effect - only on desktop */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 blur-sm transition-opacity duration-300 md:group-hover/link:opacity-20 hidden md:block`}
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        ></motion.div>
      </div>
    </section>
  );
}
