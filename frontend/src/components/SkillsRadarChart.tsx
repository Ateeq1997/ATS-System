import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { RadarDatum } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

export function SkillsRadarChart({ data }: { data: RadarDatum[] }) {
  const hasJobData = data.some((d) => d.job_score > 0);

  return (
    <Card>
      <CardHeader
        title="Skills Radar"
        subtitle="Category coverage: your resume vs. the job description"
      />
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid className="stroke-slate-200 dark:stroke-slate-800" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-slate-500 dark:text-slate-400"
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="text-slate-400"
            />
            <Radar
              name="Resume"
              dataKey="resume_score"
              stroke="var(--series-1)"
              fill="var(--series-1)"
              fillOpacity={0.35}
            />
            {hasJobData && (
              <Radar
                name="Job Description"
                dataKey="job_score"
                stroke="var(--series-2)"
                fill="var(--series-2)"
                fillOpacity={0.25}
              />
            )}
            <Legend />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 24px -8px rgba(0,0,0,0.25)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
