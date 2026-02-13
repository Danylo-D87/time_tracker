"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TimeEntry } from "@/types";
import { format } from "date-fns";

interface TimeEntryItemProps {
    entry: TimeEntry;
    onEdit: (entry: TimeEntry) => void;
    onDelete: (id: string) => void;
}

export function TimeEntryItem({ entry, onEdit, onDelete }: TimeEntryItemProps) {
    const isActive = !entry.endTime;
    const durationDisplay = isActive
        ? "Running..."
        : formatDuration(entry.duration ?? 0);

    const startTimeFormatted = format(new Date(entry.startTime), "HH:mm");
    const endTimeFormatted = entry.endTime
        ? format(new Date(entry.endTime), "HH:mm")
        : "now";

    return (
        <div
            className={cn(
                "group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200",
                "animate-in fade-in slide-in-from-bottom-1",
                isActive && "border-white/15",
            )}
        >
            {/* Project color indicator */}
            <div
                className="h-10 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: entry.project?.color ?? "#8E8E93" }}
            />

            {/* Content */}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {entry.taskName?.name ?? "Untitled"}
                    </span>
                    {isActive && (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    {entry.project && (
                        <span className="flex items-center gap-1">
                            <span
                                className="inline-block h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: entry.project.color }}
                            />
                            {entry.project.name}
                        </span>
                    )}
                    <span>•</span>
                    <span>
                        {startTimeFormatted} — {endTimeFormatted}
                    </span>
                </div>
            </div>

            {/* Duration */}
            <span
                className={cn(
                    "shrink-0 font-mono text-sm tabular-nums",
                    isActive ? "font-semibold text-foreground" : "text-text-secondary",
                )}
            >
                {durationDisplay}
            </span>

            {/* Actions — visible on hover (desktop) or always visible (mobile) */}
            {!isActive && (
                <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(entry)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                        aria-label="Edit entry"
                    >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => onDelete(entry.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete entry"
                    >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                </div>
            )}
        </div>
    );
}
