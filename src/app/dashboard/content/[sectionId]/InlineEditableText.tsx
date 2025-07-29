"use client";
import React, { useState, useRef, useEffect } from "react";

interface InlineEditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  textarea?: boolean;
  placeholder?: string;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onChange,
  className = "",
  textarea = false,
  placeholder,
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  function handleSave() {
    if (tempValue !== value) {
      onChange(tempValue);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!textarea && e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(value);
      setEditing(false);
    }
  }

  return editing ? (
    textarea ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={className}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={className}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    )
  ) : (
    <span
      className={className + " cursor-pointer group inline-flex items-center"}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true);
      }}
      role="button"
      aria-label="Edit text"
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
      <svg
        className="ml-1 w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2.828 2.828 0 00-4-4L3 17z" />
      </svg>
    </span>
  );
};

export default InlineEditableText;
