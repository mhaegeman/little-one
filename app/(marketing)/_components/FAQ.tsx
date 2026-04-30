"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FaqItem = {
  q: string;
  a: string;
};

export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-hairline rounded-2xl bg-surface ring-1 ring-hairline">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="focus-ring flex w-full items-start justify-between gap-6 px-6 py-5 text-left"
            >
              <span className="font-display text-xl font-medium tracking-display text-ink">
                {item.q}
              </span>
              <CaretDown
                size={18}
                weight="bold"
                aria-hidden="true"
                className={cn(
                  "mt-2 shrink-0 text-muted transition-transform duration-200 ease-nordic",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid overflow-hidden transition-all duration-200 ease-nordic",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 text-base leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
