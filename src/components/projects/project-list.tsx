"use client";

import { ProjectCard } from "./project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";
import type { Project } from "@/types";

interface ProjectListProps {
    projects: Project[];
    isLoading: boolean;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

export function ProjectList({
    projects,
    isLoading,
    onEdit,
    onDelete,
}: ProjectListProps) {
    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-[80px] w-full rounded-2xl bg-surface"
                    />
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-hover">
                    <FolderOpen className="h-6 w-6 text-text-secondary" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-text-secondary">No projects yet</p>
                <p className="text-xs text-text-tertiary">
                    Create your first project to get started
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
