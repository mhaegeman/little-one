import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AvatarTone = "mint" | "peach" | "butter" | "sky" | "neutral";
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const toneClasses: Record<AvatarTone, string> = {
  mint: "bg-mint-100 text-mint-ink",
  peach: "bg-peach-100 text-peach-ink",
  butter: "bg-butter-100 text-butter-ink",
  sky: "bg-sky-100 text-sky-ink",
  neutral: "bg-sunken text-ink"
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-2xs",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl"
};

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  initials?: string;
  tone?: AvatarTone;
  size?: AvatarSize;
  src?: string;
  alt?: string;
  ring?: boolean;
  children?: ReactNode;
};

export function Avatar({
  initials,
  tone = "mint",
  size = "md",
  src,
  alt,
  ring = false,
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-pill font-display font-semibold leading-none",
        toneClasses[tone],
        sizeClasses[size],
        ring && "ring-2 ring-canvas",
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {!src && (children ?? initials)}
    </div>
  );
}

type AvatarStackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function AvatarStack({
  children,
  className,
  ...props
}: AvatarStackProps) {
  return (
    <div className={cn("flex items-center -space-x-2", className)} {...props}>
      {children}
    </div>
  );
}
