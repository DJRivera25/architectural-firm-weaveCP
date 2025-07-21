"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type ContactStat = { label: string; value: string };

export type ContactCTAProps = {
  heading?: string;
  description?: string;
  cta1Text?: string;
  cta1Link?: string;
  cta2Text?: string;
  cta2Link?: string;
  stats?: ContactStat[];
};

const defaultStats: ContactStat[] = [
  { label: "Projects Completed", value: "50+" },
  { label: "Years Experience", value: "4+" },
  { label: "Client Satisfaction", value: "98%" },
];

export default function ContactCTA({
  heading = "Ready to Start Your Project?",
  description = "Let's discuss your vision and create something extraordinary together. Our team is ready to bring your architectural dreams to life.",
  cta1Text = "Contact Us",
  cta1Link = "/contact",
  cta2Text = "Join Our Team",
  cta2Link = "/careers",
  stats = defaultStats,
}: ContactCTAProps) {
  return (
    <section id="contact" className="py-20 bg-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href={cta1Link}
            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
          >
            {cta1Text}
          </Link>
          <Link
            href={cta2Link}
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors duration-300"
          >
            {cta2Text}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-blue-100"
        >
          {stats.map((stat, idx) => (
            <div key={`${stat.label || "nolabel"}-${idx}`}>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
