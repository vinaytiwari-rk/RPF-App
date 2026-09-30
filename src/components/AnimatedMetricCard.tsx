import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles } from "lucide-react";

interface AnimatedNumberProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: boolean;
}

/**
 * High-performance smooth counter animation that runs when scrolled into view
 */
export function AnimatedNumber({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
  className = "",
  separator = true
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (!inView) return;
    const numericTarget = Number(end) || 0;
    if (numericTarget <= 0) {
      setCount(0);
      return;
    }

    const start = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(numericTarget * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(numericTarget);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, inView]);

  const formatted = separator ? count.toLocaleString("en-IN") : count.toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

interface AnimatedMetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "saffron" | "green" | "navy" | "gold" | "rose";
  subLabel?: string;
  delay?: number;
  onClick?: () => void;
}

/**
 * Stylized animated metric card designed for Citizen, Volunteer, and User profile dashboards
 */
export function AnimatedMetricCard({
  label,
  value,
  suffix = "+",
  prefix = "",
  icon: Icon = Sparkles,
  tone = "saffron",
  subLabel,
  delay = 0,
  onClick
}: AnimatedMetricCardProps) {
  const toneClasses = {
    saffron: {
      bg: "bg-orange-50/70 border-orange-200/80 hover:border-orange-300",
      iconBg: "bg-orange-100 text-[#C2410C]",
      numColor: "text-[#243B32]",
      dot: "bg-[#C2410C]"
    },
    green: {
      bg: "bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-300",
      iconBg: "bg-emerald-100 text-[#166534]",
      numColor: "text-[#243B32]",
      dot: "bg-[#166534]"
    },
    navy: {
      bg: "bg-blue-50/70 border-blue-200/80 hover:border-blue-300",
      iconBg: "bg-slate-100 text-[#243B32]",
      numColor: "text-[#243B32]",
      dot: "bg-[#0A192F]"
    },
    gold: {
      bg: "bg-amber-50/70 border-amber-200/80 hover:border-amber-300",
      iconBg: "bg-amber-100 text-[#B45309]",
      numColor: "text-[#243B32]",
      dot: "bg-[#D97706]"
    },
    rose: {
      bg: "bg-rose-50/70 border-rose-200/80 hover:border-rose-300",
      iconBg: "bg-rose-100 text-rose-700",
      numColor: "text-[#243B32]",
      dot: "bg-rose-600"
    }
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`rounded-2xl border p-3.5 shadow-2xs transition-all ${toneClasses.bg} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneClasses.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${toneClasses.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${toneClasses.dot}`} />
        </span>
      </div>

      <div className="space-y-0.5">
        <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${toneClasses.numColor}`}>
          <AnimatedNumber end={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-[11px] font-medium leading-snug text-slate-600 break-words">
          {label}
        </p>
        {subLabel && (
          <p className="text-[9.5px] font-semibold text-slate-500 truncate">
            {subLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
