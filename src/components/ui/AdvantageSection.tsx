"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const chartData = [
  { label: "USA", value: 227 },
  { label: "AUSTRALIA", value: 262 },
  { label: "UK", value: 145 },
  { label: "SINGAPORE", value: 151 },
];

function AnimatedBar({ value, label, delay }: { value: number; label: string; delay: number }) {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1.02); // default

  // Responsive multiplier logic
  useEffect(() => {
    const setResponsiveMultiplier = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setMultiplier(0.77); // Mobile
      } else if (width < 1024) {
        setMultiplier(1.08); // Tablet
      } else {
        setMultiplier(1.02); // Desktop
      }
    };

    setResponsiveMultiplier(); // Initial
    window.addEventListener("resize", setResponsiveMultiplier);
    return () => window.removeEventListener("resize", setResponsiveMultiplier);
  }, []);

  // Animate count
  useEffect(() => {
    let frame: number;
    let start: number | null = null;

    function animateCount(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 5000, 1);
      const val = Math.floor(progress * value);
      setCount(val);
      if (progress < 1) {
        frame = requestAnimationFrame(animateCount);
      } else {
        setCount(value);
      }
    }

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(animateCount);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center w-1/5 min-w-[40px] max-w-[90px] md:min-w-[56px] md:max-w-[90px]">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height: `${value * multiplier}px`, opacity: 1 }}
        transition={{ duration: 5, delay: delay / 1000, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="flex flex-col justify-end items-center w-full"
        style={{ alignSelf: "flex-end" }}
      >
        <div
          className="bg-gradient-to-b from-blue-400 via-blue-700 to-indigo-700 rounded-t-xl w-full min-w-[28px] max-w-[60px] md:min-w-[40px] md:max-w-[90px] flex flex-col justify-end relative shadow-lg"
          style={{ height: `${count * multiplier}px` }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 + delay / 1000, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="absolute inset-0 flex flex-col justify-center items-center"
          >
            <span className="text-sm md:text-2xl font-bold text-white drop-shadow-lg">{count}%</span>
            <span className="text-[10px] md:text-base text-blue-100">higher</span>
          </motion.div>
        </div>
      </motion.div>
      <span className="mt-1 md:mt-3 text-blue-900 font-bold text-xs md:text-lg text-center tracking-tight whitespace-nowrap flex flex-col items-center max-w-[70px] md:max-w-[110px]">
        {label}
      </span>
    </div>
  );
}

export default function AdvantageSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 ">
        <div className="flex flex-col gap-8 md:pr-8 h-full justify-between min-h-[400px]">
          <h2 className="text-5xl md:text-5xl font-extrabold text-left leading-tight text-blue-900">
            What is the <span className="text-blue-600">in-house cost</span> of construction drawings?
          </h2>
          <div className="text-lg text-blue-700 font-medium text-left max-w-xl self-end">
            Weave offers a significant pricing advantage compared to prevailing rates in other continents. Our rates are
            highly competitive, making us an attractive option for cost-conscious clients who operate in any part of the
            world. By choosing Weave, you benefit from top-tier architectural services at a fraction of the cost,
            without compromising on quality or expertise.
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="relative w-full max-w-[95vw] md:max-w-xl aspect-square flex flex-col items-center">
            <div className="absolute -inset-4 md:-inset-8 z-0 rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-20 blur-lg" />
            <div className="relative z-10 bg-white rounded-3xl py-4 md:py-12 px-1 md:px-8 shadow-2xl w-full h-full flex flex-col items-center border border-blue-100">
              <h3 className="text-xs md:text-xl font-bold text-blue-900 mb-2 md:mb-6 text-center max-w-60 sm:max-w-[90vw]">
                How much more would a junior architect cost compared to Weave?
              </h3>
              <div className="relative w-full h-full flex flex-col items-center justify-end">
                <div className="relative w-full h-full pt-2 md:pt-6 pl-2 md:pl-20 pr-2 md:pr-8">
                  {[300, 250, 200, 150, 100, 50, 0].map((tick, idx, arr) => (
                    <div
                      key={tick}
                      className="absolute left-0 right-0 flex items-center"
                      style={{ top: `calc(${(idx / (arr.length - 1)) * 100}% - 1px)` }}
                    >
                      <span className="text-[10px] md:text-sm text-blue-900 font-semibold w-6 md:w-12 text-right mr-1 md:mr-2 select-none">
                        {tick}%
                      </span>
                      <div className="flex-1 h-0.5 bg-blue-100" />
                    </div>
                  ))}
                  <div className="absolute left-8 md:left-20 right-4 md:right-8 sm:bottom-[-40] bottom-[-23] sm:top-4 md:top-6 flex items-end justify-between z-10">
                    {chartData.map((d, i) => (
                      <AnimatedBar key={d.label} value={d.value} label={d.label} delay={200 + i * 180} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="italic text-[9px] md:text-xs text-blue-900/60 text-center max-w-full mt-6 md:mt-12">
                Source: Indeed. Includes all paid time off, healthcare, 401K, and other benefits
                <br />
                Source: Commercial Edge. Average US$37/sqf/yr and 100 sqf per employee
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
