"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { DISPLAY_DATE_FORMAT, type ReportPeriod } from "@/lib/constants";

interface ReportFiltersProps {
    period: ReportPeriod;
    referenceDate: Date;
    from: string;
    to: string;
    onPeriodChange: (period: ReportPeriod) => void;
    onDateChange: (date: Date) => void;
}

const PERIODS: { value: ReportPeriod; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
];

function getDateLabel(from: string, to: string, period: ReportPeriod): string {
    if (period === "day") {
        return format(new Date(`${from}T00:00:00`), DISPLAY_DATE_FORMAT);
    }
    const fromF = format(new Date(`${from}T00:00:00`), "dd MMM");
    const toF = format(new Date(`${to}T00:00:00`), "dd MMM yyyy");
    return `${fromF} — ${toF}`;
}

export function ReportFilters({
    period,
    referenceDate,
    from,
    to,
    onPeriodChange,
    onDateChange,
}: ReportFiltersProps) {
    function navigate(direction: -1 | 1) {
        const fns = {
            day: direction === 1 ? addDays : subDays,
            week: direction === 1 ? addWeeks : subWeeks,
            month: direction === 1 ? addMonths : subMonths,
        };
        onDateChange(fns[period](referenceDate, 1));
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Period toggle */}
            <div className="flex rounded-2xl border border-border bg-surface p-1">
                {PERIODS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onPeriodChange(value)}
                        className={cn(
                            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                            period === value
                                ? "bg-surface-hover text-foreground"
                                : "text-text-secondary hover:text-foreground",
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Date navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface hover:text-foreground"
                    aria-label="Previous period"
                >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="min-w-[200px] text-center text-sm font-semibold text-foreground">
                    {getDateLabel(from, to, period)}
                </span>
                <button
                    onClick={() => navigate(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface hover:text-foreground"
                    aria-label="Next period"
                >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
