import { NextRequest, NextResponse } from "next/server";
import * as taskRepo from "@/repositories/task-repository";
import { searchTaskNameSchema, createTaskNameSchema } from "@/lib/validators";

// GET /api/tasks?q=... — search task names for autocomplete
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const parsed = searchTaskNameSchema.safeParse({
            q: searchParams.get("q") ?? "",
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const tasks = await taskRepo.search(parsed.data.q);
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("GET /api/tasks error:", error);
        return NextResponse.json(
            { error: "Failed to search tasks" },
            { status: 500 },
        );
    }
}

// POST /api/tasks — create a new task name
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createTaskNameSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        // Check if name already exists
        const existing = await taskRepo.findByName(parsed.data.name.trim());
        if (existing) {
            return NextResponse.json(existing);
        }

        const task = await taskRepo.create(parsed.data.name);
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("POST /api/tasks error:", error);
        return NextResponse.json(
            { error: "Failed to create task name" },
            { status: 500 },
        );
    }
}
