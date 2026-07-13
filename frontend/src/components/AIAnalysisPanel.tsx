import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { AIAnalysis } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type TabKey = "strengths" | "weaknesses" | "suggestions" | "rewrite_suggestions";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "strengths", label: "Strengths", icon: "💪" },
  { key: "weaknesses", label: "Weaknesses", icon: "⚠️" },
  { key: "suggestions", label: "Suggestions", icon: "💡" },
  { key: "rewrite_suggestions", label: "Rewrite Tips", icon: "✍️" },
];

export function AIAnalysisPanel({ analysis }: { analysis: AIAnalysis }) {
  const [activeTab, setActiveTab] = useState<TabKey>("strengths");
  const items = analysis[activeTab];

  return (
    <Card>
      <CardHeader
        title="AI Analysis"
        subtitle={analysis.summary}
        action={
          <Badge tone={analysis.source === "gemini" ? "brand" : "neutral"}>
            {analysis.source === "gemini" ? "Gemini AI" : "Heuristic"}
          </Badge>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
              activeTab === tab.key
                ? "bg-white dark:bg-slate-950 text-brand-700 dark:text-brand-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          {items.length === 0 && (
            <li className="text-sm text-slate-400 dark:text-slate-500">
              Nothing to show here.
            </li>
          )}
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-700 dark:text-slate-200"
            >
              <span className="mt-0.5 text-brand-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </Card>
  );
}
