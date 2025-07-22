import { useState, useRef, useEffect } from "react";
import { JOB_TYPES } from "./constants";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import React from "react";
import Image from "next/image";

// 1. Add imports for icons and close button
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type GradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline";
};

function GradientButton({ children, className = "", variant = "primary", ...props }: GradientButtonProps) {
  const base =
    "inline-flex items-center justify-center font-archivo font-semibold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-base";
  const primary =
    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-600";
  const outline = "border-2 border-blue-600 text-blue-700 bg-white hover:bg-blue-50 focus:ring-blue-600";
  return (
    <button className={`${base} ${variant === "primary" ? primary : outline} ${className}`} {...props}>
      {children}
    </button>
  );
}

type GradientInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  className?: string;
};

const GradientInput = React.forwardRef<HTMLInputElement, GradientInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-base font-bold text-blue-900 mb-1 font-archivo">{label}</label>}
        <input
          ref={ref}
          className={`block w-full px-4 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-base transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-blue-50 ${className} ${
            error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
          }`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-archivo">{error}</p>}
      </div>
    );
  }
);

GradientInput.displayName = "GradientInput";

type GradientTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  className?: string;
};

function GradientTextarea({ label, error, className = "", ...props }: GradientTextareaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-base font-bold text-blue-900 mb-1 font-archivo">{label}</label>}
      <textarea
        className={`block w-full px-4 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-base transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-blue-50 ${className} ${
          error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 font-archivo">{error}</p>}
    </div>
  );
}

const CURRENCIES = ["$", "₱", "€", "£"];

export interface JobFormValues {
  title: string;
  description: string;
  type: string;
  location: string;
  salary: { min: number; max: number; currency: string };
  requirements: string[];
  responsibilities: string[];
  isActive: boolean;
}

// Add FloatingLabelInput and FloatingLabelTextarea components
function FloatingLabelInput({
  label,
  helper,
  error,
  className = "",
  ...props
}: {
  label: string;
  helper?: string;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = Boolean(props.value && String(props.value).length > 0);
  return (
    <div className="relative w-full mb-1">
      <input
        {...props}
        className={`block w-full px-2 pt-3 pb-1 border-2 rounded-md bg-white/80 backdrop-blur-md shadow-sm placeholder-transparent font-archivo text-[13px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)] border-blue-100 ${
          error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
        } ${className}`}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
      />
      <label
        className={`absolute left-2 top-0.5 text-[11px] font-semibold font-archivo pointer-events-none transition-all duration-200 tracking-wide ${
          focused || hasValue ? "-translate-y-2 scale-90 text-blue-700 bg-white/90 px-0.5" : "text-blue-900"
        }`}
      >
        {label}
      </label>
      {helper && <div className="text-[10px] text-blue-500 mt-0.5 font-archivo">{helper}</div>}
      {error && <div className="text-[10px] text-red-600 mt-0.5 font-archivo">{error}</div>}
    </div>
  );
}

function FloatingLabelTextarea({
  label,
  helper,
  error,
  className = "",
  ...props
}: {
  label: string;
  helper?: string;
  error?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = Boolean(props.value && String(props.value).length > 0);
  return (
    <div className="relative w-full mb-1">
      <textarea
        {...props}
        className={`block w-full px-2 pt-3 pb-1 border-2 rounded-md bg-white/80 backdrop-blur-md shadow-sm placeholder-transparent font-archivo text-[13px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)] border-blue-100 ${
          error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
        } ${className}`}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        rows={props.rows || 4}
      />
      <label
        className={`absolute left-2 top-0.5 text-[11px] font-semibold font-archivo pointer-events-none transition-all duration-200 tracking-wide ${
          focused || hasValue ? "-translate-y-2 scale-90 text-blue-700 bg-white/90 px-0.5" : "text-blue-900"
        }`}
      >
        {label}
      </label>
      {helper && <div className="text-[10px] text-blue-500 mt-0.5 font-archivo">{helper}</div>}
      {error && <div className="text-[10px] text-red-600 mt-0.5 font-archivo">{error}</div>}
    </div>
  );
}

export default function JobForm({
  initialValues,
  onSubmit,
  loading,
  onCancel,
  onClose, // new prop for modal close (optional)
}: {
  initialValues?: JobFormValues;
  onSubmit: (form: JobFormValues) => void;
  loading: boolean;
  onCancel: () => void;
  onClose?: () => void;
}) {
  const [form, setForm] = useState<JobFormValues>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    type: initialValues?.type || "full-time",
    location: initialValues?.location || "",
    salary: initialValues?.salary || { min: 0, max: 0, currency: "$" },
    requirements: initialValues?.requirements || [""],
    responsibilities: initialValues?.responsibilities || [""],
    isActive: initialValues?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const stickyFooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stickyFooterRef.current) stickyFooterRef.current.scrollIntoView({ block: "end" });
  }, [form.requirements.length, form.responsibilities.length]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.salary.min || !form.salary.max || form.salary.min > form.salary.max)
      errs.salary = "Salary range is invalid";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const handleTypeSelect = (value: string) => {
    setForm({ ...form, type: value });
    setTypeDropdownOpen(false);
  };

  const handleCurrencySelect = (currency: string) => {
    setForm((prev) => ({ ...prev, salary: { ...prev.salary, currency: currency } }));
    setCurrencyDropdownOpen(false);
  };

  const handleRemoveListItem = (field: "requirements" | "responsibilities", index: number) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
    setErrors((prev) => ({ ...prev, [`${field}.${index}`]: "" })); // Clear error for removed item
  };

  const handleAddListItem = (field: "requirements" | "responsibilities") => {
    setForm({ ...form, [field]: [...form[field], ""] });
    setErrors((prev) => ({ ...prev, [`${field}.${form[field].length}`]: "" })); // Clear error for new item
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-100/70 p-0 max-w-2xl mx-auto my-2 overflow-visible max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent flex flex-col"
      style={{ minWidth: 340 }}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-7 h-7 text-blue-700" />
          <span className="text-lg md:text-xl font-bold tracking-tight text-blue-900 font-archivo">
            Create Job Posting
          </span>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="rounded-full p-1 hover:bg-blue-100 transition"
          onClick={onClose || onCancel}
          tabIndex={0}
        >
          <XMarkIcon className="w-6 h-6 text-blue-700" />
        </button>
      </div>
      {/* Watermark logo */}
      <Image
        src="/weave-hsymbol-tri.svg"
        alt="Watermark"
        width={64}
        height={64}
        className="pointer-events-none select-none opacity-10 absolute bottom-1 right-1 z-0 w-16 h-16"
      />
      <div className="relative z-10 flex-1 px-6 py-4 flex flex-col gap-4">
        {/* Section: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 flex flex-col gap-2">
            <FloatingLabelInput
              label="Title *"
              name="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
              error={errors.title}
              helper="e.g. Senior Architect"
              maxLength={80}
              className=""
            />
            <div className="relative">
              <label className="block text-xs font-bold text-blue-900 mb-1 font-archivo flex items-center gap-1">
                <ClipboardDocumentListIcon className="w-4 h-4 text-blue-500" /> Type
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2 border-2 rounded-lg bg-white/80 shadow font-archivo text-base transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 border-blue-100 ${
                  typeDropdownOpen ? "ring-2 ring-blue-600 border-blue-600" : ""
                }`}
                onClick={() => setTypeDropdownOpen((open) => !open)}
                tabIndex={0}
              >
                <span className="flex items-center gap-2">
                  {JOB_TYPES.find((t) => t.value === form.type)?.icon}
                  {JOB_TYPES.find((t) => t.value === form.type)?.label}
                </span>
                <ChevronDownIcon className="w-5 h-5 text-blue-700" />
              </button>
              {typeDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border-2 border-blue-600 rounded-xl shadow-lg max-h-40 overflow-y-auto animate-fade-in">
                  {JOB_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition text-base flex items-center gap-2 ${
                        form.type === type.value ? "bg-blue-100 font-semibold" : ""
                      }`}
                      onClick={() => handleTypeSelect(type.value)}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <FloatingLabelInput
              label="Location *"
              name="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={loading}
              error={errors.location}
              helper="e.g. Makati City, PH"
              maxLength={80}
              className=""
            />
            <div className="relative">
              <label className="block text-xs font-bold text-blue-900 mb-1 font-archivo flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4 text-blue-500" /> Salary Range *
              </label>
              <div className="flex flex-row flex-wrap md:flex-nowrap items-stretch gap-2 bg-white/80 border-2 border-blue-100 rounded-lg px-2 py-2 shadow-md">
                {/* Currency Dropdown */}
                <div className="relative min-w-[4.5rem] flex-shrink-0">
                  <button
                    type="button"
                    className="flex items-center w-full px-3 py-2 border-2 border-blue-200 rounded-md bg-white text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    onClick={() => setCurrencyDropdownOpen((open) => !open)}
                    tabIndex={0}
                    style={{ minWidth: "4.5rem" }}
                  >
                    {form.salary.currency}
                    <ChevronDownIcon className="w-4 h-4 ml-1 text-blue-700" />
                  </button>
                  {currencyDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-20 bg-white border-2 border-blue-600 rounded-lg shadow-lg animate-fade-in">
                      {CURRENCIES.map((cur) => (
                        <button
                          type="button"
                          key={cur}
                          className={`w-full px-2 py-2 text-left hover:bg-blue-50 transition text-base ${
                            form.salary.currency === cur ? "bg-blue-100 font-semibold" : ""
                          }`}
                          onClick={() => handleCurrencySelect(cur)}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <FloatingLabelInput
                  name="salary.min"
                  type="number"
                  min={0}
                  value={String(form.salary.min)}
                  onChange={(e) => setForm({ ...form, salary: { ...form.salary, min: Number(e.target.value) } })}
                  disabled={loading}
                  placeholder="Min"
                  className="flex-1 min-w-[90px]"
                  label="Min"
                />
                <span className="text-blue-700 font-bold flex items-center">-</span>
                <FloatingLabelInput
                  name="salary.max"
                  type="number"
                  min={0}
                  value={String(form.salary.max)}
                  onChange={(e) => setForm({ ...form, salary: { ...form.salary, max: Number(e.target.value) } })}
                  disabled={loading}
                  placeholder="Max"
                  className="flex-1 min-w-[90px]"
                  label="Max"
                />
              </div>
              {errors.salary && <div className="text-xs text-red-600 font-archivo mt-1">{errors.salary}</div>}
            </div>
          </div>
        </div>
        {/* Section: Description */}
        <div className="mt-2">
          <FloatingLabelTextarea
            label="Description *"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={loading}
            error={errors.description}
            helper="Describe the role, expectations, and company culture..."
            rows={4}
            maxLength={600}
          />
        </div>
        {/* Section: Requirements & Responsibilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requirements as chips */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-blue-900 text-sm">Requirements</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {form.requirements.map(
                (req, idx) =>
                  req && (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold mr-1"
                    >
                      {req}
                      <button
                        type="button"
                        className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                        onClick={() => handleRemoveListItem("requirements", idx)}
                        disabled={loading || form.requirements.length === 1}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )
              )}
            </div>
            <div className="flex gap-1">
              <FloatingLabelInput
                label={`Add Requirement`}
                value={form.requirements[form.requirements.length - 1] || ""}
                onChange={(e) => {
                  const updated = [...form.requirements];
                  updated[form.requirements.length - 1] = e.target.value;
                  setForm({ ...form, requirements: updated });
                }}
                disabled={loading}
                error={errors[`requirements.${form.requirements.length - 1}`]}
                maxLength={100}
              />
              <GradientButton
                variant="outline"
                type="button"
                onClick={() => handleAddListItem("requirements")}
                disabled={loading || !form.requirements[form.requirements.length - 1]}
              >
                +
              </GradientButton>
            </div>
          </div>
          {/* Responsibilities as chips */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-blue-900 text-sm">Responsibilities</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {form.responsibilities.map(
                (resp, idx) =>
                  resp && (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold mr-1"
                    >
                      {resp}
                      <button
                        type="button"
                        className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                        onClick={() => handleRemoveListItem("responsibilities", idx)}
                        disabled={loading || form.responsibilities.length === 1}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )
              )}
            </div>
            <div className="flex gap-1">
              <FloatingLabelInput
                label={`Add Responsibility`}
                value={form.responsibilities[form.responsibilities.length - 1] || ""}
                onChange={(e) => {
                  const updated = [...form.responsibilities];
                  updated[form.responsibilities.length - 1] = e.target.value;
                  setForm({ ...form, responsibilities: updated });
                }}
                disabled={loading}
                error={errors[`responsibilities.${form.responsibilities.length - 1}`]}
                maxLength={100}
              />
              <GradientButton
                variant="outline"
                type="button"
                onClick={() => handleAddListItem("responsibilities")}
                disabled={loading || !form.responsibilities[form.responsibilities.length - 1]}
              >
                +
              </GradientButton>
            </div>
          </div>
        </div>
        {/* Section: Active toggle */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            disabled={loading}
            id="isActive"
            className="w-5 h-5 accent-blue-600 rounded focus:ring-2 focus:ring-blue-400"
          />
          <label htmlFor="isActive" className="text-base text-blue-900 font-bold font-archivo">
            Active
          </label>
        </div>
      </div>
      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
        {onCancel && (
          <GradientButton type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </GradientButton>
        )}
        <GradientButton type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job"}
        </GradientButton>
      </div>
    </form>
  );
}
