import { motion } from "framer-motion";

export function ProgressBar({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    clamped >= 80
      ? "var(--status-good)"
      : clamped >= 55
      ? "var(--status-warning)"
      : "var(--status-critical)";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-white">
          {Math.round(clamped)}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
