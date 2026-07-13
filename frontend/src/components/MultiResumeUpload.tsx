import { useCallback, useRef, useState, type DragEvent, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Button";
import { ApiError, uploadResume } from "@/services/api";

export interface ComparisonSlot {
  id: string;
  file: File;
  filename: string;
  status: "uploading" | "ready" | "error";
  resumeText?: string;
  error?: string;
}

interface MultiResumeUploadProps {
  slots: ComparisonSlot[];
  onSlotsChange: Dispatch<SetStateAction<ComparisonSlot[]>>;
  maxFiles?: number;
}

export function MultiResumeUpload({
  slots,
  onSlotsChange,
  maxFiles = 4,
}: MultiResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = maxFiles - slots.length;
      if (remaining <= 0) return;

      const pdfFiles = Array.from(files)
        .filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"))
        .slice(0, remaining);

      const newSlots: ComparisonSlot[] = pdfFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        filename: file.name,
        status: "uploading",
      }));

      onSlotsChange([...slots, ...newSlots]);

      newSlots.forEach((slot) => {
        uploadResume(slot.file)
          .then((res) => {
            onSlotsChange((prevRef: ComparisonSlot[]) =>
              prevRef.map((s) =>
                s.id === slot.id ? { ...s, status: "ready", resumeText: res.resume_text } : s
              )
            );
          })
          .catch((err) => {
            onSlotsChange((prevRef: ComparisonSlot[]) =>
              prevRef.map((s) =>
                s.id === slot.id
                  ? {
                      ...s,
                      status: "error",
                      error: err instanceof ApiError ? err.message : "Upload failed.",
                    }
                  : s
              )
            );
          });
      });
    },
    [slots, onSlotsChange, maxFiles]
  );

  function removeSlot(id: string) {
    onSlotsChange(slots.filter((s) => s.id !== id));
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canAddMore = slots.length < maxFiles;

  return (
    <div className="space-y-3">
      {canAddMore && (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.005 }}
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-slate-300 dark:border-slate-700 hover:border-brand-400"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="text-2xl">📄</div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Add resume PDFs to compare
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {slots.length}/{maxFiles} added · drag & drop or click to browse
          </p>
        </motion.div>
      )}

      {slots.length > 0 && (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                {slot.status === "uploading" && <Spinner size={14} />}
                {slot.status === "ready" && <span className="text-[#0ca30c]">✓</span>}
                {slot.status === "error" && <span className="text-[#d03b3b]">✕</span>}
                <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                  {slot.filename}
                </span>
                {slot.status === "error" && (
                  <span className="text-xs text-rose-500">{slot.error}</span>
                )}
              </div>
              <button
                onClick={() => removeSlot(slot.id)}
                className="ml-2 shrink-0 text-slate-400 hover:text-rose-500"
                aria-label={`Remove ${slot.filename}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
