"use client";

import { Plus, X } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  max?: number;
  className?: string;
};

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Tilføj tag…",
  max = 8,
  className
}: Props) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function remove(tag: string) {
    onChange(value.filter((entry) => entry !== tag));
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      if (draft.trim()) {
        event.preventDefault();
        commit(draft);
      }
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const remainingSuggestions = suggestions
    .filter((suggestion) => !value.includes(suggestion))
    .slice(0, 6);

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1 rounded-lg bg-surface p-1.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-mint-300"
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-pill bg-mint-50 px-2 py-0.5 text-2xs font-semibold text-mint-ink ring-1 ring-mint-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Fjern ${tag}`}
              className="focus-ring grid h-4 w-4 place-items-center rounded-full hover:bg-mint-100"
            >
              <X size={9} weight="bold" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-subtle"
          aria-label="Tilføj tag"
          disabled={value.length >= max}
        />
      </div>
      {remainingSuggestions.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-2xs font-semibold uppercase tracking-wide text-subtle">
            Foreslået
          </span>
          {remainingSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => commit(suggestion)}
              className={cn(
                "focus-ring inline-flex items-center gap-0.5 rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted ring-1 ring-hairline transition-colors hover:bg-canvas hover:text-ink",
                value.length >= max && "cursor-not-allowed opacity-50"
              )}
              disabled={value.length >= max}
            >
              <Plus size={9} weight="bold" aria-hidden="true" />
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
