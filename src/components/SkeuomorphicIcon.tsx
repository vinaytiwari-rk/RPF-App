import type { ComponentType, SVGProps } from "react";

export type SkeuomorphicIconProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: "saffron" | "gold" | "green" | "sky" | "purple" | "rose" | "navy" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  label?: string;
};

/**
 * RPF's shared tactile icon surface. The icon itself remains an accessible
 * SVG; the surrounding material treatment supplies depth, highlight and
 * pressed-state affordance consistently across Android/iOS/web.
 */
export default function SkeuomorphicIcon({ icon: Icon, tone = "navy", size = "md", label }: SkeuomorphicIconProps) {
  const sizeClass = size === "sm" ? "skeuo-size-sm" : size === "lg" ? "skeuo-size-lg" : "skeuo-size-md";
  return (
    <span className={`skeuo-icon-surface skeuo-${tone} ${sizeClass}`} aria-label={label} role={label ? "img" : undefined}>
      <Icon className="skeuo-icon" aria-hidden={label ? undefined : true} />
    </span>
  );
}
