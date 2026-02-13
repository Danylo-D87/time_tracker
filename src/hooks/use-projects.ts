"use client";

import { useState, useEffect, useCallback } from "react";
import * as projectService from "@/services/project-service";
import { useAppStore } from "@/store/app-store";
import type { Project } from "@/types";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators";

// ── useProjects Hook ───────────────────────────────────────────────
// CRUD operations for projects.
// Loads all projects on mount, supports create/update/delete.

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const addToast = useAppStore((s) => s.addToast);

    /** Load all projects */
    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load projects";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-load on mount
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    /** Create a new project */
    const createProject = useCallback(
        async (data: CreateProjectInput) => {
            try {
                const created = await projectService.createProject(data);
                setProjects((prev) => [created, ...prev]);
                addToast("success", `Project "${created.name}" created`);
                return created;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to create project";
                addToast("error", message);
                throw err;
            }
        },
        [addToast],
    );

    /** Update a project */
    const updateProject = useCallback(
        async (id: string, data: UpdateProjectInput) => {
            try {
                const updated = await projectService.updateProject(id, data);
                setProjects((prev) =>
                    prev.map((p) => (p.id === id ? updated : p)),
                );
                addToast("success", `Project "${updated.name}" updated`);
                return updated;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update project";
                addToast("error", message);
                throw err;
            }
        },
        [addToast],
    );

    /** Delete a project */
    const deleteProject = useCallback(
        async (id: string) => {
            try {
                await projectService.deleteProject(id);
                setProjects((prev) => prev.filter((p) => p.id !== id));
                addToast("success", "Project deleted");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to delete project";
                addToast("error", message);
                throw err;
            }
        },
        [addToast],
    );

    return {
        projects,
        isLoading,
        error,
        reload: loadProjects,
        createProject,
        updateProject,
        deleteProject,
    };
}
