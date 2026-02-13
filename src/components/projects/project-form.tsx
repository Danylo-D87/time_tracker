"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS } from "@/lib/constants";
import type { Project } from "@/types";

interface ProjectFormProps {
    project: Project | null; // null = create mode
    open: boolean;
    onClose: () => void;
    onSave: (data: { name: string; color: string }) => Promise<void>;
}

export function ProjectForm({
    project,
    open,
    onClose,
    onSave,
}: ProjectFormProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState<string>(PROJECT_COLORS[0]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isEdit = !!project;

    // Sync form state
    useEffect(() => {
        if (project) {
            setName(project.name);
            setColor(project.color);
        } else {
            setName("");
            setColor(PROJECT_COLORS[0]);
        }
        setError(null);
    }, [project, open]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            setError("Project name is required");
            return;
        }

        setError(null);
        setIsSaving(true);
        try {
            await onSave({ name: name.trim(), color });
            onClose();
        } catch {
            setError("Failed to save project");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-3xl border-border bg-surface sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        {isEdit ? "Edit Project" : "New Project"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                    {/* Project name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Project name"
                            className="rounded-xl border-border bg-background text-foreground"
                            maxLength={100}
                            autoFocus
                        />
                    </div>

                    {/* Color picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PROJECT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                                        color === c
                                            ? "ring-2 ring-white/30 ring-offset-2 ring-offset-surface scale-110"
                                            : "hover:scale-105",
                                    )}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Color ${c}`}
                                >
                                    {color === c && (
                                        <svg
                                            className="h-4 w-4 text-white drop-shadow"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-3 rounded-xl bg-background/50 p-3">
                        <div
                            className="h-8 w-8 rounded-xl"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-foreground">
                            {name || "Project name"}
                        </span>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl text-text-secondary hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="rounded-xl bg-white text-black hover:bg-white/90"
                        >
                            {isSaving ? "Saving..." : isEdit ? "Save" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
