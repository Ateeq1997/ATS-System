import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MultiResumeUpload, type ComparisonSlot } from "@/components/MultiResumeUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ComparisonBarChart } from "@/components/ComparisonBarChart";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { KeywordsPanel } from "@/components/KeywordsPanel";
import { SkillsRadarChart } from "@/components/SkillsRadarChart";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { Button } from "@/components/ui/Button";
import { ApiError, compareResumes } from "@/services/api";
import type { CompareResponse } from "@/types";

const MAX_RESUMES = 4;

export function Compare() {
  const [slots, setSlots] = useState<ComparisonSlot[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const readySlots = slots.filter((s) => s.status === "ready" && s.resumeText);
  const canCompare = readySlots.length >= 2 && !comparing;

  async function handleCompare() {
    if (!canCompare) return;
    setComparing(true);
    setError(null);
    setComparison(null);
    try {
      const res = await compareResumes({
        resumes: readySlots.map((s) => ({
          resume_text: s.resumeText!,
          filename: s.filename,
        })),
        job_description: jobDescription,
      });
      setComparison(res);
      setSelectedId(res.ranking[0] ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to compare resumes.");
    } finally {
      setComparing(false);
    }
  }

  const selectedResult = useMemo(
    () => comparison?.results.find((r) => r.id === selectedId) ?? null,
    [comparison, selectedId]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Compare Resumes
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Upload up to {MAX_RESUMES} resumes and see which one matches a job
          description best, ranked side by side.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MultiResumeUpload slots={slots} onSlotsChange={setSlots} maxFiles={MAX_RESUMES} />
        <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button onClick={handleCompare} loading={comparing} disabled={!canCompare}>
          Compare Resumes
        </Button>
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {readySlots.length < 2 && !error && (
          <p className="text-xs text-slate-400">
            Add at least 2 resumes to compare ({readySlots.length}/{MAX_RESUMES} ready).
          </p>
        )}
      </div>

      {comparison && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ComparisonBarChart results={comparison.results} />
            <ComparisonTable
              results={comparison.results}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {selectedResult && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Full breakdown — {selectedResult.filename}
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <ATSScoreCard score={selectedResult.ats_score} />
                <KeywordsPanel score={selectedResult.ats_score} />
              </div>
              <SkillsRadarChart data={selectedResult.radar_data} />
              <AIAnalysisPanel analysis={selectedResult.ai_analysis} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
