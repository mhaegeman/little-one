"use client";

import {
  ArrowLeft,
  ChatsCircle,
  PaperPlaneTilt,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import {
  loadMessages,
  loadThreadsForUser,
  markThreadRead,
  sendMessage,
  type DirectMessage,
  type DirectThread
} from "@/lib/services/messaging";
import {
  loadPublicProfileForFamily,
  type FamilyPublicProfile
} from "@/lib/services/visibility";
import { createClient } from "@/lib/db/supabase/client";
import type { Family } from "@/lib/types";
import { cn, formatLocalizedDate } from "@/lib/utils";

type Props = {
  me: { userId: string; email: string | null };
  primaryFamily: Family;
};

function formatTime(iso: string, locale: string) {
  const d = new Date(iso);
  const tag = locale === "en" ? "en-GB" : "da-DK";
  return d.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function MessagesPanel({ me, primaryFamily }: Props) {
  const t = useTranslations("families.messages");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [profileByFamily, setProfileByFamily] = useState<Map<string, FamilyPublicProfile>>(new Map());
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads + counterparty profiles.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await loadThreadsForUser(supabase!, me.userId);
        if (cancelled) return;
        setThreads(list);
        const otherFamilyIds = Array.from(
          new Set(
            list.map((thread) =>
              thread.familyAId === primaryFamily.id ? thread.familyBId : thread.familyAId
            )
          )
        );
        const map = new Map<string, FamilyPublicProfile>();
        await Promise.all(
          otherFamilyIds.map(async (id) => {
            const profile = await loadPublicProfileForFamily(supabase!, id).catch(() => null);
            if (profile) map.set(id, profile);
          })
        );
        if (!cancelled) setProfileByFamily(map);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t("errorTitle"),
            description: error instanceof Error ? error.message : tCommon("unknownError"),
            variant: "danger"
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, me.userId, primaryFamily.id]);

  // Activate the first thread on first load (desktop only — mobile keeps list view).
  useEffect(() => {
    if (!activeThreadId && threads.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

  // Load messages for the active thread.
  useEffect(() => {
    if (!supabase || !activeThreadId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const list = await loadMessages(supabase!, activeThreadId!);
        if (!cancelled) setMessages(list);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t("errorTitle"),
            description: error instanceof Error ? error.message : tCommon("unknownError"),
            variant: "danger"
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, activeThreadId, toast]);

  // Mark thread read on open.
  useEffect(() => {
    if (!supabase || !activeThreadId) return;
    markThreadRead(supabase, activeThreadId).catch(() => {
      /* non-critical */
    });
  }, [supabase, activeThreadId]);

  // Realtime subscription for new messages on the active thread.
  useEffect(() => {
    if (!supabase || !activeThreadId) return;
    const channel = supabase
      .channel(`thread-${activeThreadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `thread_id=eq.${activeThreadId}`
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const message: DirectMessage = {
            id: row.id as string,
            threadId: row.thread_id as string,
            senderUserId: row.sender_user_id as string,
            body: row.body as string,
            createdAt: row.created_at as string,
            editedAt: (row.edited_at as string | null) ?? null,
            deletedAt: (row.deleted_at as string | null) ?? null
          };
          setMessages((current) => {
            if (current.some((existing) => existing.id === message.id)) return current;
            return [...current, message];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeThreadId]);

  // Auto-scroll to the bottom on new message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, activeThreadId]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );
  const counterpartyFamilyId = activeThread
    ? activeThread.familyAId === primaryFamily.id
      ? activeThread.familyBId
      : activeThread.familyAId
    : null;
  const counterpartyProfile = counterpartyFamilyId
    ? profileByFamily.get(counterpartyFamilyId)
    : null;

  async function handleSend() {
    const body = draft.trim();
    if (!body || !supabase || !activeThreadId) return;
    setSending(true);
    try {
      const message = await sendMessage(supabase, {
        threadId: activeThreadId,
        senderUserId: me.userId,
        body
      });
      setMessages((current) =>
        current.some((existing) => existing.id === message.id) ? current : [...current, message]
      );
      setDraft("");
    } catch (error) {
      toast({
        title: t("sendError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<ChatsCircle size={20} weight="duotone" aria-hidden="true" />}
        title={t("emptyTitle")}
        description={t("emptyBody")}
      />
    );
  }

  const showList = !activeThreadId;
  const showThread = Boolean(activeThreadId);

  return (
    <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
      {/* Threads list */}
      <aside
        aria-label={t("threadsLabel")}
        className={cn(
          "rounded-card bg-surface p-1.5 ring-1 ring-hairline",
          showList ? "block" : "hidden lg:block"
        )}
      >
        <ul className="space-y-1">
          {threads.map((thread) => {
            const otherFamilyId =
              thread.familyAId === primaryFamily.id ? thread.familyBId : thread.familyAId;
            const profile = profileByFamily.get(otherFamilyId);
            const active = thread.id === activeThreadId;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={cn(
                    "focus-ring flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                    active ? "bg-sage-100 text-sage-700" : "text-ink hover:bg-sunken"
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sunken text-sage-700">
                    <UsersThree size={16} weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold">
                      {profile?.familyName ?? t("fallbackName")}
                    </span>
                    <span className="block truncate text-2xs text-muted">
                      {profile?.neighbourhoods?.[0] ?? "—"}
                    </span>
                  </span>
                  {thread.lastMessageAt ? (
                    <span className="shrink-0 text-2xs font-semibold text-subtle">
                      {formatTime(thread.lastMessageAt, locale)}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Thread detail */}
      <section
        aria-label={t("threadLabel")}
        className={cn(
          "flex min-h-[60vh] flex-col rounded-card bg-surface ring-1 ring-hairline",
          showThread ? "flex" : "hidden lg:flex"
        )}
      >
        {!activeThreadId ? (
          <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted">
            {t("selectThread")}
          </div>
        ) : (
          <>
            <header className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                aria-label={t("back")}
                className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink lg:hidden"
              >
                <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-sunken text-sage-700 ring-1 ring-hairline">
                <UsersThree size={16} weight="duotone" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-ink">
                  {counterpartyProfile?.familyName ?? "Familie"}
                </p>
                <p className="truncate text-2xs text-muted">
                  {counterpartyProfile?.neighbourhoods?.[0] ?? "—"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-3 thin-scroll">
              {messages.length === 0 ? (
                <p className="grid h-full place-items-center text-sm text-muted">
                  {t("noMessages")}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {messages.map((message, index) => {
                    const mine = message.senderUserId === me.userId;
                    const previous = messages[index - 1];
                    const showDay =
                      !previous || !isSameDay(previous.createdAt, message.createdAt);
                    return (
                      <li key={message.id}>
                        {showDay ? (
                          <div className="my-2 text-center text-2xs font-semibold uppercase tracking-wide text-subtle">
                            {formatLocalizedDate(
                              message.createdAt,
                              locale,
                              locale === "en"
                                ? "EEEE d MMM yyyy"
                                : "EEEE d. MMM yyyy"
                            )}
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            "flex",
                            mine ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm leading-snug",
                              mine
                                ? "rounded-br-md bg-mint-300 text-mint-ink"
                                : "rounded-bl-md bg-sunken text-ink ring-1 ring-hairline"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.body}</p>
                            <p
                              className={cn(
                                "mt-0.5 text-2xs font-semibold",
                                mine ? "text-mint-ink/70" : "text-subtle"
                              )}
                            >
                              {formatTime(message.createdAt, locale)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-hairline p-2">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t("placeholder")}
                  rows={2}
                  className="resize-none"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={!draft.trim() || sending}
                  aria-label={t("sendLabel")}
                >
                  <PaperPlaneTilt size={14} weight="fill" aria-hidden="true" />
                </Button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
