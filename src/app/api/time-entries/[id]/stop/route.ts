import { NextRequest, NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";
import { stopTimerSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/time-entries/[id]/stop — stop a running timer
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const existing = await timeEntryRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Time entry not found" },
                { status: 404 },
            );
        }

        // Can only stop a running timer (endTime must be null)
        if (existing.endTime !== null) {
            return NextResponse.json(
                { error: "This timer is already stopped" },
                { status: 400 },
            );
        }

        const body = await request.json().catch(() => ({}));
        const parsed = stopTimerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const endTime = parsed.data.endTime
            ? new Date(parsed.data.endTime)
            : new Date();

        const updated = await timeEntryRepo.update(id, { endTime });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("POST /api/time-entries/[id]/stop error:", error);
        return NextResponse.json(
            { error: "Failed to stop timer" },
            { status: 500 },
        );
    }
}
