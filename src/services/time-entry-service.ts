import { apiClient } from "@/services/api-client";
import type { TimeEntry } from "@/types";
import type { UpdateTimeEntryInput } from "@/lib/validators";

// ── Time Entry Service ───────────────────────────────────────────────
// Client-side API wrapper for time entry operations.
// Handles timer start/stop and entry CRUD.

/** Fetch time entries, optionally filtered by date (YYYY-MM-DD) and/or projectId */
export async function getEntries(
    date?: string,
    projectId?: string,
): Promise<TimeEntry[]> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (projectId) params.projectId = projectId;
    return apiClient.get<TimeEntry[]>("/time-entries", params);
}

/**
 * Get the currently active timer (endTime IS NULL).
 * Returns the running TimeEntry or null if no timer is active.
 * Used to restore timer state after page reload.
 */
export async function getActiveTimer(): Promise<TimeEntry | null> {
    return apiClient.get<TimeEntry | null>("/time-entries/active");
}

/**
 * Start a new timer.
 * Sends taskName (string) and projectId — the server resolves
 * the task name via findOrCreate and creates a TimeEntry.
 * Returns the created entry with server-assigned startTime.
 */
export async function startTimer(
    taskName: string,
    projectId: string,
): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>("/time-entries", {
        taskName,
        projectId,
    });
}

/**
 * Stop a running timer.
 * Uses the dedicated stop endpoint which auto-calculates duration.
 */
export async function stopTimer(id: string): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>(`/time-entries/${id}/stop`, {});
}

/** Update a time entry (edit task name, project, times) */
export async function updateEntry(
    id: string,
    data: UpdateTimeEntryInput,
): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/time-entries/${id}`, data);
}

/** Delete a time entry */
export async function deleteEntry(id: string): Promise<void> {
    return apiClient.delete(`/time-entries/${id}`);
}
