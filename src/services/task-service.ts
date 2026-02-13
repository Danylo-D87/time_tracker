import { apiClient } from "@/services/api-client";
import type { TaskName } from "@/types";

// ── Task Service ─────────────────────────────────────────────────────
// Client-side API wrapper for task name operations.
// Used primarily for autocomplete in the timer input.

/** Search task names for autocomplete (case-insensitive, limit 10) */
export async function searchTasks(query: string): Promise<TaskName[]> {
    return apiClient.get<TaskName[]>("/tasks", { q: query });
}

/** Create a new task name */
export async function createTask(name: string): Promise<TaskName> {
    return apiClient.post<TaskName>("/tasks", { name });
}

/** Delete a task name by ID */
export async function deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`);
}
