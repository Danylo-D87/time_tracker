import { NextRequest, NextResponse } from "next/server";
import * as projectRepo from "@/repositories/project-repository";
import { LinkedEntriesError } from "@/repositories/project-repository";
import { updateProjectSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — get a single project
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const project = await projectRepo.findById(id);

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("GET /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 },
        );
    }
}

// PUT /api/projects/[id] — update a project
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const parsed = updateProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const existing = await projectRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        const updated = await projectRepo.update(id, parsed.data);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 },
        );
    }
}

// DELETE /api/projects/[id] — delete a project
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const existing = await projectRepo.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        await projectRepo.remove(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof LinkedEntriesError) {
            return NextResponse.json(
                { error: error.message, entryCount: error.entryCount },
                { status: 409 },
            );
        }

        console.error("DELETE /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 },
        );
    }
}
