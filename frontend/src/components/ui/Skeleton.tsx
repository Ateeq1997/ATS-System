import type { CSSProperties } from "react";
import clsx from "clsx";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800",
        className
      )}
      style={style}
    />
  );
}

export function StatTileSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-5">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  );
}

export function HistoryRowSkeleton() {
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 288 }: { height?: number }) {
  return (
    <div className="card p-6">
      <Skeleton className="mb-1.5 h-4 w-32" />
      <Skeleton className="mb-4 h-3 w-56" />
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}
