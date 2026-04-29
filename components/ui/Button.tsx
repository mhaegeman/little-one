import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sm",
  secondary:
    "bg-surface text-ink ring-1 ring-border hover:bg-sunken hover:ring-sage-300",
  ghost: "bg-transparent text-ink hover:bg-sunken",
  subtle: "bg-sunken text-ink hover:bg-sand-200",
  danger: "bg-danger text-white hover:bg-warm-600 active:bg-warm-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-11 px-4 text-sm gap-2 rounded-xl"
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
        "focus-ring inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-nordic disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
