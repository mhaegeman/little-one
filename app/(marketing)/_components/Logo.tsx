import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "ink"
}: {
  className?: string;
  tone?: "ink" | "canvas";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        tone === "ink" ? "text-ink" : "text-canvas",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-md bg-mint-300 font-display text-lg font-semibold leading-none text-mint-ink shadow-soft"
      >
        ll
      </span>
      <span className="font-display text-xl font-semibold tracking-display">
        Lille Liv
      </span>
    </span>
  );
}
