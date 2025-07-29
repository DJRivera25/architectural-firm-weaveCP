"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import InlineEditableText from "./InlineEditableText";
import type { HeroSectionProps } from "@/components/ui/HeroSection";

interface HeroSectionInlineEditableProps extends HeroSectionProps {
  onFieldChange: (field: keyof HeroSectionProps, value: string) => void;
  showEditButtons?: boolean;
  tagline: string;
}

const HeroSectionInlineEditable: React.FC<HeroSectionInlineEditableProps> = ({
  beforeImage = "",
  afterImage = "",
  subheadline = "",
  cta1Text = "",
  cta1Link = "",
  cta2Text = "",
  cta2Link = "",
  onFieldChange,
  showEditButtons = false,
  // Add new prop for the tagline
  tagline = "WE DONT OUTSOURCE WE SIDESOURCE",
}) => {
  // Reveal animation logic (copied from original HeroSection)
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

  function renderImageEdit(src: string, field: keyof HeroSectionProps, alt: string) {
    return (
      <div className={"relative group w-full h-full" + (showEditButtons ? " ring-2 ring-blue-300" : "")}>
        <img src={src} alt={alt} className="object-cover w-full h-full opacity-80" draggable={false} />
        <label
          className={
            "absolute top-2 right-2 flex items-center justify-end z-10 transition-opacity cursor-pointer " +
            (showEditButtons ? "opacity-100" : "opacity-0 group-hover:opacity-100")
          }
          style={{ width: "auto", height: "auto" }}
        >
          <span className="bg-white/90 text-blue-700 px-2 py-1 rounded shadow font-semibold text-xs flex items-center gap-1">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2.828 2.828 0 00-4-4L3 17z" />
            </svg>
            Change Image
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.url) onFieldChange(field, data.url);
              }
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-[60vh] max-h-screen flex items-center justify-center overflow-hidden px-0 md:px-4 py-0 md:py-6">
      {/* Animated before/after image as moving background, now editable */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-full">
          {renderImageEdit(beforeImage, "beforeImage", "Before: Site Plan")}
        </motion.div>
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
            WebkitClipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
          }}
        >
          {renderImageEdit(afterImage, "afterImage", "After: Rendered View")}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-indigo-900/50" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between h-full px-4 py-8 md:py-16">
        <div className="flex-1 flex flex-col justify-center items-center md:items-end h-full w-full md:w-2/3 text-center md:text-right">
          <div className="w-full max-w-3xl mb-2">
            <InlineEditableText
              value={tagline}
              onChange={(val) => onFieldChange("tagline" as keyof HeroSectionProps, val)}
              className="uppercase text-white/80 text-xs sm:text-sm md:text-base font-light text-center md:text-right w-full font-mono tracking-[.35em] sm:tracking-[.45em] md:tracking-[.6em] whitespace-pre bg-transparent border-none outline-none"
              placeholder="Enter tagline..."
            />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight max-w-3xl text-center md:text-right">
            <InlineEditableText
              value={subheadline}
              onChange={(val) => onFieldChange("subheadline", val)}
              className="bg-transparent border-none outline-none text-white w-full"
              textarea
              placeholder="Enter subheadline..."
            />
          </div>
          <div className="flex flex-row gap-6 mt-2 w-full max-w-xs z-20 justify-center md:justify-end md:ml-auto">
            <span className="relative">
              <InlineEditableText
                value={cta1Text}
                onChange={(val) => onFieldChange("cta1Text", val)}
                className="relative text-lg font-semibold text-white bg-transparent border-none outline-none px-0 py-0"
                placeholder="CTA 1 Text"
              />
              <InlineEditableText
                value={cta1Link}
                onChange={(val) => onFieldChange("cta1Link", val)}
                className="block text-xs text-blue-200 bg-transparent border-none outline-none px-0 py-0 mt-1"
                placeholder="CTA 1 Link"
              />
            </span>
            <span className="relative">
              <InlineEditableText
                value={cta2Text}
                onChange={(val) => onFieldChange("cta2Text", val)}
                className="relative text-lg font-semibold text-blue-100 bg-transparent border-none outline-none px-0 py-0"
                placeholder="CTA 2 Text"
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionInlineEditable;
