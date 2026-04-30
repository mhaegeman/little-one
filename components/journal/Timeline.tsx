"use client";

import {
  Baby,
  Camera,
  House,
  MapPin,
  Plus,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import {
  ReactionPicker,
  reactionEmoji
} from "@/components/journal/ReactionPicker";
import { initialsFromName } from "@/lib/reactions";
import type { Reaction, ReactionKind, TimelineItem, TimelineItemType } from "@/lib/types";
import { cn, formatLocalizedDate } from "@/lib/utils";

const icons: Record<TimelineItemType, typeof Baby> = {
  milestone: Sparkle,
  activity: MapPin,
  aula: House
};

const nodeStyle: Record<TimelineItemType, string> = {
  milestone: "bg-peach-100 text-peach-ink",
  activity: "bg-mint-100 text-mint-ink",
  aula: "bg-sky-100 text-sky-ink"
};

const pillTone: Record<TimelineItemType, "peach" | "mint" | "sky"> = {
  milestone: "peach",
  activity: "mint",
  aula: "sky"
};

function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const LONG_PRESS_MS = 380;

type TimelineProps = {
  items: TimelineItem[];
  currentUserId?: string | null;
  onToggleReaction?: (item: TimelineItem, kind: ReactionKind) => void;
};

export function Timeline({ items, currentUserId, onToggleReaction }: TimelineProps) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const [pickerForId, setPickerForId] = useState<string | null>(null);

  function monthLabel(iso: string) {
    return formatLocalizedDate(iso, locale, "MMMM yyyy");
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Baby size={22} weight="duotone" aria-hidden="true" />}
        title={t("empty")}
        description={t("emptyHint")}
      />
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by month (preserving order)
  const groups: { key: string; label: string; items: TimelineItem[] }[] = [];
  for (const item of sorted) {
    const key = monthKey(item.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: monthLabel(item.date), items: [item] });
    }
  }

  function kindLabel(item: TimelineItem) {
    if (item.type === "milestone") return t("milestone");
    if (item.type === "activity") return t("activity");
    return item.badge ?? t("aulaBadgeNursery");
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} id={`month-${group.key}`} className="scroll-mt-20">
          <div className="sticky top-14 z-[1] -mx-4 mb-3 flex items-center gap-2 bg-canvas/95 px-4 py-1.5 backdrop-blur lg:top-0 lg:mx-0 lg:px-0">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-2xs font-semibold text-subtle">
              {t("entryCount", { count: group.items.length })}
            </span>
          </div>

          <ol className="relative space-y-3 pl-0">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-[23px] top-3 w-[2px] rounded-full bg-hairline"
            />
            {group.items.map((item) => {
              const Icon = icons[item.type];
              const reactable = item.type !== "aula" && Boolean(onToggleReaction);
              return (
                <li key={item.id} className="relative flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={`relative z-[1] grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-[0_0_0_4px_rgb(251_246_238)] ${nodeStyle[item.type]}`}
                  >
                    <Icon size={20} weight="duotone" aria-hidden="true" />
                  </span>
                  <TimelineEntry
                    item={item}
                    kindLabel={kindLabel(item)}
                    locale={locale}
                    pillTone={pillTone[item.type]}
                    reactable={reactable}
                    pickerOpen={pickerForId === item.id}
                    onOpenPicker={() => setPickerForId(item.id)}
                    onClosePicker={() => setPickerForId(null)}
                    currentUserId={currentUserId}
                    onSelectReaction={(kind) => {
                      onToggleReaction?.(item, kind);
                      setPickerForId(null);
                    }}
                    t={t}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

type TimelineEntryProps = {
  item: TimelineItem;
  kindLabel: string;
  locale: string;
  pillTone: "peach" | "mint" | "sky";
  reactable: boolean;
  pickerOpen: boolean;
  currentUserId?: string | null;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelectReaction: (kind: ReactionKind) => void;
  t: ReturnType<typeof useTranslations<"journal">>;
};

function TimelineEntry({
  item,
  kindLabel,
  locale,
  pillTone: tone,
  reactable,
  pickerOpen,
  currentUserId,
  onOpenPicker,
  onClosePicker,
  onSelectReaction,
  t
}: TimelineEntryProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  function clearTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!reactable) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    longPressFired.current = false;
    clearTimer();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onOpenPicker();
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    clearTimer();
  }

  function handleContextMenu(event: ReactPointerEvent<HTMLElement>) {
    if (!reactable) return;
    event.preventDefault();
    onOpenPicker();
  }

  const reactions = item.reactions ?? [];
  const grouped = groupReactions(reactions);
  const myReactionKinds = currentUserId
    ? new Set(
        reactions
          .filter((reaction) => reaction.userId === currentUserId)
          .map((reaction) => reaction.kind)
      )
    : new Set<ReactionKind>();

  return (
    <article
      className={cn(
        "relative min-w-0 flex-1 rounded-card bg-surface p-4 shadow-soft ring-1 ring-hairline",
        reactable && "select-none"
      )}
      onPointerDown={reactable ? handlePointerDown : undefined}
      onPointerUp={reactable ? handlePointerUp : undefined}
      onPointerLeave={reactable ? handlePointerUp : undefined}
      onPointerCancel={reactable ? handlePointerUp : undefined}
      onContextMenu={reactable ? handleContextMenu : undefined}
    >
      {reactable ? (
        <ReactionPicker
          open={pickerOpen}
          active={Array.from(myReactionKinds)}
          onSelect={onSelectReaction}
          onClose={onClosePicker}
        />
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <Pill tone={tone} size="sm">
          {kindLabel}
        </Pill>
        <p className="text-2xs font-semibold text-subtle">
          {formatLocalizedDate(item.date, locale)}
        </p>
      </div>
      <h4 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">
        {item.title}
      </h4>
      {item.description ? (
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {item.description}
        </p>
      ) : null}
      {item.photos?.length ? (
        <div
          className={`mt-3 grid gap-1.5 ${
            item.photos.length === 1
              ? "grid-cols-1"
              : item.photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {item.photos.slice(0, 3).map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo}
              src={photo}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-hairline"
            />
          ))}
        </div>
      ) : null}
      {item.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 6).map((tag) => (
            <Pill key={tag} tone="sunken" size="sm">
              {tag}
            </Pill>
          ))}
        </div>
      ) : null}
      {!item.photos?.length && !item.description ? (
        <span className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-subtle">
          <Camera size={11} weight="fill" aria-hidden="true" />
          {t("noPhoto")}
        </span>
      ) : null}

      {reactable ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {grouped.map(({ kind, reactions: list }) => {
            const mine = list.some(
              (reaction) => reaction.userId === currentUserId
            );
            const reactorInitials = list
              .slice(0, 3)
              .map((reaction) => initialsFromName(reaction.displayName));
            return (
              <button
                key={kind}
                type="button"
                onClick={() => onSelectReaction(kind)}
                aria-pressed={mine}
                aria-label={t("reactions.kindCount", {
                  kind: t(`reactions.kind.${kind}`),
                  count: list.length
                })}
                className={cn(
                  "focus-ring inline-flex h-7 items-center gap-1 rounded-pill px-2 text-2xs font-semibold ring-1 transition-colors",
                  mine
                    ? "bg-peach-50 text-peach-ink ring-peach-100"
                    : "bg-sunken text-muted ring-hairline hover:bg-canvas hover:text-ink"
                )}
              >
                <span aria-hidden="true" className="text-[13px] leading-none">
                  {reactionEmoji[kind]}
                </span>
                <span>{list.length}</span>
                {reactorInitials.length > 0 ? (
                  <span className="ml-0.5 inline-flex items-center -space-x-1.5">
                    {reactorInitials.map((initials, idx) => (
                      <span
                        key={`${kind}-${idx}`}
                        aria-hidden="true"
                        className="grid h-4 w-4 place-items-center rounded-full bg-canvas text-[8px] font-bold uppercase text-muted ring-1 ring-hairline"
                      >
                        {initials}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onOpenPicker}
            aria-label={t("reactions.add")}
            className="focus-ring inline-flex h-7 items-center gap-1 rounded-pill bg-canvas px-2 text-2xs font-semibold text-subtle ring-1 ring-hairline hover:text-ink"
          >
            <Plus size={11} weight="bold" aria-hidden="true" />
            <span>{t("reactions.add")}</span>
          </button>
        </div>
      ) : null}
    </article>
  );
}

function groupReactions(reactions: Reaction[]): {
  kind: ReactionKind;
  reactions: Reaction[];
}[] {
  const order: ReactionKind[] = ["heart", "clap", "smile", "star"];
  const buckets = new Map<ReactionKind, Reaction[]>();
  for (const reaction of reactions) {
    const list = buckets.get(reaction.kind) ?? [];
    list.push(reaction);
    buckets.set(reaction.kind, list);
  }
  return order
    .filter((kind) => buckets.has(kind))
    .map((kind) => ({ kind, reactions: buckets.get(kind) ?? [] }));
}
