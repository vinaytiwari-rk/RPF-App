import React from "react";

type BrandLoaderProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export default function BrandLoader({
  size = "md",
  label = "Loading",
  className = "",
}: BrandLoaderProps) {
  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <span className={`inline-flex ${sizes[size]} items-center justify-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-slate-100`}>
        <img
          src="/assets/logo.png"
          alt="RP Foundation"
          className="h-full w-full animate-spin object-contain"
          style={{ animationDuration: "2.8s" }}
        />
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
