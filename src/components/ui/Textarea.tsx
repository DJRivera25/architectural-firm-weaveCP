import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export function Textarea({ error, label, className = "", ...props }: TextareaProps) {
  const baseClasses =
    "block w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm bg-white placeholder-gray-400 font-archivo text-base transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-blue-50";
  const errorClasses = error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div>
      {label && <label className="block text-base font-semibold text-blue-900 mb-1 font-archivo">{label}</label>}
      <textarea className={classes} {...props} />
      {error && <p className="mt-1 text-sm text-red-600 font-archivo">{error}</p>}
    </div>
  );
}
