"use client";

import { AlertCircle, Check } from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error";

type ToastState = {
  id: number;
  message: string;
  kind: ToastKind;
};

type ToastApi = {
  show: (
    message: string,
    opts?: { kind?: ToastKind; durationMs?: number }
  ) => void;
  hide: () => void;
};

const NOOP: ToastApi = {
  show: () => {
    /* no provider mounted */
  },
  hide: () => {
    /* no provider mounted */
  },
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback<ToastApi["show"]>((message, opts) => {
    const t: ToastState = {
      id: Date.now() + Math.random(),
      message,
      kind: opts?.kind ?? "success",
    };
    setToast(t);
    const d = opts?.durationMs ?? 2400;
    window.setTimeout(() => {
      setToast((cur) => (cur?.id === t.id ? null : cur));
    }, d);
  }, []);

  const hide = useCallback<ToastApi["hide"]>(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {toast && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="pointer-events-auto inline-flex items-center gap-2 max-w-[92%] px-4 h-11 rounded-full bg-neutral-900 text-white shadow-e2 animate-[toastIn_240ms_cubic-bezier(0.2,0,0,1)]">
            <span
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                toast.kind === "success" ? "bg-success" : "bg-error"
              )}
            >
              {toast.kind === "success" ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <AlertCircle size={12} />
              )}
            </span>
            <span className="t-body-sm font-medium truncate">
              {toast.message}
            </span>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
