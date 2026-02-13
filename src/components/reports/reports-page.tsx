"use client";

import { useReports } from "@/hooks/use-reports";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportChart } from "@/components/reports/report-chart";
import { ReportTable } from "@/components/reports/report-table";
import { CSVExportButton } from "@/components/reports/csv-export-button";
import { formatDuration } from "@/lib/utils";

export default function ReportsPage() {
    const {
        period,
        referenceDate,
        from,
        to,
        report,
        isLoading,
        isExporting,
        setPeriod,
        setReferenceDate,
        exportCSV,
    } = useReports();

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Reports
                    </h1>
                    {report && (
                        <p className="text-sm text-text-secondary">
                            Total: {formatDuration(report.totalDuration)}
                        </p>
                    )}
                </div>

                <CSVExportButton
                    onExport={exportCSV}
                    isExporting={isExporting}
                    disabled={!report || report.entries.length === 0}
                />
            </div>

            {/* Filters */}
            <ReportFilters
                period={period}
                referenceDate={referenceDate}
                from={from}
                to={to}
                onPeriodChange={setPeriod}
                onDateChange={setReferenceDate}
            />

            {/* Chart breakdown */}
            {report && report.projectBreakdown.length > 0 && (
                <ReportChart
                    breakdown={report.projectBreakdown}
                    totalDuration={report.totalDuration}
                />
            )}

            {/* Detailed table */}
            <ReportTable
                entries={report?.entries ?? []}
                isLoading={isLoading}
            />
        </div>
    );
}
