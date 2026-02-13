import { prisma } from "@/lib/prisma";

// ── TaskName Repository ──────────────────────────────────────────────
// Data access layer for TaskName model.
// Provides CRUD + findOrCreate for seamless task name management.

/** Get all task names ordered alphabetically */
export async function findAll() {
    return prisma.taskName.findMany({
        orderBy: { name: "asc" },
    });
}

/** Get a single task name by ID, or null if not found */
export async function findById(id: string) {
    return prisma.taskName.findUnique({
        where: { id },
    });
}

/** Find a task name by exact name match, or null if not found */
export async function findByName(name: string) {
    return prisma.taskName.findUnique({
        where: { name },
    });
}

/**
 * Search task names for autocomplete (case-insensitive).
 * Returns up to 10 results matching the query.
 */
export async function search(query: string) {
    if (!query.trim()) {
        return prisma.taskName.findMany({
            orderBy: { updatedAt: "desc" },
            take: 10,
        });
    }

    return prisma.taskName.findMany({
        where: {
            name: {
                contains: query.trim(),
                mode: "insensitive",
            },
        },
        orderBy: { name: "asc" },
        take: 10,
    });
}

/**
 * Find an existing task name or create a new one.
 * Uses upsert to prevent race conditions when concurrent
 * requests try to create the same task name simultaneously.
 */
export async function findOrCreate(name: string) {
    const trimmed = name.trim();

    return prisma.taskName.upsert({
        where: { name: trimmed },
        update: {},           // no-op if already exists
        create: { name: trimmed },
    });
}

/** Create a new task name. Throws if name already exists (unique constraint). */
export async function create(name: string) {
    return prisma.taskName.create({
        data: { name: name.trim() },
    });
}

/**
 * Delete a task name by ID.
 * Throws LinkedEntriesError if the task name has linked time entries.
 */
export async function remove(id: string) {
    const entryCount = await prisma.timeEntry.count({
        where: { taskNameId: id },
    });

    if (entryCount > 0) {
        throw new LinkedEntriesError(
            `Cannot delete task name: it has ${entryCount} linked time entries. Remove them first.`,
            entryCount,
        );
    }

    return prisma.taskName.delete({
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
