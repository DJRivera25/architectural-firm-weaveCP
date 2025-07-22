import React from "react";
import { BriefcaseIcon, ClockIcon, DocumentTextIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export const JOB_TYPES: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "full-time",
    label: "Full Time",
    icon: <BriefcaseIcon className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "part-time",
    label: "Part Time",
    icon: <ClockIcon className="w-5 h-5" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "contract",
    label: "Contract",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "internship",
    label: "Internship",
    icon: <AcademicCapIcon className="w-5 h-5" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
];
