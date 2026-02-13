import { NextRequest, NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";
import { reportQuerySchema } from "@/lib/validators";
import { toExclusiveDate } from "@/lib/utils";

// GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD — aggregated report data
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

        const { from, to } = parsed.data;

        // "to" is inclusive, so we convert to exclusive for the query
        const toExclusive = toExclusiveDate(to);

        const grouped = await timeEntryRepo.getGroupedByProject(from, toExclusive);

        // Calculate totals
        const totalDuration = grouped.reduce((sum, g) => sum + g.totalDuration, 0);

        const projectBreakdown = grouped.map((g) => ({
            project: g.project,
            totalDuration: g.totalDuration,
            percentage: totalDuration > 0
                ? Math.round((g.totalDuration / totalDuration) * 100)
                : 0,
            taskCount: new Set(g.entries.map((e) => e.taskNameId)).size,
        }));

        // Flatten entries for the report table
        const entries = grouped.flatMap((g) =>
            g.entries.map((e) => ({
                project: g.project,
                taskName: e.taskName,
                date: new Date(e.startTime).toISOString().split("T")[0],
                startTime: e.startTime,
                endTime: e.endTime,
                durationHours: e.duration ? e.duration / 3600 : 0,
            })),
        );

        return NextResponse.json({
            totalDuration,
            projectBreakdown,
            entries,
        });
    } catch (error) {
        console.error("GET /api/reports error:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 },
        );
    }
}
