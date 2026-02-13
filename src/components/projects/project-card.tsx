"use client";

import { Pencil, Trash2, Clock } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    return (
        <div className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-1">
            {/* Color circle */}
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${project.color}20` }}
            >
                <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                />
            </div>

            {/* Name */}
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="truncate text-sm font-semibold text-foreground">
                    {project.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Actions — visible on hover (desktop) or always visible (mobile) */}
            <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <button
                    onClick={() => onEdit(project)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                    aria-label="Edit project"
                >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                    onClick={() => onDelete(project.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete project"
                >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
