import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  variant?: "ghost" | "subtle" | "primary" | "lift";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

const variants = {
  ghost: "bg-transparent text-muted hover:bg-sunken hover:text-ink",
  subtle: "bg-sunken text-ink hover:bg-mint-50",
  primary: "bg-mint-300 text-mint-ink shadow-soft hover:bg-mint-200",
  lift: "bg-surface text-ink ring-1 ring-border shadow-soft hover:shadow-lift hover:bg-mint-50"
};

const sizes = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-lg",
  lg: "h-11 w-11 rounded-pill"
};

export function IconButton({
  className,
  variant = "ghost",
  size = "md",
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring grid place-items-center transition-all duration-150 ease-nordic disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
