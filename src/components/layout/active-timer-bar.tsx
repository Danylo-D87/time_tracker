"use client";

import { useTimer } from "@/hooks/use-timer";
import { useProjects } from "@/hooks/use-projects";
import { Square } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ActiveTimerBar() {
    const { isRunning, currentTaskName, currentProjectId, formattedElapsed, stopTimer, isLoading } =
        useTimer();
    const { projects } = useProjects();

    // Show skeleton while restoring timer from server
    if (isLoading) {
        return (
            <div className="sticky top-14 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-xl">
                <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-2.5 w-2.5 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-20 rounded" />
                        <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isRunning) return null;

    const project = projects.find((p) => p.id === currentProjectId);

    return (
        <div className="sticky top-14 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-xl">
            <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
                {/* Left: task + project info */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Pulsing indicator */}
                    <div className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                    </div>

                    <span className="truncate text-sm font-medium text-foreground">
                        {currentTaskName || "Untitled task"}
                    </span>

                    {project && (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                        </span>
                    )}
                </div>

                {/* Right: elapsed time + stop */}
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {formattedElapsed}
                    </span>

                    <button
                        onClick={stopTimer}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-foreground transition-colors hover:bg-white/20"
                        aria-label="Stop timer"
                    >
                        <Square className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                    </button>
                </div>
            </div>
        </div>
    );
}
