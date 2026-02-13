"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TimeEntry, Project } from "@/types";
import { format } from "date-fns";

interface ProjectGroupProps {
    project: Project;
    entries: TimeEntry[];
    totalDuration: number;
    onEdit: (entry: TimeEntry) => void;
    onDelete: (id: string) => void;
}

export function ProjectGroup({ project, entries, totalDuration, onEdit, onDelete }: ProjectGroupProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            {/* Project header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                        {project.name}
                    </span>
                    <span className="text-xs text-text-secondary">
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </span>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {formatDuration(totalDuration)}
                </span>
            </div>

            {/* Entries */}
            <div className="mt-3 flex flex-col gap-1.5">
                {entries.map((entry) => {
                    const isActive = !entry.endTime;
                    const startFormatted = format(new Date(entry.startTime), "HH:mm");
                    const endFormatted = entry.endTime
                        ? format(new Date(entry.endTime), "HH:mm")
                        : "now";

                    return (
                        <div
                            key={entry.id}
                            className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-surface-hover"
                        >
                            <div className="flex flex-1 items-center gap-2 min-w-0">
                                <span className="truncate text-text-secondary">
                                    {entry.taskName?.name ?? "Untitled"}
                                </span>
                                {isActive && (
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-tertiary">
                                    {startFormatted} – {endFormatted}
                                </span>
                                <span className="shrink-0 font-mono text-xs tabular-nums text-text-tertiary">
                                    {isActive ? "Running..." : formatDuration(entry.duration ?? 0)}
                                </span>

                                {/* Action buttons — visible on hover (desktop) or always (mobile) */}
                                <div className={cn(
                                    "flex items-center gap-1",
                                    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
                                )}>
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-white/10 hover:text-foreground"
                                        aria-label="Edit entry"
                                    >
                                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-white/10 hover:text-destructive"
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
