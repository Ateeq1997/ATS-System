import { useCallback, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Button";

interface ResumeUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  fileName?: string | null;
  error?: string | null;
}

export function ResumeUpload({
  onFileSelected,
  isLoading,
  fileName,
  error,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
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
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-brand-400"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isLoading ? (
          <>
            <Spinner size={32} />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Extracting text from your resume…
            </p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-2xl">
              📄
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {fileName ? `Selected: ${fileName}` : "Drag & drop your resume PDF here"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                or click to browse · PDF only · max 8MB
              </p>
            </div>
          </>
        )}
      </motion.div>
      {error && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
