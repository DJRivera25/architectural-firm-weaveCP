import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  children: React.ReactNode;
}

export function Select({ error, label, className = "", children, ...props }: SelectProps) {
  const baseClasses =
    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className={classes} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
