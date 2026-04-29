import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "aside";
  padding?: "none" | "sm" | "md" | "lg";
  elevation?: "flat" | "soft" | "lift";
  children: ReactNode;
};

const padMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5"
};

const elevMap = {
  flat: "ring-1 ring-hairline",
  soft: "shadow-soft ring-1 ring-hairline",
  lift: "shadow-lift ring-1 ring-hairline"
};

export function Card({
  as: Tag = "div",
  padding = "md",
  elevation = "soft",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card bg-surface",
        padMap[padding],
        elevMap[elevation],
        className
      )}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
