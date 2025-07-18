import React from "react";

export default function LoadingSkeleton({ height = 40, width = "100%", className = "" }) {
  return <div className={`animate-pulse bg-blue-100/60 rounded-xl ${className}`} style={{ height, width }} />;
}
