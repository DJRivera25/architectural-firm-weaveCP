import React, { useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import Image from "next/image";
import { sendContactForm } from "@/utils/api";
import type { ContactFormPayload } from "@/types";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ open, onOpenChange }) => {
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

  const validateEmail = (email: string) => /.+@.+\..+/.test(email);
  const isNameValid = form.name.trim().length > 1;
  const isEmailValid = validateEmail(form.email);
  const isSubjectValid = !!form.subject;
  const isMessageValid = form.message.trim().length > 5;
  const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

  const labelClass = (value: string) =>
    `absolute left-3 top-3 text-gray-500 pointer-events-none transition-all duration-200
    peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-blue-700
    ${value ? "-translate-y-5 text-xs text-blue-700" : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-2xl font-bold focus:outline-none rounded-full bg-white/60 w-10 h-10 flex items-center justify-center"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        tabIndex={0}
      >
        ×
      </button>
      <div className="flex flex-col items-center">
        <Image src="/weave-symbol-tri.svg" alt="Weave Logo" width={48} height={48} className="mb-2" />
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Contact Us</h2>
        <p className="text-sm text-blue-800 mb-2 text-center">We&apos;d love to hear about your project or inquiry.</p>
      </div>
      <form
        className="space-y-5 flex-1"
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
              setFormSuccess("Thank you for your inquiry! We&apos;ll get back to you soon.");
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
        {/* Name Field with Floating Label */}
        <div className="relative">
          <input
            className={`peer block w-full px-3 py-3 border rounded-md shadow-sm bg-white/80 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
              touched.name && !isNameValid
                ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder=" "
            autoFocus
            aria-required="true"
            aria-invalid={touched.name && !isNameValid}
          />
          <label htmlFor="contact-name" className={labelClass(form.name)}>
            Name
          </label>
          {touched.name && !isNameValid && (
            <span className="text-xs text-red-600 mt-1 block">Please enter your name.</span>
          )}
        </div>
        {/* Email Field with Floating Label */}
        <div className="relative">
          <input
            className={`peer block w-full px-3 py-3 border rounded-md shadow-sm bg-white/80 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
              touched.email && !isEmailValid
                ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            id="contact-email"
            type="email"
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
          {touched.email && !isEmailValid && (
            <span className="text-xs text-red-600 mt-1 block">Please enter a valid email address.</span>
          )}
        </div>
        {/* Subject Field with Floating Label and Suggestions */}
        <div className="relative">
          <select
            className={`peer block w-full px-3 py-3 border rounded-md shadow-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none ${
              touched.subject && !isSubjectValid
                ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            id="contact-subject"
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
          {touched.subject && !isSubjectValid && (
            <span className="text-xs text-red-600 mt-1 block">Please select a subject.</span>
          )}
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {/* Message Field with Floating Label and Character Counter */}
        <div className="relative">
          <textarea
            className={`peer block w-full px-3 py-3 border rounded-md shadow-sm bg-white/80 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all resize-none ${
              touched.message && !isMessageValid
                ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            id="contact-message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, message: true }))}
            placeholder=" "
            rows={4}
            maxLength={500}
            aria-required="true"
            aria-invalid={touched.message && !isMessageValid}
          />
          <label htmlFor="contact-message" className={labelClass(form.message)}>
            Message
          </label>
          <div className="absolute right-3 bottom-2 text-xs text-gray-400 select-none">{form.message.length}/500</div>
          {touched.message && !isMessageValid && (
            <span className="text-xs text-red-600 mt-1 block">Please enter a message (min 6 characters).</span>
          )}
        </div>
        {/* Error/Success States */}
        {formError && <div className="text-red-600 text-sm text-center">{formError}</div>}
        {formSuccess && (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <svg
              className="w-12 h-12 text-green-500 mb-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-semibold text-green-700">Thank you!</span>
            <span className="text-sm text-blue-900">Your inquiry has been sent. We&apos;ll get back to you soon.</span>
          </div>
        )}
        {/* Submit Button */}
        {!formSuccess && (
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-700" viewBox="0 0 24 24">
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
          </Button>
        )}
      </form>
    </Dialog>
  );
};
