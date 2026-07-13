import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SkillCategoryDistribution } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

const CATEGORY_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

export function SkillDistributionChart({
  data,
}: {
  data: SkillCategoryDistribution[];
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Skill Distribution"
          subtitle="Detected skills grouped by category"
        />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No categorized skills detected yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Skill Distribution"
        subtitle="Detected skills grouped by category"
      />
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid
              horizontal={false}
              stroke="var(--chart-grid)"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
              axisLine={{ stroke: "var(--chart-grid)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={140}
              tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
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
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
