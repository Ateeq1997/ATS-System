import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  strokeWidth?: number;
}

function colorForScore(score: number): string {
  if (score >= 80) return "var(--status-good)";
  if (score >= 55) return "var(--status-warning)";
  return "var(--status-critical)";
}

export function ScoreGauge({
  score,
  size = 160,
  label = "ATS Score",
  strokeWidth = 12,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorForScore(clamped);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-[5.5rem] flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {Math.round(clamped)}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
      </div>
      <span className="label mt-2">{label}</span>
    </div>
  );
}
