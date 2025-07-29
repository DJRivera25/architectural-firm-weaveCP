"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ContactModal } from "./ContactModal";

export type HeroSectionProps = {
  beforeImage?: string;
  afterImage?: string;
  subheadline?: string;
  cta1Text?: string;
  cta1Link?: string;
  cta2Text?: string;
  cta2Link?: string;
};

export default function HeroSection({
  beforeImage = "/Before - Anilao Site Plan_page-0001.png",
  afterImage = "/After - Anilao Render.jpg",
  subheadline = "We are an architecture service outsourcing company that seamlessly translates design concepts into documentation.",
  cta1Text = "View Our Work",
  cta1Link = "/services",
  cta2Text = "Make Inquiry",
}: HeroSectionProps) {
  const [reveal, setReveal] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const requestRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let start: number | undefined;
    const duration = 4000;
    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setReveal(direction === 1 ? progress : 1 - progress);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        intervalRef.current = setTimeout(() => {
          setDirection((d) => (d === 1 ? -1 : 1));
        }, 3000);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [direction]);

  return (
    <section className="relative w-full min-h-[60vh] max-h-screen flex items-center justify-center overflow-hidden px-0 md:px-4 py-0 md:py-6">
      {/* Animated before/after image as moving background */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-full">
          <Image
            src={beforeImage}
            alt="Before: Site Plan"
            fill
            className="object-cover w-full h-full opacity-80"
            style={{ objectPosition: "center" }}
            priority
            draggable={false}
            sizes="100vw"
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
            WebkitClipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
          }}
        >
          <Image
            src={afterImage}
            alt="After: Rendered View"
            fill
            className="object-cover w-full h-full opacity-80 "
            style={{ objectPosition: "center" }}
            priority
            draggable={false}
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-indigo-900/50" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between h-full px-4 py-8 md:py-16">
        {/* Right: Hero text and animation */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-end h-full w-full md:w-2/3 text-center md:text-right">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="w-full max-w-3xl mb-2"
          >
            <div className="uppercase text-white/80 text-xs sm:text-sm md:text-base font-light text-center md:text-right w-full font-mono tracking-[.35em] sm:tracking-[.45em] md:tracking-[.6em] whitespace-pre">
              WE DONT OUTSOURCE WE SIDESOURCE
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight max-w-3xl text-center md:text-right"
          >
            {subheadline}
          </motion.p>
          {/* CTAs as premium text links with animated underlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-row gap-6 mt-2 w-full max-w-xs z-20 justify-center md:justify-end md:ml-auto"
          >
            <Link
              href={cta1Link}
              className="relative text-lg font-semibold text-white group cursor-pointer select-none px-0 py-0"
            >
              {cta1Text}
              <span className="block h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 w-full mt-1 transition-all duration-300 group-hover:h-2 group-hover:bg-yellow-500"></span>
            </Link>
            <button
              type="button"
              className="relative text-lg font-semibold text-blue-100 group cursor-pointer select-none px-0 py-0 border-none bg-transparent focus:outline-none"
              onClick={() => setIsModalOpen(true)}
            >
              {cta2Text}
              <span className="block h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 w-full mt-1 transition-all duration-300 group-hover:h-2 group-hover:bg-blue-400"></span>
            </button>
          </motion.div>
          {/* No foreground image block, background is now animated */}
        </div>
      </div>
      {/* Contact Modal */}
      <ContactModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
}
