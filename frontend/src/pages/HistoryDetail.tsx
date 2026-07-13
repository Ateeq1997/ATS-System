import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { KeywordsPanel } from "@/components/KeywordsPanel";
import { SkillsRadarChart } from "@/components/SkillsRadarChart";
import { SkillDistributionChart } from "@/components/SkillDistributionChart";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { CoverLetterPanel } from "@/components/CoverLetterPanel";
import { ResumeChatPanel } from "@/components/ResumeChatPanel";
import { PdfExportButton } from "@/components/PdfExportButton";
import { Skeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { fetchHistoryDetail } from "@/services/api";
import type { AnalyzeResponse } from "@/types";

export function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchHistoryDetail(id)
      .then(setResult)
      .catch(() => setError("Failed to load this analysis."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-rose-500">{error ?? "Analysis not found."}</p>
        <Link to="/history">
          <Button variant="secondary" className="mt-4">
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {result.filename}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Analyzed on {new Date(result.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PdfExportButton
            targetRef={resultsRef}
            fileName={`${result.filename.replace(/\.pdf$/i, "")}-report`}
          />
          <Link to="/history">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <div ref={resultsRef} className="space-y-6 bg-slate-50 dark:bg-slate-950 p-1">
        <div className="grid gap-6 lg:grid-cols-2">
          <ATSScoreCard score={result.ats_score} />
          <KeywordsPanel score={result.ats_score} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkillsRadarChart data={result.radar_data} />
          <SkillDistributionChart data={result.skill_distribution} />
        </div>
        <AIAnalysisPanel analysis={result.ai_analysis} />
      </div>

      {result.resume_text && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CoverLetterPanel
            resumeText={result.resume_text}
            jobDescription={result.job_description}
          />
          <ResumeChatPanel
            resumeText={result.resume_text}
            jobDescription={result.job_description}
          />
        </div>
      )}
    </div>
  );
}
