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
import { ProjectSelect } from "./project-select";
import { TaskInput } from "./task-input";
import { useTaskSuggestions } from "@/hooks/use-task-suggestions";
import type { TimeEntry, Project } from "@/types";
import type { UpdateTimeEntryInput } from "@/lib/validators";

interface TimeEntryEditProps {
    entry: TimeEntry | null;
    projects: Project[];
    open: boolean;
    onClose: () => void;
    onSave: (id: string, data: UpdateTimeEntryInput) => Promise<void>;
}

/** Parse "HH:mm" into hours and minutes */
function parseHHMM(str: string): { hours: number; minutes: number } | null {
    const match = str.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = parseInt(match[1]!, 10);
    const minutes = parseInt(match[2]!, 10);
    if (hours > 23 || minutes > 59) return null;
    return { hours, minutes };
}

/**
 * Format an ISO date string to "HH:mm" using UTC to prevent
 * timezone mismatch between client and server.
 */
function toHHMM(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/**
 * Build an ISO string from an original ISO date + HH:mm, using UTC.
 * Preserves the original calendar date while changing only hours/minutes.
 */
function buildUTCDate(originalISO: string, hhmm: { hours: number; minutes: number }): Date {
    const d = new Date(originalISO);
    d.setUTCHours(hhmm.hours, hhmm.minutes, 0, 0);
    return d;
}

export function TimeEntryEdit({
    entry,
    projects,
    open,
    onClose,
    onSave,
}: TimeEntryEditProps) {
    const [taskName, setTaskName] = useState("");
    const [projectId, setProjectId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const taskSuggestions = useTaskSuggestions();

    // Track if form has unsaved changes
    const hasChanges = entry
        ? taskName !== (entry.taskName?.name ?? "") ||
        projectId !== entry.projectId ||
        startTime !== toHHMM(entry.startTime) ||
        endTime !== (entry.endTime ? toHHMM(entry.endTime) : "")
        : false;

    // Warn before closing tab with unsaved changes
    useEffect(() => {
        if (!open || !hasChanges) return;
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault();
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [open, hasChanges]);

    // Sync form state when entry changes
    useEffect(() => {
        if (entry) {
            setTaskName(entry.taskName?.name ?? "");
            setProjectId(entry.projectId);
            setStartTime(toHHMM(entry.startTime));
            setEndTime(entry.endTime ? toHHMM(entry.endTime) : "");
            setError(null);
            taskSuggestions.clear();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!entry) return;

        // Validate times
        const parsedStart = parseHHMM(startTime);
        if (!parsedStart) {
            setError("Invalid start time format (HH:mm)");
            return;
        }

        let parsedEnd: { hours: number; minutes: number } | null = null;
        if (endTime) {
            parsedEnd = parseHHMM(endTime);
            if (!parsedEnd) {
                setError("Invalid end time format (HH:mm)");
                return;
            }
        }

        // Build new dates using UTC to avoid timezone mismatch
        const newStart = buildUTCDate(entry.startTime, parsedStart);

        const updateData: UpdateTimeEntryInput = {
            projectId,
            startTime: newStart.toISOString(),
        };

        // Only set taskName if changed
        if (taskName !== entry.taskName?.name) {
            updateData.taskName = taskName;
        }

        if (parsedEnd) {
            const newEnd = buildUTCDate(entry.startTime, parsedEnd);

            if (newEnd <= newStart) {
                setError("End time must be after start time");
                return;
            }
            updateData.endTime = newEnd.toISOString();
        }

        setError(null);
        setIsSaving(true);
        try {
            await onSave(entry.id, updateData);
            onClose();
        } catch {
            setError("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-3xl border-border bg-surface sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Edit Time Entry
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                    {/* Task name with autocomplete */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Task
                        </label>
                        <TaskInput
                            value={taskName}
                            onChange={setTaskName}
                            suggestions={taskSuggestions.suggestions}
                            isLoadingSuggestions={taskSuggestions.isLoading}
                            onSearch={taskSuggestions.search}
                            onSelect={(t) => setTaskName(t.name)}
                            onClearSuggestions={taskSuggestions.clear}
                            placeholder="Task name"
                        />
                    </div>

                    {/* Project */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Project
                        </label>
                        <ProjectSelect
                            projects={projects}
                            value={projectId}
                            onChange={setProjectId}
                        />
                    </div>

                    {/* Time range */}
                    <div className="flex gap-3">
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                Start
                            </label>
                            <Input
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="HH:mm"
                                className="rounded-xl border-border bg-background font-mono text-foreground"
                                maxLength={5}
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                End
                            </label>
                            <Input
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="HH:mm"
                                className="rounded-xl border-border bg-background font-mono text-foreground"
                                maxLength={5}
                            />
                        </div>
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
                            disabled={isSaving || !taskName.trim() || !projectId}
                            className="rounded-xl bg-white text-black hover:bg-white/90"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
