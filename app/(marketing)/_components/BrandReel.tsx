"use client";

import {
  CheckCircle,
  Heart,
  House,
  Leaf,
  MapPin,
  Sun
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

// Scene durations roughly match the brand-reel handoff:
// scenes/index-landscape.html — 2.0s / 2.5s / 2.5s / 2.5s / 2.0s / 2.0s.
// We trim them slightly for a tighter web loop.
const SCENE_DURATIONS = [2200, 2800, 2700, 2700, 2400, 2400] as const;
const SCENE_COUNT = SCENE_DURATIONS.length;

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

export function BrandReel() {
  const t = useTranslations("marketing.reel");
  const [scene, setScene] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    const id = window.setTimeout(
      () => setScene((prev) => (prev + 1) % SCENE_COUNT),
      SCENE_DURATIONS[scene]
    );
    return () => window.clearTimeout(id);
  }, [scene, visible, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={t("ariaLabel")}
    >
      <div className="relative mx-auto h-[640px] w-[320px] rounded-[48px] bg-ink p-2.5 shadow-[0_30px_60px_rgba(31,28,22,0.18),0_6px_12px_rgba(31,28,22,0.08)]">
        <div
          aria-hidden="true"
          className="reel-stage relative h-full w-full overflow-hidden rounded-[40px] bg-canvas"
        >
          <div className="absolute left-1/2 top-2.5 z-30 h-6 w-24 -translate-x-1/2 rounded-pill bg-ink" />
          <div className="absolute left-0 right-0 top-3.5 z-20 flex items-center justify-between px-7 text-[10px] font-semibold tracking-tight text-ink">
            <span>{scene === 3 ? "9:48" : scene === 5 ? "9:51" : "9:24"}</span>
            <span className="flex items-center gap-1">
              <span className="block h-1 w-1 rounded-full bg-ink" />
              <span className="block h-1 w-1 rounded-full bg-ink" />
              <span className="block h-1 w-1 rounded-full bg-ink" />
            </span>
          </div>

          <div
            key={scene}
            data-anim="scene"
            className="absolute inset-0 pt-9"
          >
            {scene === 0 ? <SceneGreeting /> : null}
            {scene === 1 ? <SceneDiscover /> : null}
            {scene === 2 ? <SceneVenue /> : null}
            {scene === 3 ? <SceneCapture /> : null}
            {scene === 4 ? <SceneTimeline /> : null}
            {scene === 5 ? <SceneReaction /> : null}
          </div>
        </div>
      </div>

      <ProgressDots active={scene} total={SCENE_COUNT} />
    </div>
  );
}

function ProgressDots({ active, total }: { active: number; total: number }) {
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex items-center justify-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-pill transition-all duration-300 ease-nordic",
            i === active ? "w-5 bg-ink" : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}

// ─── Scene 1 — opening greeting ──────────────────────────────────────────
function SceneGreeting() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute -left-10 top-24 h-40 w-40 rounded-full bg-mint-100 opacity-70 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-12 bottom-24 h-44 w-44 rounded-full bg-peach-100 opacity-70 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex h-full flex-col items-center px-6">
        <div
          data-anim="rise"
          style={{ animationDelay: "120ms" }}
          className="mt-32 inline-flex items-center gap-2.5"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint-300 font-display text-2xl font-medium leading-none text-mint-ink shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]">
            ll
          </div>
          <div className="font-display text-2xl font-medium leading-none tracking-display text-ink">
            Lille Liv
          </div>
        </div>

        <div
          data-anim="rise"
          style={{ animationDelay: "520ms" }}
          className="mt-auto mb-16 w-full text-left"
        >
          <Eyebrow>{t("scene1Eyebrow")}</Eyebrow>
          <div className="mt-2 font-display text-[34px] font-medium leading-[1.05] tracking-display text-ink">
            <div>{t("scene1Greeting")}</div>
            <div
              data-anim="rise"
              style={{ animationDelay: "780ms" }}
              className="italic text-peach-300"
            >
              {t("scene1Name")}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 2 — Discover feed ─────────────────────────────────────────────
