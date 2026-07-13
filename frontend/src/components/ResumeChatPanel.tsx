import { useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, Spinner } from "@/components/ui/Button";
import { ApiError, sendChatMessage } from "@/services/api";
import type { ChatMessage } from "@/types";

interface ResumeChatPanelProps {
  resumeText: string;
  jobDescription: string;
}

const SUGGESTED_QUESTIONS = [
  "What are my biggest weaknesses for this role?",
  "How can I improve my bullet points?",
  "What skills should I add?",
];

export function ResumeChatPanel({ resumeText, jobDescription }: ResumeChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<"gemini" | "heuristic" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await sendChatMessage({
        resume_text: resumeText,
        job_description: jobDescription,
        messages: nextMessages,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      setLastSource(res.source);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to get a reply.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <Card>
      <CardHeader
        title="Ask About Your Resume"
        subtitle="Chat with an AI coach about this analysis"
        action={
          lastSource && (
            <Badge tone={lastSource === "gemini" ? "brand" : "neutral"}>
              {lastSource === "gemini" ? "Gemini AI" : "Heuristic"}
            </Badge>
          )
        }
      />

      <div
        ref={scrollRef}
        className="mb-3 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3"
      >
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Ask a question, or try one of these:
            </p>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={clsx(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
              )}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2">
              <Spinner size={16} />
            </div>
          </div>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your resume…"
          className="input"
        />
        <Button type="submit" loading={loading} disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </Card>
  );
}
