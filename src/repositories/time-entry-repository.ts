import { prisma } from "@/lib/prisma";
import { calculateDuration } from "@/lib/utils";

// ── TimeEntry Repository ─────────────────────────────────────────────
// Data access layer for TimeEntry model.
// Enforces single-timer invariant at the data layer.

/** Filters for listing time entries */
export interface TimeEntryFilters {
    /** Filter entries that start on or after this date (ISO string or Date) */
    dateFrom?: string | Date;
    /** Filter entries that start before this date (ISO string or Date) */
    dateTo?: string | Date;
    /** Filter by project ID */
    projectId?: string;
}

/**
 * Get time entries with optional date/project filtering.
 * Includes related project and taskName.
 * Ordered by startTime descending (newest first).
 */
export async function findAll(filters?: TimeEntryFilters) {
    const where: Record<string, unknown> = {};

    if (filters?.dateFrom || filters?.dateTo) {
        where.startTime = {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { lt: new Date(filters.dateTo) }),
        };
    }

    if (filters?.projectId) {
        where.projectId = filters.projectId;
    }

    return prisma.timeEntry.findMany({
        where,
        include: {
            project: true,
            taskName: true,
        },
        orderBy: { startTime: "desc" },
    });
}

/** Get a single time entry by ID with related data, or null if not found */
export async function findById(id: string) {
    return prisma.timeEntry.findUnique({
        where: { id },
        include: {
            project: true,
            taskName: true,
        },
    });
}

/**
 * Find the currently active timer (endTime IS NULL).
 * Returns at most 1 entry — this is the source of truth
 * for restoring the timer after page reload.
 */
export async function findActive() {
    return prisma.timeEntry.findFirst({
        where: { endTime: null },
        include: {
            project: true,
            taskName: true,
        },
    });
}

/**
 * Create a new time entry (start a timer).
 * **Enforces single-timer rule:** throws if a timer is already running.
 */
export async function create(data: {
    taskNameId: string;
    projectId: string;
    startTime?: Date;
}) {
    // Single-timer guard: check for any running timer
    const active = await findActive();
    if (active) {
        throw new ActiveTimerError(
            "A timer is already running. Stop it before starting a new one.",
            active.id,
        );
    }

    return prisma.timeEntry.create({
        data: {
            taskNameId: data.taskNameId,
            projectId: data.projectId,
            startTime: data.startTime ?? new Date(),
        },
        include: {
            project: true,
            taskName: true,
        },
    });
}

/**
 * Update a time entry.
 * If endTime is being set and duration is not provided,
 * automatically calculates duration from startTime → endTime.
 * If endTime is being set to null (re-opening), enforces single-timer rule.
 */
export async function update(
    id: string,
    data: {
        taskNameId?: string;
        projectId?: string;
        startTime?: Date;
        endTime?: Date | null;
        duration?: number | null;
    },
) {
    // Single-timer guard: prevent re-opening a completed entry if another is active
    if (data.endTime === null) {
        const active = await findActive();
        if (active && active.id !== id) {
            throw new ActiveTimerError(
                "Cannot re-open this entry: another timer is already running.",
                active.id,
            );
        }
    }

    // Auto-calculate duration when stopping the timer
    let { duration } = data;
    if (data.endTime && duration === undefined) {
        const entry = await prisma.timeEntry.findUnique({
            where: { id },
            select: { startTime: true },
        });
        if (entry) {
            duration = calculateDuration(entry.startTime, data.endTime);
        }
    }

    return prisma.timeEntry.update({
        where: { id },
        data: {
            ...data,
            duration,
        },
        include: {
            project: true,
            taskName: true,
        },
    });
}

/** Delete a time entry by ID */
export async function remove(id: string) {
    return prisma.timeEntry.delete({
        where: { id },
    });
}

/**
 * Get time entries grouped by project for a date range.
 * Used for reports.
 */
export async function getGroupedByProject(dateFrom: string, dateTo: string) {
    const entries = await prisma.timeEntry.findMany({
        where: {
            startTime: {
                gte: new Date(dateFrom),
                lt: new Date(dateTo),
            },
            endTime: { not: null },
        },
        include: {
            project: true,
            taskName: true,
        },
        orderBy: { startTime: "asc" },
    });

    // Group entries by projectId
    const grouped = new Map<
        string,
        {
            project: (typeof entries)[0]["project"];
            entries: typeof entries;
            totalDuration: number;
        }
    >();

    for (const entry of entries) {
        const existing = grouped.get(entry.projectId);
        const entryDuration = entry.duration ?? 0;

        if (existing) {
            existing.entries.push(entry);
            existing.totalDuration += entryDuration;
        } else {
            grouped.set(entry.projectId, {
                project: entry.project,
                entries: [entry],
                totalDuration: entryDuration,
            });
        }
    }

    return Array.from(grouped.values());
}

// ── Custom Errors ────────────────────────────────────────────────────

/** Thrown when attempting to start a timer while another is already running */
export class ActiveTimerError extends Error {
    constructor(
        message: string,
        public readonly activeEntryId: string,
    ) {
        super(message);
        this.name = "ActiveTimerError";
    }
}
