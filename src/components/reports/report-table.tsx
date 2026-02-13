"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatDurationHours } from "@/lib/utils";
import { format } from "date-fns";
import type { ReportEntry } from "@/types";

interface ReportTableProps {
    entries: ReportEntry[];
    isLoading: boolean;
}

export function ReportTable({ entries, isLoading }: ReportTableProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl bg-surface" />
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-12">
                <p className="text-sm text-text-secondary">No data for this period</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Date
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Project
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Task
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Duration
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Hours
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry, i) => (
                        <TableRow
                            key={`${entry.startTime}-${i}`}
                            className="border-border hover:bg-surface-hover"
                        >
                            <TableCell className="text-sm text-text-secondary">
                                {format(new Date(`${entry.date}T00:00:00`), "dd MMM")}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: entry.project.color }}
                                    />
                                    <span className="text-sm font-medium text-foreground">
                                        {entry.project.name}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-text-secondary">
                                {entry.taskName?.name ?? "—"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums text-text-secondary">
                                {formatDuration(Math.round(entry.durationHours * 3600))}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums text-foreground">
                                {formatDurationHours(Math.round(entry.durationHours * 3600))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
