import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ResumeHistoryEntry } from "@/types";
import { Badge, scoreTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ResumeHistoryList({
  entries,
  onDelete,
}: {
  entries: ResumeHistoryEntry[];
  onDelete?: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-3xl">🗂️</p>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          No resume analyses yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Upload and analyze a resume to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.03 }}
          className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {entry.filename}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {new Date(entry.created_at).toLocaleString()} ·{" "}
              {entry.matched_skills_count} matched · {entry.missing_skills_count} missing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={scoreTone(entry.overall_score)}>
              Score {Math.round(entry.overall_score)}
            </Badge>
            <Link to={`/history/${entry.id}`}>
              <Button variant="secondary" className="px-3 py-1.5 text-xs">
                View
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                className="px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={() => onDelete(entry.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
