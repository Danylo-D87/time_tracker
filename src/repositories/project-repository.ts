import { prisma } from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators";

// ── Project Repository ───────────────────────────────────────────────
// Data access layer for Project model.
// All database interactions with projects go through this module.

/** Get all projects ordered by creation date (newest first) */
export async function findAll() {
    return prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });
}

/** Get a single project by ID, or null if not found */
export async function findById(id: string) {
    return prisma.project.findUnique({
        where: { id },
    });
}

/** Create a new project */
export async function create(data: CreateProjectInput) {
    return prisma.project.create({
        data: {
            name: data.name,
            color: data.color,
        },
    });
}

/** Update an existing project */
export async function update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({
        where: { id },
        data,
    });
}

/**
 * Delete a project by ID.
 * Throws LinkedEntriesError if the project has linked time entries.
 */
export async function remove(id: string) {
    const entryCount = await prisma.timeEntry.count({
        where: { projectId: id },
    });

    if (entryCount > 0) {
        throw new LinkedEntriesError(
            `Cannot delete project: it has ${entryCount} linked time entries. Remove them first.`,
            entryCount,
        );
    }

    return prisma.project.delete({
        where: { id },
    });
}

// ── Custom Errors ────────────────────────────────────────────────────

/** Thrown when attempting to delete an entity that has linked time entries */
export class LinkedEntriesError extends Error {
    constructor(
        message: string,
        public readonly entryCount: number,
    ) {
        super(message);
        this.name = "LinkedEntriesError";
    }
}
