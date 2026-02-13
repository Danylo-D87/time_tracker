"use client";

import { formatDuration } from "@/lib/utils";
import type { ProjectReportItem } from "@/types";

interface ReportChartProps {
    breakdown: ProjectReportItem[];
    totalDuration: number;
}

export function ReportChart({ breakdown, totalDuration }: ReportChartProps) {
    if (breakdown.length === 0) return null;

    // Calculate SVG donut ring segments
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = breakdown.map((item) => {
        const pct = totalDuration > 0 ? item.totalDuration / totalDuration : 0;
        const dashLength = pct * circumference;
        const dashOffset = -offset;
        offset += dashLength;
        return { ...item, dashLength, dashOffset, pct };
    });

    return (
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-start">
            {/* Donut ring — thin, geometric */}
            <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                    {/* Track */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="8"
                    />
                    {/* Segments — use project colors */}
                    {segments.map((seg) => (
                        <circle
                            key={seg.project.id}
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke={seg.project.color}
                            strokeWidth="8"
                            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
                            strokeDashoffset={seg.dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>

                {/* Center text */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                        {formatDuration(totalDuration)}
                    </span>
                    <span className="text-xs text-text-secondary">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-1 flex-col gap-3">
                {segments.map((seg) => (
                    <div key={seg.project.id} className="flex items-center gap-3">
                        <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{
                                backgroundColor: seg.project.color,
                            }}
                        />
                        <div className="flex flex-1 flex-col gap-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    {seg.project.name}
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                    {seg.percentage}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary">
                                    {seg.taskCount} {seg.taskCount === 1 ? "task" : "tasks"}
                                </span>
                                <span className="font-mono text-xs tabular-nums text-text-secondary">
                                    {formatDuration(seg.totalDuration)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
