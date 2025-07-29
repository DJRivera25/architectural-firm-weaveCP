"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  presets?: ("7d" | "30d" | "90d" | "custom")[];
  className?: string;
}

const presets = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
  presets: enabledPresets = ["7d", "30d", "custom"],
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let newStartDate: Date;

    switch (preset) {
      case "7d":
        newStartDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        newStartDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        newStartDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    onRangeChange(newStartDate, today);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (tempStartDate <= tempEndDate) {
      onRangeChange(tempStartDate, tempEndDate);
      setIsOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCurrentPreset = () => {
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 7) return "7d";
    if (diffDays === 30) return "30d";
    if (diffDays === 90) return "90d";
    return "custom";
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[300px]">
          <div className="p-4">
            {/* Presets */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h3>
              <div className="grid grid-cols-2 gap-2">
                {enabledPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      getCurrentPreset() === preset
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {presets[preset]}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tempStartDate.toISOString().split("T")[0]}
                    onChange={(e) => setTempStartDate(new Date(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tempEndDate.toISOString().split("T")[0]}
                    onChange={(e) => setTempEndDate(new Date(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {tempStartDate > tempEndDate && (
                <p className="text-xs text-red-500 mt-1">Start date must be before end date</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCustomApply}
                  disabled={tempStartDate > tempEndDate}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
