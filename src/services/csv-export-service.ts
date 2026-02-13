import { getExportUrl } from "@/services/report-service";

// ── CSV Export Service ───────────────────────────────────────────────
// Handles downloading CSV files in the browser.

/**
 * Download a CSV report for the given date range.
 * Fetches the CSV from the API and triggers a browser download.
 */
export async function downloadCSV(from: string, to: string): Promise<void> {
    const url = getExportUrl(from, to);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to export CSV: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `time-report_${from}_${to}.csv`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
}
