import clsx from "clsx";
import type { AnalyzeResponse } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, scoreTone } from "@/components/ui/Badge";

interface ComparisonTableProps {
  results: AnalyzeResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ComparisonTable({
  results,
  selectedId,
  onSelect,
}: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader title="Ranking" subtitle="Click a row to view the full breakdown" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="py-2 pr-3">Rank</th>
              <th className="py-2 pr-3">Resume</th>
              <th className="py-2 pr-3">Score</th>
              <th className="py-2 pr-3">Match</th>
              <th className="py-2 pr-3">Matched Skills</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              // Dense rank by score so ties share a rank instead of implying
              // one tied resume is worse than the other.
              const rank =
                1 +
                results.filter((other) => other.ats_score.overall_score > r.ats_score.overall_score)
                  .length;
              const isSelected = r.id === selectedId;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={clsx(
                    "cursor-pointer border-b border-slate-100 dark:border-slate-800/60 transition-colors",
                    isSelected
                      ? "bg-brand-50 dark:bg-brand-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <td className="py-2.5 pr-3 font-semibold text-slate-500">
                    {rank === 1 ? "🏆 1" : `#${rank}`}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-slate-800 dark:text-slate-100">
                    {r.filename}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge tone={scoreTone(r.ats_score.overall_score)}>
                      {Math.round(r.ats_score.overall_score)}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                    {Math.round(r.ats_score.match_percentage)}%
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                    {r.ats_score.matched_skills.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
