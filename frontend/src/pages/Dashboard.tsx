import { useEffect, useState } from "react";
import { StatTile } from "@/components/StatTile";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import { ResumeHistoryList } from "@/components/ResumeHistoryList";
import { StatTileSkeleton, ChartSkeleton, HistoryRowSkeleton } from "@/components/ui/Skeleton";
import { fetchDashboardStats } from "@/services/api";
import type { DashboardStats } from "@/types";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatTileSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <HistoryRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-rose-500">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          An overview of your resume analysis activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Uploads" value={stats.total_uploads} icon="📄" />
        <StatTile label="Average Score" value={Math.round(stats.average_score)} icon="📊" suffix="/100" />
        <StatTile label="Highest Score" value={Math.round(stats.highest_score)} icon="🏆" suffix="/100" />
        <StatTile label="Lowest Score" value={Math.round(stats.lowest_score)} icon="📉" suffix="/100" />
      </div>

      <ScoreTrendChart data={stats.score_trend} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Recent Analyses
        </h2>
        <ResumeHistoryList entries={stats.recent_analyses} />
      </div>
    </div>
  );
}
