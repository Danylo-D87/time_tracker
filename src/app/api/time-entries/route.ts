import { NextRequest, NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";
import * as taskRepo from "@/repositories/task-repository";
import { createTimeEntrySchema } from "@/lib/validators";
import { ActiveTimerError } from "@/repositories/time-entry-repository";

// GET /api/time-entries?date=YYYY-MM-DD&projectId=... — list time entries
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const date = searchParams.get("date");
        const projectId = searchParams.get("projectId") ?? undefined;

        // Validate date format if provided
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { error: "Invalid date format. Expected YYYY-MM-DD." },
                { status: 400 },
            );
        }

        const filters: {
            dateFrom?: string;
            dateTo?: string;
            projectId?: string;
        } = {};

        if (date) {
            // Filter for a single day: from start-of-day to start-of-next-day
            filters.dateFrom = `${date}T00:00:00.000Z`;
            const nextDay = new Date(date);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            filters.dateTo = nextDay.toISOString();
        }

        if (projectId) {
            filters.projectId = projectId;
        }

        const entries = await timeEntryRepo.findAll(filters);
        return NextResponse.json(entries);
    } catch (error) {
        console.error("GET /api/time-entries error:", error);
        return NextResponse.json(
            { error: "Failed to fetch time entries" },
            { status: 500 },
        );
    }
}

// POST /api/time-entries — start a new timer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createTimeEntrySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        // Find or create the task name
        const taskName = await taskRepo.findOrCreate(parsed.data.taskName);

        const entry = await timeEntryRepo.create({
            taskNameId: taskName.id,
            projectId: parsed.data.projectId,
            startTime: parsed.data.startTime
                ? new Date(parsed.data.startTime)
                : undefined,
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        // Single-timer violation → 409 Conflict
        if (error instanceof ActiveTimerError) {
            return NextResponse.json(
                {
                    error: error.message,
                    activeEntryId: error.activeEntryId,
                },
                { status: 409 },
            );
        }

        console.error("POST /api/time-entries error:", error);
        return NextResponse.json(
            { error: "Failed to create time entry" },
            { status: 500 },
        );
    }
}
