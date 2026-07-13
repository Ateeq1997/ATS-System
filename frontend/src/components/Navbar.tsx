import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { to: "/", label: "Analyze" },
  { to: "/compare", label: "Compare" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
            R
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            Resume<span className="text-brand-600">AI</span>
          </span>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-slate-200 dark:border-slate-800 px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-300"
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