function SceneDiscover() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full px-4 pb-4">
      <div data-anim="rise" className="px-1 pt-1">
        <Eyebrow>{t("scene2Eyebrow")}</Eyebrow>
        <div className="mt-1 font-display text-2xl font-medium leading-tight tracking-display text-ink">
          {t("scene2Title")}
        </div>
      </div>

      <div
        data-anim="rise"
        style={{ animationDelay: "160ms" }}
        className="relative mt-3 overflow-hidden rounded-lg bg-peach-50 p-3.5 ring-1 ring-peach-100"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-peach-ink/85">
          {t("scene2WeatherWhen")}
        </div>
        <div className="mt-1 font-display text-3xl font-medium leading-none tracking-display text-peach-ink">
          14°
        </div>
        <div className="mt-1.5 max-w-[180px] text-[11px] leading-snug text-peach-ink/80">
          {t("scene2WeatherDesc")}
        </div>
        <div
          data-anim="pulse"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-butter-200 text-butter-ink shadow-[0_0_0_6px_rgba(240,199,106,0.22)]"
        >
          <Sun size={18} weight="fill" />
        </div>
      </div>

      <div
        data-anim="rise"
        style={{ animationDelay: "320ms" }}
        className="mt-2.5"
      >
        <VenueRow
          tone="mint"
          icon={<Leaf size={20} weight="fill" />}
          title={t("scene2Venue1Title")}
          sub={t("scene2Venue1Sub")}
          pills={[
            { label: t("scene2Venue1Pill1"), tone: "mint" },
            { label: t("scene2Venue1Pill2"), tone: "sky" }
          ]}
          highlighted
        />
      </div>
      <div
        data-anim="rise"
        style={{ animationDelay: "440ms" }}
        className="mt-2"
      >
        <VenueRow
          tone="butter"
          icon={<House size={20} weight="fill" />}
          title={t("scene2Venue2Title")}
          sub={t("scene2Venue2Sub")}
          pills={[{ label: t("scene2Venue2Pill1"), tone: "butter" }]}
        />
      </div>
      <div
        data-anim="rise"
        style={{ animationDelay: "560ms" }}
        className="mt-2"
      >
        <VenueRow
          tone="sky"
          icon={<MapPin size={20} weight="fill" />}
          title={t("scene2Venue3Title")}
          sub={t("scene2Venue3Sub")}
          pills={[
            { label: t("scene2Venue3Pill1"), tone: "sky" },
            { label: t("scene2Venue3Pill2"), tone: "mint" }
          ]}
        />
      </div>
    </div>
  );
}

type VenueTone = "mint" | "butter" | "sky";

const venueTints: Record<VenueTone, string> = {
  mint: "bg-mint-100 text-mint-ink",
  butter: "bg-butter-100 text-butter-ink",
  sky: "bg-sky-100 text-sky-ink"
};

function VenueRow({
  tone,
  icon,
  title,
  sub,
  pills,
  highlighted
}: {
  tone: VenueTone;
  icon: React.ReactNode;
  title: string;
  sub: string;
  pills: { label: string; tone: "mint" | "peach" | "butter" | "sky" }[];
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-surface p-2.5 ring-1 ring-hairline">
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-md",
          venueTints[tone]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold tracking-tight text-ink">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-subtle">{sub}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {pills.map((p) => (
            <Pill key={p.label} tone={p.tone} size="sm">
              {p.label}
            </Pill>
          ))}
        </div>
      </div>
      <Heart
        size={14}
        weight={highlighted ? "fill" : "regular"}
        className={cn(
          "mt-1 shrink-0",
          highlighted ? "text-peach-300" : "text-subtle"
        )}
      />
    </div>
  );
}

