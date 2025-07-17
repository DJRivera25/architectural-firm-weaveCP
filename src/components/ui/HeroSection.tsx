"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  // Animation state for before/after scan
  const [reveal, setReveal] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1: before->after, -1: after->before
  const requestRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let start: number | undefined;
    const duration = 4000; // ms (was 2000)
    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setReveal(direction === 1 ? progress : 1 - progress);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Wait 3s, then reverse direction and animate again
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
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden px-2 py-2">
      {/* Before/After Animated Comparison */}
      <div className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto aspect-[16/9] sm:aspect-[16/7] mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white min-h-[220px]">
        {/* Before image (site plan) */}
        <Image
          src="/Before - Anilao Site Plan_page-0001.jpg"
          alt="Before: Site Plan"
          fill
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          draggable={false}
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
        />
        {/* After image (render) with sharp scanner boundary */}
        <Image
          src="/After - Anilao Render.jpg"
          alt="After: Rendered View"
          fill
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          style={{
            clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
            WebkitClipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
          }}
          draggable={false}
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
        />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>

      <div className="relative z-10 text-center text-white px-2 sm:px-4 lg:px-8 max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto">
        {/* <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
        >
          Creating Spaces That
          <span className="block text-blue-300">Inspire & Transform</span>
        </motion.h1> */}

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl md:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto"
        >
          We are an <span className="text-yellow-400 font-bold">architecture service outsourcing company</span> that
          seamlessly translates design concepts into documentation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/portfolio"
            className="bg-white text-blue-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 transition-colors duration-300 w-full sm:w-auto"
          >
            View Our Work
          </Link>
          <Link
            href="/about"
            className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-900 transition-colors duration-300 w-full sm:w-auto"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mx-auto mt-8 sm:mt-10 md:mt-12 flex justify-center items-center w-full"
        >
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
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
