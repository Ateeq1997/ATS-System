import type { ATSScoreResult } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function ChipList({
  items,
  tone,
  emptyLabel,
}: {
  items: string[];
  tone: "success" | "danger";
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">{emptyLabel}</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} tone={tone}>
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function KeywordsPanel({ score }: { score: ATSScoreResult }) {
  const missingSkillsSet = new Set(score.missing_skills.map((s) => s.toLowerCase()));
  const otherMissingKeywords = score.missing_keywords.filter(
    (k) => !missingSkillsSet.has(k.toLowerCase())
  );

  return (
    <Card>
      <CardHeader
        title="Keyword & Skills Analysis"
        subtitle="Matched vs. missing terms compared to the job description"
      />
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            ✓ Matched Skills ({score.matched_skills.length})
          </h4>
          <ChipList
            items={score.matched_skills}
            tone="success"
            emptyLabel="No known skills detected yet."
          />
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
            ✕ Missing Skills ({score.missing_skills.length})
          </h4>
          <ChipList
            items={score.missing_skills}
            tone="danger"
            emptyLabel="No gaps detected — nice work!"
          />
        </div>
        {otherMissingKeywords.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Other Missing Keywords
            </h4>
            <ChipList
              items={otherMissingKeywords}
              tone="danger"
              emptyLabel="None"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
