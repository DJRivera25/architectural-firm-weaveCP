"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const processSteps = [
  {
    number: "01",
    title: "Scope & Contract",
    description:
      "We begin by understanding your needs, scoping out the project, creating a drawing list, and formalizing our commitment in a contract that outlines our deliverables, requirements, and timeline.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Kickoff",
    description:
      "We delve into the project details, discussing standards, reference drawings, update preferences, and communication frequency to ensure smooth collaboration as your remote in-house resource.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Drawing, Updates & Revisions",
    description:
      "We produce the required drawings and deliver them on schedule. We quickly incorporate updates and revisions, gradually becoming more familiar with your design language for a seamless workflow.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Final Revisions & Meeting",
    description:
      "We make final edits to ensure the output meets your needs and satisfies your clients. The final meeting confirms everything is completed to your satisfaction.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Job Review & Feedback",
    description:
      "We seek your feedback to improve our processes. Your guidance helps us enhance our services, ensuring we continuously improve for you and all our clients.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15s1.5 2 4 2 4-2 4-2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
];

export default function ProcessPreview() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Our Design Process
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            We follow a proven methodology that ensures every project is delivered with excellence, creativity, and
            attention to detail.
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div
          className="relative flex flex-col lg:flex-row items-stretch justify-between gap-y-8 gap-x-12 mb-16 lg:mb-24"
          role="list"
          aria-label="Process Steps"
        >
          {processSteps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex-1 flex flex-col items-center group px-2 sm:px-4"
              role="listitem"
              tabIndex={0}
              aria-label={`Step ${step.number}: ${step.title}`}
            >
              {/* Connecting Line/Arrow */}
              {index < processSteps.length - 1 && (
                <>
                  {/* Horizontal line for desktop */}
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 z-0 pointer-events-none">
                    <svg
                      width="100%"
                      height="24"
                      viewBox="0 0 120 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-0 top-0"
                    >
                      <line x1="0" y1="12" x2="112" y2="12" stroke="#2563eb" strokeWidth="2" strokeDasharray="8 8">
                        <animate attributeName="stroke-dashoffset" values="16;0" dur="1.2s" repeatCount="indefinite" />
                      </line>
                      <polygon points="112,6 120,12 112,18" fill="#2563eb" />
                    </svg>
                  </div>
                  {/* Hide vertical connector on mobile to prevent overlap */}
                </>
              )}
              {/* Step Circle/Icon */}
              <div className="relative z-10 flex flex-col items-center group focus:outline-none">
                <div
                  className="transition-all duration-300 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white group-hover:scale-110 group-focus:scale-110 group-hover:shadow-2xl group-focus:shadow-2xl"
                  aria-hidden="true"
                >
                  {step.number}
                </div>
                <div className="text-blue-600 mt-2 animate-fadeInSlow">{step.icon}</div>
              </div>
              {/* Step Content */}
              <div className="mt-4 text-center lg:text-left px-2 max-w-xs">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{step.description}</p>
              </div>
            </div>
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
            href="/process"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            Learn More About Our Process
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
