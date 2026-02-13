"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectForm } from "@/components/projects/project-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Project } from "@/types";

export default function ProjectsPage() {
    const { projects, isLoading, createProject, updateProject, deleteProject } =
        useProjects();

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handleEdit = useCallback((project: Project) => {
        setEditingProject(project);
    }, []);

    const handleDeleteRequest = useCallback((id: string) => {
        setDeleteTargetId(id);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTargetId) return;
        await deleteProject(deleteTargetId);
        setDeleteTargetId(null);
    }, [deleteTargetId, deleteProject]);

    const handleSaveCreate = useCallback(
        async (data: { name: string; color: string }) => {
            await createProject(data);
        },
        [createProject],
    );

    const handleSaveEdit = useCallback(
        async (data: { name: string; color: string }) => {
            if (!editingProject) return;
            await updateProject(editingProject.id, data);
        },
        [editingProject, updateProject],
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Projects
                    </h1>
                    <p className="text-sm text-text-secondary">
                        {projects.length} {projects.length === 1 ? "project" : "projects"}
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex h-10 items-center gap-2 rounded-2xl bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Project list */}
            <ProjectList
                projects={projects}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
            />

            {/* Create dialog */}
            <ProjectForm
                project={null}
                open={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSave={handleSaveCreate}
            />

            {/* Edit dialog */}
            <ProjectForm
                project={editingProject}
                open={!!editingProject}
                onClose={() => setEditingProject(null)}
                onSave={handleSaveEdit}
            />

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                open={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Project"
                description="This project will be permanently deleted. Projects with linked time entries cannot be deleted."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
