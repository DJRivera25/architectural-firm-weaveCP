import React from "react";

type AvatarProps = {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-base" : size === "lg" ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg";
  return src ? (
    <img src={src} alt={alt} className={`rounded-full object-cover bg-gray-200 ${sizeClass}`} draggable={false} />
  ) : (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 uppercase ${sizeClass}`}
    >
      {alt
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}
