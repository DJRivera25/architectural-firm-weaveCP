"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  beforeImage = "/Before - Anilao Site Plan_page-0001.jpg",
  afterImage = "/After - Anilao Render.jpg",
  subheadline = "We are an architecture service outsourcing company that seamlessly translates design concepts into documentation.",
  cta1Text = "View Our Work",
  cta1Link = "/portfolio",
  cta2Text = "Make Inquiry",
  cta2Link = "/about",
}: HeroSectionProps) {
  const [reveal, setReveal] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const requestRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    <section className="relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden px-4 pt-4 sm:pt-4 md:pt-6 h-auto min-h-[60vh] max-h-screen">
      <div className="relative z-10 text-center text-white px-2 sm:px-4 lg:px-8 max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto mb-4">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl md:text-2xl text-blue-100 mb-1 sm:mb-2 max-w-2xl mx-auto"
        >
          {subheadline}
        </motion.p>
      </div>
      <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-7xl xl:max-w-[1200px] mx-auto aspect-[4/3] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] xl:aspect-[16/3] rounded-xl overflow-hidden shadow-2xl min-h-[160px] sm:min-h-[180px] md:min-h-[240px] lg:min-h-[350px] xl:min-h-[500px] max-h-[50vh] mb-2">
        <Image
          src={beforeImage}
          alt="Before: Site Plan"
          fill
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          draggable={false}
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 90vw, 1600px"
        />
        <Image
          src={afterImage}
          alt="After: Rendered View"
          fill
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          style={{
            clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
            WebkitClipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
          }}
          draggable={false}
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1600px"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-row gap-3 justify-center mt-4 w-full max-w-xs mx-auto"
      >
        <Link
          href={cta1Link}
          className="bg-white text-blue-900 px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-50 transition-colors duration-300 w-1/2 text-center whitespace-nowrap "
        >
          {cta1Text}
        </Link>
        <Link
          href={cta2Link}
          className="border-2 border-white text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-white hover:text-blue-900 transition-colors duration-300 w-1/2 text-center whitespace-nowrap"
        >
          {cta2Text}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mx-auto mt-4 md:mb-4 flex justify-center items-center w-full"
      >
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-xl"
      />
    </section>
  );
}
