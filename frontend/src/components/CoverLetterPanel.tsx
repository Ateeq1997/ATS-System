import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, Spinner } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { ApiError, generateCoverLetter } from "@/services/api";

interface CoverLetterPanelProps {
  resumeText: string;
  jobDescription: string;
}

export function CoverLetterPanel({ resumeText, jobDescription }: CoverLetterPanelProps) {
  const [companyName, setCompanyName] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [source, setSource] = useState<"gemini" | "heuristic" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateCoverLetter({
        resume_text: resumeText,
        job_description: jobDescription,
        company_name: companyName,
      });
      setLetter(res.cover_letter);
      setSource(res.source);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    showToast("Cover letter copied to clipboard.", "success");
  }

  return (
    <Card>
      <CardHeader
        title="Cover Letter Generator"
        subtitle="Generate a tailored cover letter from this resume and job description"
        action={
          source && (
            <Badge tone={source === "gemini" ? "brand" : "neutral"}>
              {source === "gemini" ? "Gemini AI" : "Heuristic"}
            </Badge>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name (optional)"
          className="input sm:max-w-xs"
        />
        <Button onClick={handleGenerate} loading={loading} className="sm:w-auto">
          {letter ? "Regenerate" : "Generate Cover Letter"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {loading && !letter && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Spinner size={16} /> Writing your cover letter…
        </div>
      )}

      {letter && (
        <div className="mt-4">
          <textarea
            readOnly
            value={letter}
            rows={12}
            className="input resize-none whitespace-pre-wrap font-serif text-sm leading-relaxed"
          />
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              Copy to Clipboard
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
