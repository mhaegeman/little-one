"use client";

import { ArrowRight, LockKey, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

type LockedPreviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  redirectTo: string;
};

export function LockedPreview({
  eyebrow,
  title,
  description,
  bullets,
  cta,
  redirectTo
}: LockedPreviewProps) {
  const href = `/auth?next=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-card bg-surface p-6 ring-1 ring-hairline">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mint-50 text-mint-ink ring-1 ring-mint-50">
            <LockKey size={18} weight="fill" aria-hidden="true" />
          </span>
          <p className="mt-4 text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>
          <ul className="mt-4 space-y-1.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-ink/85">
                <Sparkle
                  size={13}
                  weight="fill"
                  className="mt-1 shrink-0 text-peach-300"
                  aria-hidden="true"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="focus-ring mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-mint-300 px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-150 ease-nordic hover:bg-mint-ink active:bg-mint-ink"
          >
            {cta}
            <ArrowRight size={15} weight="bold" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
