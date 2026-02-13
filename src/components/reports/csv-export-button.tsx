"use client";

import { Download, Loader2 } from "lucide-react";

interface CSVExportButtonProps {
    onExport: () => void;
    isExporting: boolean;
    disabled?: boolean;
}

export function CSVExportButton({
    onExport,
    isExporting,
    disabled = false,
}: CSVExportButtonProps) {
    return (
        <button
            onClick={onExport}
            disabled={isExporting || disabled}
            className="flex h-10 items-center gap-2 rounded-2xl bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
                <Download className="h-4 w-4" strokeWidth={1.5} />
            )}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
        </button>
    );
}
