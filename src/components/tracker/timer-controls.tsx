"use client";

import { Play, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerControlsProps {
    isRunning: boolean;
    isLoading: boolean;
    formattedElapsed: string;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
}

export function TimerControls({
    isRunning,
    isLoading,
    formattedElapsed,
    onStart,
    onStop,
    disabled = false,
}: TimerControlsProps) {
    return (
        <div className="flex items-center gap-4">
            {/* Elapsed time display */}
            <div className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {formattedElapsed}
            </div>

            {/* Start / Stop button */}
            <button
                onClick={isRunning ? onStop : onStart}
                disabled={isLoading || disabled}
                className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isRunning
                        ? "bg-white/10 text-foreground hover:bg-white/20"
                        : "bg-white text-black hover:bg-white/90",
                )}
                aria-label={isRunning ? "Stop timer" : "Start timer"}
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                ) : isRunning ? (
                    <Square className="h-5 w-5" fill="currentColor" strokeWidth={0} />
                ) : (
                    <Play className="h-5 w-5 ml-0.5" fill="currentColor" strokeWidth={0} />
                )}
            </button>
        </div>
    );
}
