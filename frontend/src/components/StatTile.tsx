import { motion } from "framer-motion";

export function StatTile({
  label,
  value,
  icon,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card flex items-center gap-4 p-5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15 text-2xl">
        {icon}
      </div>
      <div>
        <p className="label">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
          {suffix && (
            <span className="ml-1 text-base font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
