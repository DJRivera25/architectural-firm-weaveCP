"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { services } from "@/data/services";

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
      <section className="relative z-10 max-w-7xl mx-auto px-2 pb-16">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="relative bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-400 border border-blue-100 overflow-hidden flex flex-col group"
              style={{ boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.10)" }}
            >
              {/* Image Section with Badges */}
              <div className="relative h-40 overflow-hidden group">
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
                {/* Client's File Badge */}
                <div
                  className={`absolute top-3 left-3 transition-all duration-500 ${
                    isMobile
                      ? mobileImageStates[index]
                        ? "opacity-0"
                        : "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Badge color="bg-gray-800/90 text-white">Client&apos;s File</Badge>
                </div>
                {/* Weave's Output Badge */}
                <div
                  className={`absolute top-3 right-3 transition-all duration-500 ${
                    isMobile
                      ? mobileImageStates[index]
                        ? "opacity-100"
                        : "opacity-0"
                      : "opacity-100 group-hover:opacity-0"
                  }`}
                >
                  <Badge color="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">Weave&apos;s Output</Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Content Section */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-blue-900 flex-1 pr-2">{service.title}</h3>
                  </div>
                  <p className="text-blue-900/80 mb-2 leading-snug text-xs">{service.description}</p>
                  <ul className="space-y-1 mb-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={feature} className="flex items-center text-xs text-blue-800">
                        <div
                          className={`w-1.5 h-1.5 bg-gradient-to-r ${service.color} rounded-full mr-2 flex-shrink-0`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-1 text-right">
                  <Link
                    href={`/services/${service.slug}`}
                    className={`group/link relative inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-900 transition-all duration-300 md:hover:scale-105`}
                  >
                    <span className="relative z-10">See Details</span>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${service.color} transition-all duration-500 ease-out md:w-0 md:group-hover/link:w-full md:group-hover/link:h-1 w-full`}
                    />
                  </Link>
                </div>
              </div>
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
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
          What Our Clients Say
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
