import { useEffect, useMemo, useState } from "react";
import { ResumeHistoryList } from "@/components/ResumeHistoryList";
import { HistoryRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { deleteHistoryItem, fetchHistory } from "@/services/api";
import type { ResumeHistoryEntry } from "@/types";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  highest: "Highest score",
  lowest: "Lowest score",
};

export function History() {
  const [entries, setEntries] = useState<ResumeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetchHistory()
      .then(setEntries)
      .catch(() => setError("Failed to load resume history."))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: string) {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteHistoryItem(id);
      showToast("Analysis deleted.", "success");
    } catch {
      setEntries(previous);
      showToast("Failed to delete — please try again.", "error");
    }
  }

  const visibleEntries = useMemo(() => {
    const filtered = search.trim()
      ? entries.filter((e) =>
          e.filename.toLowerCase().includes(search.trim().toLowerCase())
        )
      : entries;

    const sorted = [...filtered];
    switch (sort) {
      case "oldest":
        sorted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "highest":
        sorted.sort((a, b) => b.overall_score - a.overall_score);
        break;
      case "lowest":
        sorted.sort((a, b) => a.overall_score - b.overall_score);
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    return sorted;
  }, [entries, search, sort]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Resume History
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All previously analyzed resumes, stored locally as JSON.
        </p>
      </div>

      {!loading && entries.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename…"
            className="input sm:max-w-xs"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="input sm:max-w-[180px]"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <HistoryRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-500">{error}</p>
      ) : (
        <>
          {search.trim() && (
            <p className="text-xs text-slate-400">
              {visibleEntries.length} of {entries.length} matching "{search.trim()}"
            </p>
          )}
          <ResumeHistoryList entries={visibleEntries} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
}
