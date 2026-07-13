import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScoreTrendPoint } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ScoreTrendChart({ data }: { data: ScoreTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="ATS Score Trend" subtitle="Overall score across your recent uploads" />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Analyze a resume to start tracking trends.
        </p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date) }));

  return (
    <Card>
      <CardHeader
        title="ATS Score Trend"
        subtitle="Overall score across your recent uploads"
      />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="label"
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
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 24px -8px rgba(0,0,0,0.25)",
              }}
              formatter={(value: number) => [`${value}`, "Score"]}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.filename ?? label
              }
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--series-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--series-1)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
