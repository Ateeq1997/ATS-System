import type { ATSScoreResult } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function ATSScoreCard({ score }: { score: ATSScoreResult }) {
  return (
    <Card>
      <CardHeader
        title="ATS Score"
        subtitle="How well your resume performs against automated screening"
      />
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreGauge score={score.overall_score} />
        <div className="w-full space-y-4">
          <ProgressBar label="Job Match" value={score.match_percentage} />
          <ProgressBar label="Keyword Coverage" value={score.keyword_score} />
          <ProgressBar label="Formatting" value={score.formatting_score} />
        </div>
      </div>
    </Card>
  );
}
