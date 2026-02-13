"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import * as reportService from "@/services/report-service";
import { downloadCSV } from "@/services/csv-export-service";
import { useAppStore } from "@/store/app-store";
import { DATE_FORMAT, type ReportPeriod } from "@/lib/constants";
import type { ReportSummary } from "@/types";

// ── useReports Hook ─────────────────────────────────────────────────
// Report data loading with period-based filtering.
// Supports day / week / month periods and CSV export.

/** Compute from/to dates based on a reference date and period */
function getDateRange(
    referenceDate: Date,
    period: ReportPeriod,
): { from: string; to: string } {
    switch (period) {
        case "day":
            return {
                from: format(referenceDate, DATE_FORMAT),
                to: format(referenceDate, DATE_FORMAT),
            };
        case "week": {
            const ws = startOfWeek(referenceDate, { weekStartsOn: 1 });
            const we = endOfWeek(referenceDate, { weekStartsOn: 1 });
            return {
                from: format(ws, DATE_FORMAT),
                to: format(we, DATE_FORMAT),
            };
        }
        case "month": {
            const ms = startOfMonth(referenceDate);
            const me = endOfMonth(referenceDate);
            return {
                from: format(ms, DATE_FORMAT),
                to: format(me, DATE_FORMAT),
            };
        }
    }
}

export function useReports() {
    const [period, setPeriod] = useState<ReportPeriod>("week");
    const [referenceDate, setReferenceDate] = useState(new Date());
    const [report, setReport] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addToast = useAppStore((s) => s.addToast);

    const { from, to } = getDateRange(referenceDate, period);

    /** Load report data */
    const loadReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await reportService.getReport(from, to);
            setReport(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load report";
            setError(message);
            setReport(null);
        } finally {
            setIsLoading(false);
        }
    }, [from, to]);

    // Auto-load when date range changes
    useEffect(() => {
        loadReport();
    }, [loadReport]);

    /** Export current report as CSV (triggers browser download) */
    const exportCSV = useCallback(async () => {
        setIsExporting(true);
        try {
            await downloadCSV(from, to);
            addToast("success", "CSV exported successfully");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to export CSV";
            addToast("error", message);
        } finally {
            setIsExporting(false);
        }
    }, [from, to, addToast]);

    return {
        // State
        period,
        referenceDate,
        from,
        to,
        report,
        isLoading,
        isExporting,
        error,

        // Actions
        setPeriod,
        setReferenceDate,
        reload: loadReport,
        exportCSV,
    };
}
