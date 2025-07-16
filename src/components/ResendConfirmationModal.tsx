import React, { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ResendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResend: (email: string) => Promise<void>;
  loading: boolean;
  message: string;
  error: string;
  showToast?: (msg: string, type: "success" | "error") => void;
}

const ResendConfirmationModal: React.FC<ResendConfirmationModalProps> = ({
  isOpen,
  onClose,
  onResend,
  loading,
  message,
  error,
  showToast,
}) => {
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (showToast) {
      if (message) showToast(message, "success");
      if (error) showToast(error, "error");
    }
  }, [message, error, showToast]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: Event) => {
      const event = e as unknown as KeyboardEvent;
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onResend(email);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm transition-opacity animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resend-modal-title"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-slideUp flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="w-14 h-14 mb-3 flex items-center justify-center rounded-full bg-blue-100">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>
        </div>
        <h3 id="resend-modal-title" className="text-xl font-bold mb-2 text-gray-900 text-center">
          Resend Confirmation Email
        </h3>
        <p className="text-gray-600 mb-4 text-center text-sm">
          Enter your email address and we&apos;ll send you a new confirmation link.
        </p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="resend-email-input">
              Email
            </label>
            <input
              id="resend-email-input"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              ref={inputRef}
              autoFocus
            />
          </div>
          {/* Keep inline feedback for accessibility, but prioritize toasts */}
          {error && (
            <div className="text-red-600 text-sm text-center" aria-live="polite">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-600 text-sm text-center" aria-live="polite">
              {message}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? "Resending..." : "Resend Email"}
          </button>
        </form>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        .animate-slideUp {
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ResendConfirmationModal;
