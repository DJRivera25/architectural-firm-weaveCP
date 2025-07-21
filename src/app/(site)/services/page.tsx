"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const services = [
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

export default function ServicesPage() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [mobileImageStates, setMobileImageStates] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
  }, [isMobile]);

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bg-image-services-1.PNG"
            alt="Services Hero Background"
            fill
            className="object-cover w-full h-full opacity-40 blur-md"
            style={{ objectPosition: "center" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-50/80" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-900 bg-clip-text text-transparent mb-6 drop-shadow-lg"
        >
          Our Expertise, Your Vision
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-2xl text-blue-900/80 max-w-2xl mx-auto mb-8 font-medium"
        >
          Explore the services that set us apart in architectural innovation.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 mt-4"
        >
          <span className="text-blue-700/80 text-xs uppercase tracking-widest font-semibold">Scroll to Explore</span>
          <span className="animate-bounce text-2xl">↓</span>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-16 md:py-24 max-w-5xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl md:text-4xl font-bold text-blue-900 mb-6"
        >
          Why Choose WeaveCP?
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            {
              icon: "🎯",
              title: "Precision",
              desc: "Every detail is meticulously crafted for accuracy and clarity.",
            },
            {
              icon: "⚡",
              title: "Speed",
              desc: "Rapid turnaround without sacrificing quality or creativity.",
            },
            {
              icon: "🤝",
              title: "Collaboration",
              desc: "We work as an extension of your team, not just a vendor.",
            },
            {
              icon: "🚀",
              title: "Innovation",
              desc: "We leverage the latest tech and design thinking for every project.",
            },
          ].map((pillar, i) => (
            <motion.div
              key={pillar.title}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <span className="text-3xl mb-2">{pillar.icon}</span>
              <h3 className="text-lg font-bold text-blue-900 mb-1">{pillar.title}</h3>
              <p className="text-blue-800 text-sm leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.13, delayChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-blue-100 overflow-hidden flex flex-col group glassmorphism-card"
              style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden group">
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
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl md:text-3xl">{service.icon}</span>
                    <h3 className="text-lg md:text-xl font-bold text-blue-900 flex-1 pr-2">{service.title}</h3>
                  </div>
                  <p className="text-blue-900/80 mb-3 leading-relaxed text-sm md:text-base">{service.description}</p>
                  <ul className="space-y-1.5 mb-3">
                    {service.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: featureIndex * 0.08 }}
                        className="flex items-center text-xs md:text-sm text-blue-800"
                      >
                        <div
                          className={`w-1.5 h-1.5 bg-gradient-to-r ${service.color} rounded-full mr-2 flex-shrink-0`}
                        />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 text-right">
                  <Link
                    href={`/services/${service.slug}`}
                    className={`group/link relative inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 md:hover:scale-105`}
                  >
                    <span className="relative z-10 text-base">See Details</span>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${service.color} transition-all duration-500 ease-out md:w-0 md:group-hover/link:w-full md:group-hover/link:h-1 w-full`}
                    />
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
                    <svg
                      className="ml-2 w-4 h-4 relative z-10 text-current md:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              {/* Hover effect border */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 md:py-24 max-w-5xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl md:text-4xl font-bold text-blue-900 mb-6"
        >
          What Our Customers Say
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
          className="flex flex-col md:flex-row gap-8 justify-center items-center"
        >
          {[
            {
              name: "Alex Tan",
              company: "Tan Architects",
              quote:
                "WeaveCP is the only partner we trust for our most complex projects. Their attention to detail and speed is unmatched.",
              photo: "/weave-symbol-blue.png",
            },
            {
              name: "Maria Santos",
              company: "Santos Design Studio",
              quote: "The collaboration was seamless and the results exceeded our expectations. Highly recommended!",
              photo: "/weave-symbol-blue.png",
            },
            {
              name: "John Lee",
              company: "Lee & Partners",
              quote:
                "Professional, innovative, and always on time. WeaveCP is our go-to for all architectural documentation.",
              photo: "/weave-symbol-blue.png",
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-blue-100 max-w-xs hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={testimonial.photo}
                alt={testimonial.name}
                width={56}
                height={56}
                className="rounded-full mb-3 border-2 border-blue-200"
              />
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-blue-900 text-base italic mb-3">“{testimonial.quote}”</p>
              <div className="text-blue-700 font-semibold text-sm">{testimonial.name}</div>
              <div className="text-blue-500 text-xs">{testimonial.company}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl md:text-4xl font-bold text-blue-900 mb-6"
        >
          Ready to elevate your next project?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Link
            href="/contact"
            className="inline-block bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:brightness-110 hover:scale-105 transition-all text-lg mt-4"
          >
            Get in Touch
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
