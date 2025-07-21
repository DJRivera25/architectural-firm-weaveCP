"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sendContactForm } from "@/utils/api";
import type { ContactFormPayload } from "@/types";

const faqs = [
  {
    question: "How quickly will I get a response?",
    answer: "We aim to respond to all inquiries within 24 hours on business days.",
  },
  {
    question: "Can I request a custom architectural service?",
    answer: "Absolutely! We specialize in custom solutions. Just let us know your needs in the form.",
  },
  {
    question: "Where is your office located?",
    answer: "We are based in [Your City], but we serve clients worldwide through digital collaboration.",
  },
  {
    question: "What file formats do you accept?",
    answer: "We accept most major formats including DWG, RVT, SKP, PDF, and more.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormPayload>({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, subject: false, message: false });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validateEmail = (email: string) => /.+@.+\..+/.test(email);
  const isNameValid = form.name.trim().length > 1;
  const isEmailValid = validateEmail(form.email);
  const isSubjectValid = !!form.subject;
  const isMessageValid = form.message.trim().length > 5;
  const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

  const labelClass = (value: string) =>
    `absolute left-0 top-2 text-gray-500 pointer-events-none transition-all duration-200
    peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-blue-600
    ${value ? "-translate-y-5 text-xs text-blue-600" : ""}`;

  const faqContainerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.04,
      },
    },
  };
  const faqItemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeInOut" as const },
    },
  };

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Hero Section */}
      <section className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="/bg-contacts-page-1.jpg"
          alt="Contact Hero Background"
          fill
          className="object-cover object-center w-full h-full absolute z-0 opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/70 to-white/10 z-10" />
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between h-full">
          {/* Left: View Services link */}
          <motion.div
            className="hidden md:flex flex-col justify-center items-start h-full w-1/3"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          >
            <a href="/services" className="relative text-lg font-semibold text-white group cursor-pointer select-none">
              VIEW SERVICES
              <span className="block h-0.5 bg-gradient-to-r from-blue-700 to-indigo-800 w-full mt-1 transition-all duration-300 group-hover:h-1 group-hover:bg-blue-700"></span>
            </a>
          </motion.div>
          {/* Right: Hero text */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-end h-full w-full md:w-2/3 text-center md:text-right">
            <motion.h1
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight"
            >
              Let&apos;s Build Something Extraordinary Together
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className="text-lg md:text-2xl text-blue-100 max-w-2xl mb-6 font-medium"
            >
              Reach out for a free consultation or to discuss your next project. We&apos;re excited to collaborate with
              you!
            </motion.p>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="bg-gradient-to-br from-white via-blue-50 to-blue-100">
        <motion.div
          className="w-full max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.13, delayChildren: 0.05 },
            },
          }}
        >
          {/* Left Column */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeInOut" as const } },
            }}
            className="flex flex-col items-start gap-8 pr-2"
          >
            <h2 className="text-2xl md:text-3xl font-bold ">Contact Information</h2>
            <p className="text-base md:text-lg max-w-md text-blue-900">
              Your vision, our expertise. Let&apos;s create inspiring spaces together. We&apos;re here to answer your
              questions and help you get started.
            </p>
            <div className="space-y-3 mt-4 w-full">
              <div className="flex items-center gap-2 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 008.48 19h6.04a2 2 0 001.83-1.3L17 13M7 13l1.5-6h7l1.5 6"
                  />
                </svg>
                <span>
                  Mobile:{" "}
                  <a href="tel:+639123456789" className="hover:underline">
                    +63 912 345 6789
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <svg className="w-5 h-5 " fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 008.48 19h6.04a2 2 0 001.83-1.3L17 13M7 13l1.5-6h7l1.5 6"
                  />
                </svg>
                <span>
                  Telephone:{" "}
                  <a href="tel:+6321234567" className="hover:underline">
                    +63 2 1234 567
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <svg className="w-5 h-5 " fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 12v1a4 4 0 01-8 0v-1m8 0V9a4 4 0 00-8 0v3m8 0a4 4 0 01-8 0"
                  />
                </svg>
                <span>
                  Email:{" "}
                  <a href="mailto:info@weavecp.com" className="hover:underline">
                    info@weavecp.com
                  </a>
                </span>
              </div>
            </div>
            {/* Connect Section */}
            <div className="mt-8 flex flex-col gap-2 w-full">
              <span className="uppercase text-xs font-semibold text-blue-800 tracking-widest mb-1">CONNECT:</span>
              <div className="flex flex-row items-center gap-6 mt-1">
                <a
                  href="https://facebook.com/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on Facebook"
                  className="hover:scale-110 transition-transform"
                >
                  {/* Facebook SVG */}
                  <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/yourcompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on LinkedIn"
                  className="hover:scale-110 transition-transform"
                >
                  {/* LinkedIn SVG */}
                  <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
          {/* Right Column: Contact Form */}
          <motion.form
            variants={{
              hidden: { opacity: 0, x: 40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeInOut" as const } },
            }}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setTouched({ name: true, email: true, subject: true, message: true });
              setFormError("");
              setFormSuccess("");
              if (!isFormValid) return;
              setIsSubmitting(true);
              try {
                const payload: ContactFormPayload = { ...form };
                const res = await sendContactForm(payload);
                if ("error" in res && res.error) {
                  setFormError(typeof res.error === "string" ? res.error : "Failed to send message");
                } else {
                  setFormSuccess("Thank you for your inquiry! We'll get back to you soon.");
                  setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
                  setTouched({ name: false, email: false, subject: false, message: false });
                }
              } catch (err) {
                setFormError("Something went wrong. Please try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            aria-label="Contact form"
          >
            {/* Name Field */}
            <div>
              <div
                className={`relative pb-2 border-b transition-all duration-300 ${
                  touched.name && !isNameValid
                    ? "border-red-500"
                    : "border-blue-900 focus-within:border-blue-800 focus-within:border-b-2"
                }`}
              >
                <input
                  id="contact-name"
                  type="text"
                  className="peer w-full bg-transparent text-blue-900 placeholder-transparent focus:outline-none text-lg"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder=" "
                  aria-required="true"
                  aria-invalid={touched.name && !isNameValid}
                />
                <label htmlFor="contact-name" className={labelClass(form.name)}>
                  Name
                </label>
              </div>
              {touched.name && !isNameValid && (
                <span className="block mt-1 text-xs text-red-500">Please enter your name.</span>
              )}
            </div>

            {/* Email Field */}
            <div>
              <div
                className={`relative pb-2 border-b transition-all duration-300 ${
                  touched.email && !isEmailValid
                    ? "border-red-500"
                    : "border-blue-900 focus-within:border-blue-800 focus-within:border-b-2"
                }`}
              >
                <input
                  id="contact-email"
                  type="email"
                  className="peer w-full bg-transparent text-blue-900 placeholder-transparent focus:outline-none text-lg"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder=" "
                  aria-required="true"
                  aria-invalid={touched.email && !isEmailValid}
                />
                <label htmlFor="contact-email" className={labelClass(form.email)}>
                  Email
                </label>
              </div>
              {touched.email && !isEmailValid && (
                <span className="block mt-1 text-xs text-red-500">Please enter a valid email address.</span>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <div
                className={`relative pb-2 border-b transition-all duration-300 ${
                  touched.subject && !isSubjectValid
                    ? "border-red-500"
                    : "border-blue-900 focus-within:border-blue-800 focus-within:border-b-2"
                }`}
              >
                <select
                  id="contact-subject"
                  className="peer w-full bg-transparent text-blue-900 focus:outline-none text-lg appearance-none"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                  aria-required="true"
                  aria-invalid={touched.subject && !isSubjectValid}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Services">Services</option>
                  <option value="Careers">Careers</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
                <label htmlFor="contact-subject" className={labelClass(form.subject)}>
                  Subject
                </label>
              </div>
              {touched.subject && !isSubjectValid && (
                <span className="block mt-1 text-xs text-red-500">Please select a subject.</span>
              )}
            </div>

            {/* Message Field */}
            <div>
              <div
                className={`relative pb-2 border-b transition-all duration-300 ${
                  touched.message && !isMessageValid
                    ? "border-red-500"
                    : "border-blue-900 focus-within:border-blue-800 focus-within:border-b-2"
                }`}
              >
                <textarea
                  id="contact-message"
                  rows={4}
                  maxLength={500}
                  className="peer w-full bg-transparent text-blue-900 placeholder-transparent focus:outline-none text-lg resize-none"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  placeholder=" "
                  aria-required="true"
                  aria-invalid={touched.message && !isMessageValid}
                />
                <label htmlFor="contact-message" className={labelClass(form.message)}>
                  Message
                </label>
                <div className="absolute right-0 bottom-0 text-xs text-blue-400 select-none">
                  {form.message.length}/500
                </div>
              </div>
              {touched.message && !isMessageValid && (
                <span className="block mt-1 text-xs text-red-500">Please enter a message (min 6 characters).</span>
              )}
            </div>

            {/* Error & Success States */}
            {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
            {formSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-2 py-4 text-center"
              >
                <svg
                  className="w-12 h-12 text-green-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg font-semibold text-green-600">Thank you!</span>
                <span className="text-sm text-blue-900">
                  Your inquiry has been sent. We&apos;ll get back to you soon.
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            {!formSuccess && (
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white font-bold py-3 rounded-lg shadow-md hover:brightness-110 hover:scale-[1.02] transition-transform text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Inquiry"
                )}
              </button>
            )}
          </motion.form>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full relative overflow-visible py-12">
        {/* FAQ Background Image - full width, blurred, behind everything */}
        <div className="pointer-events-none absolute inset-0 w-full h-full -z-10">
          <Image
            src="/bg-faq-1.png"
            alt="FAQ Background"
            fill
            className="object-cover w-full h-full opacity-60 blur-md"
            style={{ objectPosition: "center" }}
            priority={false}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="text-center text-2xl md:text-3xl font-bold text-blue-700 mb-8 sm:text-left"
          >
            Frequently Asked Questions
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={faqContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.question}
                variants={faqItemVariants}
                className={`relative rounded-2xl shadow-md p-6 border transition-all duration-300 ${
                  openFaq === idx ? "border-blue-700 bg-blue-50/80" : "border-blue-100 bg-white/90"
                }`}
              >
                <motion.button
                  type="button"
                  className="flex items-center justify-between w-full text-left text-blue-900 font-semibold text-lg focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="pr-4">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: openFaq === idx ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2 flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.span>
                </motion.button>
                <motion.div
                  id={`faq-answer-${idx}`}
                  initial={false}
                  animate={{ height: openFaq === idx ? "auto" : 0, opacity: openFaq === idx ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden text-blue-900 text-base mt-2 text-left"
                  style={{ pointerEvents: openFaq === idx ? "auto" : "none" }}
                >
                  {openFaq === idx && <div className="py-2 pl-1 pr-2 text-blue-800 leading-relaxed">{faq.answer}</div>}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
}
