import { type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  icon,
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-secondary"
      : "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";

  return (
    <button
      className={clsx(base, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children}
    </button>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-current"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
