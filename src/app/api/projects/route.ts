import { NextRequest, NextResponse } from "next/server";
import * as projectRepo from "@/repositories/project-repository";
import { createProjectSchema } from "@/lib/validators";

// GET /api/projects — list all projects
export async function GET() {
    try {
        const projects = await projectRepo.findAll();
        return NextResponse.json(projects);
    } catch (error) {
        console.error("GET /api/projects error:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 },
        );
    }
}

// POST /api/projects — create a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const project = await projectRepo.create(parsed.data);
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects error:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 },
        );
    }
}
