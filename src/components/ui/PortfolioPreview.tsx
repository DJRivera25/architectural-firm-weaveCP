"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type PortfolioItem = {
  title: string;
  category: string;
  image: string;
};

export type PortfolioPreviewProps = {
  items?: PortfolioItem[];
  intro?: string;
};

const defaultItems: PortfolioItem[] = [
  {
    title: "Modern Office Complex",
    category: "Commercial",
    image: "/api/placeholder/400/300",
  },
  {
    title: "Luxury Residential Villa",
    category: "Residential",
    image: "/api/placeholder/400/300",
  },
  {
    title: "Sustainable Community Center",
    category: "Public",
    image: "/api/placeholder/400/300",
  },
];

export default function PortfolioPreview({
  items = defaultItems,
  intro = "Explore our portfolio of innovative architectural designs that showcase our commitment to excellence and creativity.",
}: PortfolioPreviewProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Featured Projects
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {intro}
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {items.map((item, index) => (
            <motion.div
              key={item.title + index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="bg-gray-200 rounded-lg h-64 mb-4 overflow-hidden relative">
                {item.image && item.image !== "" && (
                  <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-blue-200">{item.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 hover:brightness-110 transition-colors duration-300"
          >
            View All Projects
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
