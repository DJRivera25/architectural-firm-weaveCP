"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export type AboutPreviewProps = {
  paragraph1?: string;
  paragraph2?: string;
  ctaLink?: string;
  yearsExperience?: number | string;
  projectsCompleted?: number | string;
  image?: string;
};

export default function AboutPreview({
  paragraph1 = "Architecture is a challenging field and a complex business. Weave Collaboration Partners was established to make running your company easier, simpler, and more profitable. We handle the mechanical and routine tasks, allowing you to focus on the imaginative, the creative, the functional, and the beautiful.",
  paragraph2 = "Don’t think of it as just outsourcing.Think of it as a seamless extension of your team—a remote resource that delivers high-quality work with the same efficiency and excellence you expect from your own staff.",
  ctaLink = "/about",
  yearsExperience = 4,
  projectsCompleted = 50,
  image = "/viber_image_2024-08-20_10-50-36-119.jpg",
}: AboutPreviewProps) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl text-center sm:text-left font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-md text-center sm:text text-gray-600 mb-6">{paragraph1}</p>
            <p className="text-md text-center sm:text text-gray-600 mb-8">{paragraph2}</p>
            <Link
              href={ctaLink}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 hover:brightness-110 transition-colors duration-300"
            >
              Learn More About Us
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center overflow-hidden relative">
              <Image
                src={image}
                alt="Architectural Excellence"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">{yearsExperience}+</div>
              <div className="text-sm">Years Experience</div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">{projectsCompleted}+</div>
              <div className="text-sm">Projects Completed</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
