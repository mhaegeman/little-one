"use client";

import {
  CircleNotch,
  ImageSquare,
  LinkSimple,
  Trash,
  UploadSimple
} from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

type Signature = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
};

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number;
  className?: string;
  label?: string;
  hint?: string;
};

const ACCEPT = "image/png,image/jpeg,image/webp,image/heic,image/heif";

async function getSignature(): Promise<Signature> {
  const response = await fetch("/api/uploads/cloudinary-signature", { method: "POST" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload-signatur fejlede (${response.status})`);
  }
  return (await response.json()) as Signature;
}

async function uploadToCloudinary(file: File, sig: Signature, onProgress?: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { secure_url: string };
          resolve(json.secure_url);
        } catch {
          reject(new Error("Kunne ikke fortolke Cloudinary-svar"));
        }
      } else {
        reject(new Error(`Cloudinary svarede ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Netværksfejl under upload"));
    xhr.send(form);
  });
}

export function PhotoUploader({
  value,
  onChange,
  multiple = false,
  max,
  className,
  label = "Foto",
  hint
}: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const limit = max ?? (multiple ? 6 : 1);
  const slotsLeft = Math.max(0, limit - value.length);
  const canAdd = slotsLeft > 0;

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, slotsLeft);
    if (list.length === 0) return;
    setBusy(true);
    try {
      const sig = await getSignature();
      const uploaded: string[] = [];
      for (let i = 0; i < list.length; i++) {
        setProgress(0);
        const url = await uploadToCloudinary(list[i], sig, setProgress);
        uploaded.push(url);
      }
      onChange(multiple ? [...value, ...uploaded] : [uploaded[0]]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload mislykkedes";
      toast({
        title: "Upload mislykkedes",
        description: showUrl
          ? message
          : `${message}. Du kan også indsætte et fotolink i stedet.`,
        variant: "danger"
      });
      setShowUrl(true);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      void handleFiles(event.target.files);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (!canAdd) return;
    if (event.dataTransfer.files?.length) {
      void handleFiles(event.dataTransfer.files);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addUrl() {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    onChange(multiple ? [...value, trimmed].slice(0, limit) : [trimmed]);
    setUrlValue("");
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between">
        <span className="block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="focus-ring text-2xs font-semibold text-warm-600 hover:text-warm-700"
        >
          {showUrl ? "Brug upload" : "Indsæt link i stedet"}
        </button>
      </div>

      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-hairline"
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Fjern foto"
                className="focus-ring absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-surface/95 text-muted shadow-sm ring-1 ring-hairline transition-colors hover:text-danger"
              >
                <Trash size={12} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {showUrl ? (
        <div className="flex gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
            leadingIcon={<LinkSimple size={13} weight="bold" aria-hidden="true" />}
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={!urlValue.trim() || !canAdd}
            className="focus-ring inline-flex h-10 items-center rounded-lg bg-sage-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-sage-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tilføj
          </button>
        </div>
      ) : canAdd ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-sunken/40 px-3 py-5 text-center transition-colors",
            dragOver ? "border-sage-400 bg-sage-50" : "border-border"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple={multiple}
            onChange={onPick}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Vælg foto"
            disabled={busy}
          />
          {busy ? (
            <>
              <CircleNotch
                size={18}
                weight="bold"
                aria-hidden="true"
                className="animate-spin text-sage-700"
              />
              <span className="text-xs font-semibold text-muted">
                Uploader… {progress > 0 ? `${progress}%` : ""}
              </span>
            </>
          ) : (
            <>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-sage-700 ring-1 ring-hairline">
                <UploadSimple size={14} weight="bold" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-ink">
                Træk hertil eller klik for at vælge
              </span>
              <span className="text-2xs text-subtle">
                {multiple
                  ? `Op til ${limit} billeder · JPG, PNG, WebP`
                  : "JPG, PNG, WebP · 1 billede"}
              </span>
            </>
          )}
        </div>
      ) : (
        <p className="rounded-lg bg-sunken px-3 py-2 text-2xs text-muted ring-1 ring-hairline">
          <ImageSquare size={11} weight="fill" aria-hidden="true" className="mr-1 inline" />
          Maks. {limit} billede{limit === 1 ? "" : "r"} valgt — fjern et for at tilføje flere.
        </p>
      )}

      {hint ? <p className="text-2xs text-subtle">{hint}</p> : null}
    </div>
  );
}
