import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animate?: boolean;
}

export function Card({ children, className, animate = true, ...rest }: CardProps) {
  const content = (
    <div className={clsx("card p-6", className)} {...rest}>
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={clsx("card p-6", className)}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
