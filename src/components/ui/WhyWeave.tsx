"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type WhyWeaveCard = {
  title: string;
  description: string;
  image: string;
};

export type WhyWeaveProps = {
  heading?: string;
  paragraph1?: string;
  paragraph2?: string;
};

export default function WhyWeave({
  heading = "Why Weave?",
  paragraph1 = "Weave Collaboration Partners is more than just an outsourcing company. We are your strategic partner, dedicated to making your business easier, simpler, and more profitable. We handle the mechanical and routine tasks, allowing you to focus on the imaginative, the creative, the functional, and the beautiful.",
  paragraph2 = "Think of us as a seamless extension of your team—a remote resource that delivers high-quality work with the same efficiency and excellence you expect from your own staff. Our process is designed to integrate seamlessly with your workflow, ensuring consistent results and peace of mind.",
}: WhyWeaveProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600 mb-6"
        >
          {paragraph1}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600"
        >
          {paragraph2}
        </motion.p>
      </div>
    </section>
  );
}