// ─── Scene 3 — Venue detail ──────────────────────────────────────────────
function SceneVenue() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full">
      <div
        data-anim="rise-lg"
        className="relative mx-3 mt-1 h-[230px] overflow-hidden rounded-lg bg-mint-100 text-mint-ink ring-1 ring-mint-200"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 18px)"
          }}
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <span className="block h-1.5 w-1.5 rounded-full bg-mint-300" />
          {t("scene3OpenNow")}
        </div>
        <Leaf
          size={56}
          weight="fill"
          className="absolute bottom-6 right-6 text-mint-300/70"
        />
      </div>

      <div className="px-4">
        <div
          data-anim="rise"
          style={{ animationDelay: "200ms" }}
          className="mt-4 font-display text-[26px] font-medium leading-tight tracking-display text-ink"
        >
          {t("scene3Title")}
        </div>
        <div
          data-anim="rise"
          style={{ animationDelay: "320ms" }}
          className="mt-2 text-xs leading-relaxed text-muted"
        >
          {t("scene3Meta")}
        </div>
        <div
          data-anim="rise"
          style={{ animationDelay: "420ms" }}
          className="mt-3 flex flex-wrap gap-1.5"
        >
          <Pill tone="mint" size="sm">
            {t("scene3Pill1")}
          </Pill>
          <Pill tone="sky" size="sm">
            {t("scene3Pill2")}
          </Pill>
          <Pill tone="butter" size="sm">
            {t("scene3Pill3")}
          </Pill>
        </div>
      </div>

      <div
        data-anim="pop"
        style={{ animationDelay: "780ms" }}
        className="absolute bottom-6 right-4"
      >
        <div
          data-anim="pulse"
          className="inline-flex items-center gap-2 rounded-pill bg-peach-300 px-4 py-2.5 text-xs font-bold text-peach-ink shadow-[0_2px_0_rgba(0,0,0,0.08),0_10px_24px_rgba(122,58,30,0.22)]"
        >
          <Heart size={14} weight="fill" />
          {t("scene3Save")}
        </div>
      </div>
    </div>
  );
}

// ─── Scene 4 — Journal capture ───────────────────────────────────────────
function SceneCapture() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full px-4">
      <div data-anim="rise" className="flex items-center justify-between">
        <Pill tone="peach" size="sm">
          {t("scene4Badge")}
        </Pill>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">
          {t("scene4Privacy")}
        </div>
      </div>

      <div
        data-anim="rise-lg"
        style={{ animationDelay: "160ms" }}
        className="relative mt-3 h-[190px] overflow-hidden rounded-lg bg-peach-50 text-peach-300 ring-1 ring-peach-100"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 18px)"
          }}
        />
        <Leaf
          size={62}
          weight="fill"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-peach-300/70"
        />
      </div>

      <div
        data-anim="rise"
        style={{ animationDelay: "360ms" }}
        className="-mt-5 rounded-lg bg-peach-50 p-3.5 ring-1 ring-peach-100"
      >
        <Eyebrow tone="peach">{t("scene4When")}</Eyebrow>
        <div className="mt-1.5 font-display text-xl font-medium leading-tight tracking-display text-peach-ink">
          {t("scene4Title")}
        </div>
        <div className="mt-2 text-[11px] text-peach-ink/75">
          {t("scene4Who")}
        </div>
      </div>

      <div
        data-anim="pop"
        style={{ animationDelay: "1100ms" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="inline-flex items-center gap-1.5 rounded-pill bg-mint-50 px-3.5 py-2 text-xs font-bold text-mint-ink ring-1 ring-mint-100">
          <CheckCircle size={14} weight="fill" className="text-mint-300" />
          {t("scene4Saved")}
        </div>
      </div>
    </div>
  );
}

// ─── Scene 5 — Timeline ──────────────────────────────────────────────────
function SceneTimeline() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full px-4">
      <div data-anim="rise">
        <Eyebrow>{t("scene5Eyebrow")}</Eyebrow>
        <div className="mt-1 font-display text-2xl font-medium leading-tight tracking-display text-ink">
          {t("scene5Title")}
        </div>
      </div>

      <div className="relative mt-4">
        <div
          data-anim="draw"
          style={{ animationDelay: "200ms" }}
          className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-hairline"
          aria-hidden="true"
        />

        <Moment
          when={t("scene5Moment1When")}
          title={t("scene5Moment1Title")}
          delay={320}
        />
        <Moment
          when={t("scene5Moment2When")}
          title={t("scene5Moment2Title")}
          delay={420}
        />
        <Moment
          when={t("scene5Moment3When")}
          title={t("scene5Moment3Title")}
          delay={520}
        />
        <Moment
          when={t("scene5MomentNewWhen")}
          title={t("scene5MomentNewTitle")}
          delay={720}
          highlighted
          newBadge={t("scene5MomentNewBadge")}
        />
      </div>
    </div>
  );
}

