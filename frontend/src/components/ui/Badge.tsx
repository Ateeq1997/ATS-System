import type { ReactNode } from "react";
import clsx from "clsx";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "brand";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-[#0ca30c]/10 text-[#0ca30c] dark:bg-[#0ca30c]/15",
  warning: "bg-[#fab219]/15 text-[#946a00] dark:bg-[#fab219]/15 dark:text-[#fab219]",
  danger: "bg-[#d03b3b]/10 text-[#d03b3b] dark:bg-[#d03b3b]/15",
  neutral:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  brand:
    "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function scoreTone(score: number): BadgeTone {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}
