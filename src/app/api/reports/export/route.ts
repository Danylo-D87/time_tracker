import { NextRequest, NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";
import { reportQuerySchema } from "@/lib/validators";
import { toExclusiveDate } from "@/lib/utils";
import Papa from "papaparse";

// GET /api/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;

        const parsed = reportQuerySchema.safeParse({
            from: searchParams.get("from"),
            to: searchParams.get("to"),
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const format = searchParams.get("format") ?? "csv";
        if (format !== "csv") {
            return NextResponse.json(
                { error: "Unsupported format. Only 'csv' is supported." },
                { status: 400 },
            );
        }

        const { from, to } = parsed.data;

        // "to" is inclusive — convert to exclusive for query
        const toExclusive = toExclusiveDate(to);

        const grouped = await timeEntryRepo.getGroupedByProject(from, toExclusive);

        // Flatten to CSV rows
        const rows = grouped.flatMap((g) =>
            g.entries.map((entry) => ({
                Date: new Date(entry.startTime).toISOString().split("T")[0],
                Project: g.project.name,
                Task: entry.taskName?.name ?? "",
                "Start Time": new Date(entry.startTime).toISOString(),
                "End Time": entry.endTime
                    ? new Date(entry.endTime).toISOString()
                    : "",
                "Duration (hours)": entry.duration
                    ? (entry.duration / 3600).toFixed(2)
                    : "0.00",
            })),
        );

        const csv = Papa.unparse(rows);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="time-report_${from}_${to}.csv"`,
            },
        });
    } catch (error) {
        console.error("GET /api/reports/export error:", error);
        return NextResponse.json(
            { error: "Failed to export report" },
            { status: 500 },
        );
    }
}
