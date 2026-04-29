import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "soft"
  | "subtle"
  | "danger";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-mint-300 text-mint-ink shadow-soft hover:bg-mint-200 active:bg-mint-300 active:shadow-lift",
  accent:
    "bg-peach-300 text-peach-ink shadow-soft hover:bg-peach-200 active:bg-peach-300 active:shadow-lift",
  secondary:
    "bg-surface text-ink ring-1 ring-border hover:bg-sunken hover:ring-mint-200",
  ghost: "bg-transparent text-ink hover:bg-sunken",
  soft: "bg-sunken text-ink hover:bg-mint-50",
  subtle: "bg-sunken text-ink hover:bg-sand-200",
  danger: "bg-danger text-white hover:bg-warm-600 active:bg-warm-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-2 rounded-pill",
  md: "h-11 px-5 text-sm gap-2 rounded-pill",
  lg: "h-12 px-6 text-base gap-2.5 rounded-pill",
  xl: "h-16 px-7 text-base gap-3 rounded-pill"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex items-center justify-center font-semibold tracking-[-0.005em] transition-all duration-150 ease-nordic disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
