import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { AnalyzeResponse } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

const CATEGORY_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
];

export function ComparisonBarChart({ results }: { results: AnalyzeResponse[] }) {
  const data = results.map((r) => ({
    filename: r.filename.length > 18 ? `${r.filename.slice(0, 16)}…` : r.filename,
    score: r.ats_score.overall_score,
  }));

  return (
    <Card>
      <CardHeader
        title="Overall Score Comparison"
        subtitle="ATS score for each resume against the shared job description"
      />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="filename"
              tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
              axisLine={{ stroke: "var(--chart-grid)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
              axisLine={{ stroke: "var(--chart-grid)" }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.1)" }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 24px -8px rgba(0,0,0,0.25)",
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {data.map((entry, index) => (
                <Cell key={entry.filename} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
              <LabelList dataKey="score" position="top" style={{ fill: "var(--chart-axis)", fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
