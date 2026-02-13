"use client";

import { TimeEntryItem } from "./time-entry-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { TimeEntry } from "@/types";

interface TimeEntryListProps {
    entries: TimeEntry[];
    isLoading: boolean;
    totalDuration: number;
    onEdit: (entry: TimeEntry) => void;
    onDelete: (id: string) => void;
}

export function TimeEntryList({
    entries,
    isLoading,
    totalDuration,
    onEdit,
    onDelete,
}: TimeEntryListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-[76px] w-full rounded-2xl bg-surface"
                    />
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-hover">
                    <Clock className="h-6 w-6 text-text-secondary" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-text-secondary">No time entries for this day</p>
                <p className="text-xs text-text-tertiary">
                    Start a timer to begin tracking
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Total duration header */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Entries
                </span>
                <span className="font-mono text-xs tabular-nums text-text-secondary">
                    Total: {formatDuration(totalDuration)}
                </span>
            </div>

            {/* Entry list */}
            {entries.map((entry) => (
                <TimeEntryItem
                    key={entry.id}
                    entry={entry}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
