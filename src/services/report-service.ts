import { apiClient } from "@/services/api-client";
import type { ReportSummary } from "@/types";

// ── Report Service ───────────────────────────────────────────────────
// Client-side API wrapper for report generation and CSV export.

/** Fetch aggregated report data for a date range */
export async function getReport(
    from: string,
    to: string,
): Promise<ReportSummary> {
    return apiClient.get<ReportSummary>("/reports", { from, to });
}

/**
 * Get the CSV export URL for a date range.
 * Returns the full URL that can be used for download.
 */
export function getExportUrl(from: string, to: string): string {
    return `/api/reports/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=csv`;
}
