import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, actions, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 text-left", className)}>
      <p className="section-heading">{eyebrow}</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{description}</p> : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
