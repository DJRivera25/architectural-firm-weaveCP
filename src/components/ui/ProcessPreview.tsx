"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiUser, FiClipboard, FiCode, FiCheckCircle, FiSettings, FiMail } from "react-icons/fi";
import React from "react";
import Image from "next/image";

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type ProcessPreviewProps = {
  steps?: ProcessStep[];
  intro?: string;
};

const defaultSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Scope & Contract",
    description:
      "We begin by understanding your needs, scoping out the project, creating a drawing list, and formalizing our commitment in a contract that outlines our deliverables, requirements, and timeline.",
  },
  {
    number: "02",
    title: "Kickoff",
    description:
      "We delve into the project details, discussing standards, reference drawings, update preferences, and communication frequency to ensure smooth collaboration as your remote in-house resource.",
  },
  {
    number: "03",
    title: "Drawing, Updates & Revisions",
    description:
      "We produce the required drawings and deliver them on schedule. We quickly incorporate updates and revisions, gradually becoming more familiar with your design language for a seamless workflow.",
  },
  {
    number: "04",
    title: "Final Revisions & Meeting",
    description:
      "We make final edits to ensure the output meets your needs and satisfies your clients. The final meeting confirms everything is completed to your satisfaction.",
  },
  {
    number: "05",
    title: "Job Review & Feedback",
    description:
      "We seek your feedback to improve our processes. Your guidance helps us enhance our services, ensuring we continuously improve for you and all our clients.",
  },
];

const stepIcons = [
  <FiUser key="icon-0" size={32} className="text-black" />,
  <FiClipboard key="icon-1" size={32} className="text-black" />,
  <FiCode key="icon-2" size={32} className="text-black" />,
  <FiCheckCircle key="icon-3" size={32} className="text-black" />,
  <FiSettings key="icon-4" size={32} className="text-black" />,
  <FiMail key="icon-5" size={32} className="text-black" />,
];

export default function ProcessPreview({
  steps = defaultSteps,
  intro = "We follow a proven methodology that ensures every project is delivered with excellence, creativity, and attention to detail.",
}: ProcessPreviewProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className="relative py-10 sm:py-20 px-4 mx-2 sm:px-6 lg:px-8 overflow-visible"
    >
      {/* Background Image with Blur and Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/bg-our-process-1.png"
          alt="Process Background"
          fill
          className="object-cover blur-sm opacity-70"
          sizes="100vw"
          priority
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      </div>

      <div className="relative max-w-7xl mx-auto z-10 px-2">
        <div className="text-center mb-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow-sm"
          >
            Our Design Process
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="text-xl  max-w-3xl mx-auto"
          >
            {intro}
          </motion.p>
        </div>
        {/* Timeline: horizontal with alternating cards */}
        <motion.div
          className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] pt-4 overflow-visible"
          style={{ zIndex: 2 }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {/* Horizontal timeline line (desktop) */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.7 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="hidden md:block absolute top-1/2 h-0.5 bg-yellow-500 z-0 origin-left pointer-events-none"
            style={{ left: "80px", right: "80px", zIndex: 0 }}
          />
          <div className="hidden md:flex w-full justify-between relative z-10">
            {steps.map((step, idx) => {
              const isOdd = idx % 2 === 0;
              const isFirst = idx === 0;
              const isLast = idx === steps.length - 1;
              const cardWidth = "400px";
              const cardHeight = "auto";
              const card = (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  className="relative border-2 rounded-md shadow bg-blue-50/80 px-6 py-4 mx-auto min-h-[120px] pl-[64px] max-w-full md:max-w-[90vw] w-full md:w-[400px] z-20"
                  style={{ height: cardHeight }}
                >
                  <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-400 rounded-md flex items-center justify-center shadow z-30">
                    {stepIcons[idx % stepIcons.length]}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-blue-800 mb-1">{step.title}</div>
                    <ul className="text-sm text-blue-900/90 space-y-1">
                      {step.description.split("\n").map((line, i) => (
                        <li key={i}>› {line}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
              let cardPositionClass = "left-1/2 -translate-x-1/2";
              if (isFirst) cardPositionClass = "right-0 translate-x-1/2";
              if (isLast) cardPositionClass = "left-0 -translate-x-1/2";
              return (
                <div
                  key={step.number + step.title}
                  className="relative flex flex-col items-center w-[120px] max-w-full z-10"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.12 + 0.15, ease: "easeInOut" }}
                    viewport={{ once: true }}
                    className="w-10 h-10 rounded-full bg-blue-50 border-2 border-gray-900 flex items-center justify-center text-base font-bold text-blue-700 shadow-md mb-2 md:mb-0 z-20"
                  >
                    {step.number}
                  </motion.div>
                  {isOdd ? (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.7 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.12 + 0.08, ease: "easeInOut" }}
                      viewport={{ once: true }}
                      className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-0.5 h-[120px] bg-yellow-500 z-0 origin-bottom pointer-events-none"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.7 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.12 + 0.08, ease: "easeInOut" }}
                      viewport={{ once: true }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-[60px] bg-yellow-500 z-0 origin-top pointer-events-none"
                    />
                  )}
                  {isOdd ? (
                    <div className={`absolute ${cardPositionClass} -top-[200px] z-20`} style={{ maxWidth: "100vw" }}>
                      {card}
                    </div>
                  ) : (
                    <div className={`absolute ${cardPositionClass} top-[60px] z-20`} style={{ maxWidth: "100vw" }}>
                      {card}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile stacked card with vertical timeline */}
          <div className="md:hidden flex flex-col w-full items-center gap-y-0 relative z-10">
            <motion.div
              initial={{ opacity: 0, scaleY: 0.7 }}
              whileInView={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 1.2, delay: steps.length * 0.13, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="hidden absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-full bg-yellow-500 z-0 origin-top pointer-events-none"
            />
            {steps.map((step, idx) => (
              <React.Fragment key={step.number + step.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.12 + 0.15, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  className="w-10 h-10 rounded-full bg-blue-50 border-2 border-black flex items-center justify-center text-base font-bold text-blue-700 shadow-md z-20 mx-auto"
                  style={{ position: "relative", left: "0" }}
                >
                  {step.number}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  className="w-full flex flex-col items-center relative z-10 py-2"
                >
                  <div
                    className="flex items-start border-2 border-black rounded-md shadow bg-blue-50/80 px-4 py-3 min-w-[220px] max-w-full h-auto mx-auto mt-1"
                    style={{ position: "relative", paddingLeft: 56 }}
                  >
                    <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-400 rounded-md flex items-center justify-center shadow z-30">
                      {stepIcons[idx % stepIcons.length]}
                    </div>
                    <div>
                      <div className="font-bold text-base text-blue-800 mb-1">{step.title}</div>
                      <ul className="text-xs text-blue-900/90 space-y-1 pl-2">
                        {step.description.split("\n").map((line, i) => (
                          <li key={i}>› {line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
