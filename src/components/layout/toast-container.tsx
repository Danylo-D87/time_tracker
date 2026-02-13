"use client";

import { useAppStore, type ToastMessage } from "@/store/app-store";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TOAST_ICONS: Record<ToastMessage["type"], typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

export function ToastContainer() {
    const toasts = useAppStore((s) => s.toasts);
    const removeToast = useAppStore((s) => s.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => {
                const Icon = TOAST_ICONS[toast.type];

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-2xl",
                            "animate-in slide-in-from-bottom-2 fade-in duration-200",
                            "min-w-[280px] max-w-[400px]",
                        )}
                    >
                        <Icon
                            className={cn(
                                "h-4 w-4 shrink-0",
                                toast.type === "success" && "text-white",
                                toast.type === "error" && "text-destructive",
                                toast.type === "info" && "text-text-secondary",
                            )}
                            strokeWidth={1.5}
                        />
                        <span className="flex-1 text-sm text-foreground">
                            {toast.message}
                        </span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 rounded-lg p-1 text-text-secondary transition-colors hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
