import { NextRequest, NextResponse } from "next/server";
import * as taskRepo from "@/repositories/task-repository";
import { LinkedEntriesError } from "@/repositories/task-repository";

type RouteContext = { params: Promise<{ id: string }> };

// DELETE /api/tasks/[id] — delete a task name
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const existing = await taskRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Task name not found" },
                { status: 404 },
            );
        }

        await taskRepo.remove(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof LinkedEntriesError) {
            return NextResponse.json(
                { error: error.message, entryCount: error.entryCount },
                { status: 409 },
            );
        }

        console.error("DELETE /api/tasks/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete task name" },
            { status: 500 },
        );
    }
}
