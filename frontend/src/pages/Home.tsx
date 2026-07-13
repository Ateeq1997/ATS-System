import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { KeywordsPanel } from "@/components/KeywordsPanel";
import { SkillsRadarChart } from "@/components/SkillsRadarChart";
import { SkillDistributionChart } from "@/components/SkillDistributionChart";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { CoverLetterPanel } from "@/components/CoverLetterPanel";
import { ResumeChatPanel } from "@/components/ResumeChatPanel";
import { PdfExportButton } from "@/components/PdfExportButton";
import { Button } from "@/components/ui/Button";
import { ApiError, analyzeResume, uploadResume } from "@/services/api";
import type { AnalyzeResponse } from "@/types";

export function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleFileSelected(file: File) {
    setUploadError(null);
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadResume(file);
      setFileName(res.filename);
      setResumeText(res.resume_text);
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Failed to extract text from PDF."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const res = await analyzeResume({
        resume_text: resumeText,
        job_description: jobDescription,
        filename: fileName ?? "resume.pdf",
      });
      setResult(res);
    } catch (err) {
      setAnalyzeError(
        err instanceof ApiError ? err.message : "Failed to analyze resume."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          AI Resume Analyzer &amp; ATS Scoring
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Upload your resume, paste a job description, and get an instant ATS
          score with AI-powered strengths, gaps, and rewrite suggestions.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResumeUpload
          onFileSelected={handleFileSelected}
          isLoading={uploading}
          fileName={fileName}
          error={uploadError}
        />
        <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={handleAnalyze}
          loading={analyzing}
          disabled={!resumeText.trim()}
          className="w-full max-w-xs sm:w-auto"
        >
          Analyze Resume
        </Button>
        {analyzeError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{analyzeError}</p>
        )}
        {!resumeText && !uploadError && (
          <p className="text-xs text-slate-400">Upload a PDF resume to get started.</p>
        )}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <PdfExportButton
              targetRef={resultsRef}
              fileName={`${result.filename.replace(/\.pdf$/i, "")}-report`}
            />
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
          <div className="grid gap-6 lg:grid-cols-2">
            <CoverLetterPanel resumeText={resumeText} jobDescription={jobDescription} />
            <ResumeChatPanel resumeText={resumeText} jobDescription={jobDescription} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
