import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors"
    >
      <span
        className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white dark:bg-slate-950 shadow-md transition-transform ${
          isDark ? "translate-x-8" : "translate-x-1"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
