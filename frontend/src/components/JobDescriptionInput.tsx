interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div>
      <label htmlFor="job-description" className="label mb-1.5 block">
        Job Description (optional, for tailored matching)
      </label>
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Paste the target job description here to compare it against your resume and reveal missing keywords…"
        className="input resize-none"
      />
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        {value.length} characters
      </p>
    </div>
  );
}
