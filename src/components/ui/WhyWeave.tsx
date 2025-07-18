"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type WhyWeaveCard = {
  title: string;
  description: string;
  image: string;
};

const defaultCards: WhyWeaveCard[] = [
  {
    title: "Architectural Proficiency",
    description:
      "Our team of architects is proficient in architectural design, and takes great care to understand our clients' design language. Therefore we ensure that all output is consistent with the client's design intent, is compliant with applicable regulations, and is constructible.",
    image: "/viber_image_2024-08-20_10-24-20-974.jpg",
  },
  {
    title: "The Right Tools",
    description:
      "Our team is equipped with the powerful equipment and industry-standard software necessary to deliver the output the client needs, promptly and accurately.",
    image: "/viber_image_2024-08-20_10-27-11-706.jpg",
  },
  {
    title: "A Culture of Joy",
    description:
      "Our unique blend of joy and service, a hallmark of Filipino culture, sets us apart. We believe in a collaborative process that ensures client satisfaction. Our commitment to service guarantees that even the most challenging projects are handled with care and professionalism.",
    image: "/DENS0741.jpg",
  },
];

export type WhyWeaveProps = {
  heading?: string;
  cards?: WhyWeaveCard[];
};

export default function WhyWeave({ heading = "Why Weave?", cards = defaultCards }: WhyWeaveProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-bold text-gray-900 mb-12 text-center"
        >
          {heading}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * idx }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full"
            >
              <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={idx === 0}
                />
              </div>
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-700 text-base flex-1">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