function Moment({
  when,
  title,
  delay,
  highlighted,
  newBadge
}: {
  when: string;
  title: string;
  delay: number;
  highlighted?: boolean;
  newBadge?: string;
}) {
  return (
    <div
      data-anim="slide-in"
      style={{ animationDelay: `${delay}ms` }}
      className="relative mb-2 flex items-start gap-3 pl-0"
    >
      <div className="relative mt-2 ml-1.5 h-2.5 w-2.5 shrink-0">
        <span
          data-anim={highlighted ? "node-pulse" : undefined}
          className={cn(
            "absolute inset-0 rounded-full bg-surface",
            highlighted
              ? "shadow-[0_0_0_3px_var(--color-peach),0_0_0_6px_var(--bg-canvas)]"
              : "shadow-[0_0_0_2px_var(--color-mint),0_0_0_4px_var(--bg-canvas)]"
          )}
        />
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 rounded-md px-3 py-2 ring-1",
          highlighted
            ? "bg-peach-50 ring-peach-100"
            : "bg-surface ring-hairline"
        )}
      >
        {newBadge ? (
          <span className="mb-1 inline-block rounded-pill bg-peach-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-canvas">
            {newBadge}
          </span>
        ) : null}
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.12em]",
            highlighted ? "text-peach-ink/70" : "text-subtle"
          )}
        >
          {when}
        </div>
        <div
          className={cn(
            "mt-0.5 font-display text-sm font-medium leading-tight tracking-display",
            highlighted ? "text-peach-ink" : "text-ink"
          )}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

// ─── Scene 6 — Grandma reaction ──────────────────────────────────────────
function SceneReaction() {
  const t = useTranslations("marketing.reel");
  return (
    <div className="relative h-full w-full px-3">
      <div
        data-anim="drop"
        className="flex items-center gap-3 rounded-lg bg-surface p-3 shadow-[0_18px_36px_rgba(31,28,22,0.15)] ring-1 ring-hairline"
      >
        <Avatar tone="peach" size="md">
          M
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-subtle">
            {t("scene6NotifLabel")}
          </div>
          <div className="mt-0.5 font-display text-sm font-medium leading-tight tracking-display text-ink">
            {t("scene6NotifMessage")}
          </div>
        </div>
      </div>

      <div
        data-anim="rise"
        style={{ animationDelay: "260ms" }}
        className="mt-4 rounded-lg bg-peach-50 p-3.5 ring-1 ring-peach-100"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-peach-ink/85">
          {t("scene6EchoWhen")}
        </div>
        <div className="mt-1.5 font-display text-lg font-medium leading-tight tracking-display text-peach-ink">
          {t("scene6EchoTitle")}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            data-anim="pop"
            style={{ animationDelay: "560ms" }}
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-[11px] font-bold text-peach-ink ring-1 ring-peach-100"
          >
            <Heart size={12} weight="fill" className="text-peach-300" />
            {t("scene6ReactionMormor")}
          </span>
          <span
            data-anim="pop"
            style={{ animationDelay: "720ms" }}
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface/70 px-2.5 py-1 text-[11px] font-bold text-peach-ink/60 ring-1 ring-peach-100"
          >
            {t("scene6ReactionFar")}
          </span>
        </div>
      </div>

      <div
        data-anim="rise"
        style={{ animationDelay: "880ms" }}
        className="mt-4 flex items-center gap-2.5"
      >
        <Avatar tone="mint" size="md">
          F
        </Avatar>
        <div>
          <div className="font-display text-base font-medium tracking-display text-ink">
            {t("scene6FamilyName")}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">
            {t("scene6FamilyMembers")}
          </div>
        </div>
      </div>
    </div>
  );
}
