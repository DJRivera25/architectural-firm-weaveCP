"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const whyWeaveCards = [
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

export function WhyWeaveSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">Why Weave</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyWeaveCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: idx * 0.15, type: "spring", bounce: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              className="bg-neutral-50 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-neutral-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl focus-within:scale-105 focus-within:shadow-2xl"
            >
              <div className="relative w-full h-48 sm:h-56 md:h-44 lg:h-48 xl:h-56">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority={idx === 0}
                />
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{card.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">About Us</h2>
            <p className="text-lg text-gray-600 mb-6">
              Architecture is a challenging field and a complex business. Weave Collaboration Partners was established
              to make running your company easier, simpler, and more profitable. We handle the mechanical and routine
              tasks, allowing you to focus on the imaginative, the creative, the functional, and the beautiful.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Don’t think of it as just outsourcing.Think of it as a seamless extension of your team—a remote resource
              that delivers high-quality work with the same efficiency and excellence you expect from your own staff.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
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
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg font-medium">Architectural Excellence</p>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-4 -left-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm">Years Experience</div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm">Projects Completed</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
