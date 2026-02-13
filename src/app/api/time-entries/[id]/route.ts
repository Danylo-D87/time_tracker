import { NextRequest, NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";
import * as taskRepo from "@/repositories/task-repository";
import { ActiveTimerError } from "@/repositories/time-entry-repository";
import { updateTimeEntrySchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/time-entries/[id] — get a single time entry
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const entry = await timeEntryRepo.findById(id);

        if (!entry) {
            return NextResponse.json(
                { error: "Time entry not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error("GET /api/time-entries/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch time entry" },
            { status: 500 },
        );
    }
}

// PUT /api/time-entries/[id] — update a time entry (general edit)
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const existing = await timeEntryRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Time entry not found" },
                { status: 404 },
            );
        }

        const parsed = updateTimeEntrySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        // Build the update payload
        const updateData: Parameters<typeof timeEntryRepo.update>[1] = {};

        if (parsed.data.projectId) updateData.projectId = parsed.data.projectId;
        if (parsed.data.startTime) updateData.startTime = new Date(parsed.data.startTime);
        if (parsed.data.endTime !== undefined) {
            updateData.endTime = parsed.data.endTime
                ? new Date(parsed.data.endTime)
                : null;
        }
        if (parsed.data.duration !== undefined) updateData.duration = parsed.data.duration;

        // If taskName changed, resolve it via findOrCreate
        if (parsed.data.taskName) {
            const taskName = await taskRepo.findOrCreate(parsed.data.taskName);
            updateData.taskNameId = taskName.id;
        }

        const updated = await timeEntryRepo.update(id, updateData);
        return NextResponse.json(updated);
    } catch (error) {
        // Single-timer violation when setting endTime to null
        if (error instanceof ActiveTimerError) {
            return NextResponse.json(
                { error: error.message, activeEntryId: error.activeEntryId },
                { status: 409 },
            );
        }

        console.error("PUT /api/time-entries/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update time entry" },
            { status: 500 },
        );
    }
}

// DELETE /api/time-entries/[id] — delete a time entry
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const existing = await timeEntryRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Time entry not found" },
                { status: 404 },
            );
        }

        await timeEntryRepo.remove(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/time-entries/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete time entry" },
            { status: 500 },
        );
    }
}
