import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface p-8 text-center ring-1 ring-hairline",
        className
      )}
    >
      {icon ? (
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-sunken text-peach-300">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
