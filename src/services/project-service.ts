import { apiClient } from "@/services/api-client";
import type { Project } from "@/types";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators";

// ── Project Service ──────────────────────────────────────────────────
// Client-side API wrapper for project CRUD operations.

/** Fetch all projects */
export async function getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>("/projects");
}

/** Fetch a single project by ID */
export async function getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
}

/** Create a new project */
export async function createProject(data: CreateProjectInput): Promise<Project> {
    return apiClient.post<Project>("/projects", data);
}

/** Update an existing project */
export async function updateProject(
    id: string,
    data: UpdateProjectInput,
): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data);
}

/** Delete a project */
export async function deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
}
