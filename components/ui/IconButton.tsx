import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  variant?: "ghost" | "subtle" | "primary";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

const variants = {
  ghost: "bg-transparent text-muted hover:bg-sunken hover:text-ink",
  subtle: "bg-sunken text-ink hover:bg-sand-200",
  primary: "bg-sage-500 text-white hover:bg-sage-600"
};

const sizes = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-lg",
  lg: "h-10 w-10 rounded-xl"
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
        "focus-ring grid place-items-center transition-colors duration-150 ease-nordic disabled:cursor-not-allowed disabled:opacity-50",
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
