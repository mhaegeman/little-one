"use client";

import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  X
} from "@phosphor-icons/react/dist/ssr";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "info" | "success" | "warning" | "danger";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <Toaster />");
  }
  return ctx;
}

const variantStyles: Record<ToastVariant, string> = {
  info: "bg-surface text-ink ring-hairline",
  success: "bg-mint-50 text-mint-ink ring-mint-100",
  warning: "bg-[#FBF1D9] text-warning ring-[#F0DFB1]",
  danger: "bg-peach-50 text-danger ring-peach-100"
};

const variantIcon = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  danger: WarningCircle
} as const;

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t-${Date.now()}-${Math.random()}`;
      const next: Toast = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
        duration: input.duration ?? 4500
      };
      setToasts((current) => [...current, next]);
      const timer = setTimeout(() => dismiss(id), next.duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      for (const t of timers.current.values()) clearTimeout(t);
      timers.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-3 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-3 sm:left-auto sm:right-4 sm:translate-x-0 sm:px-0"
      >
        {toasts.map((t) => {
          const Icon = variantIcon[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-2 rounded-card p-3 shadow-lift ring-1 backdrop-blur transition-all duration-200 ease-nordic",
                variantStyles[t.variant]
              )}
            >
              <Icon
                size={16}
                weight="fill"
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-xs text-muted">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Luk besked"
                className="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted hover:bg-sunken hover:text-ink"
              >
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
