"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { useTimer } from "@/hooks/use-timer";
import { useTimeEntries } from "@/hooks/use-time-entries";
import { useProjects } from "@/hooks/use-projects";
import { useTaskSuggestions } from "@/hooks/use-task-suggestions";
import { useAppStore } from "@/store/app-store";

import { TimerControls } from "@/components/tracker/timer-controls";
import { TaskInput } from "@/components/tracker/task-input";
import { ProjectSelect } from "@/components/tracker/project-select";
import { TimeEntryList } from "@/components/tracker/time-entry-list";
import { TimeEntryEdit } from "@/components/tracker/time-entry-edit";
import { ProjectGroup } from "@/components/tracker/project-group";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DISPLAY_DATE_FORMAT, DATE_FORMAT } from "@/lib/constants";
import type { TimeEntry, Project } from "@/types";
import type { UpdateTimeEntryInput } from "@/lib/validators";

export default function TrackerPage() {
    const selectedDate = useAppStore((s) => s.selectedDate);
    const setSelectedDate = useAppStore((s) => s.setSelectedDate);

    const timer = useTimer();
    const { entries, isLoading, totalDuration, updateEntry, deleteEntry, reload } =
        useTimeEntries(selectedDate);
    const { projects } = useProjects();
    const taskSuggestions = useTaskSuggestions();

    // Local form state for starting a new timer
    const [taskName, setTaskName] = useState("");
    const [projectId, setProjectId] = useState<string | null>(null);

    // Edit dialog state
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

    // View toggle: list vs grouped
    const [groupByProject, setGroupByProject] = useState(false);

    // Delete confirmation state
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const addToast = useAppStore((s) => s.addToast);

    const dateObj = new Date(`${selectedDate}T00:00:00`);
    const todayStr = isToday(dateObj);

    // ── Timer actions ──────────────────────────────────────────
    const handleStart = useCallback(async () => {
        if (!taskName.trim() || !projectId) return;
        const result = await timer.startTimer(taskName.trim(), projectId);
        if (result) {
            addToast("success", `Timer started: ${taskName.trim()}`);
            setTaskName("");
            reload();
        }
    }, [taskName, projectId, timer, reload, addToast]);

    const handleStop = useCallback(async () => {
        const stopped = await timer.stopTimer();
        if (stopped) {
            addToast("success", "Timer stopped");
        }
        reload();
    }, [timer, reload, addToast]);

    // ── Entry actions ──────────────────────────────────────────
    const handleEdit = useCallback((entry: TimeEntry) => {
        setEditingEntry(entry);
    }, []);

    const handleSave = useCallback(
        async (id: string, data: UpdateTimeEntryInput) => {
            await updateEntry(id, data);
        },
        [updateEntry],
    );

    const handleDeleteRequest = useCallback((id: string) => {
        setDeleteTargetId(id);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTargetId) return;
        await deleteEntry(deleteTargetId);
        setDeleteTargetId(null);
    }, [deleteTargetId, deleteEntry]);

    // ── Keyboard shortcut: Space to start/stop timer ───────────
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Ignore when typing in an input, textarea, or contentEditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable ||
                target.closest("[role=dialog]")
            ) {
                return;
            }

            if (e.code === "Space") {
                e.preventDefault();
                if (timer.isRunning) {
                    handleStop();
                } else if (taskName.trim() && projectId) {
                    handleStart();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [timer.isRunning, taskName, projectId, handleStart, handleStop]);

    // ── Date navigation ────────────────────────────────────────
    const goPrev = () =>
        setSelectedDate(format(subDays(dateObj, 1), DATE_FORMAT));
    const goNext = () =>
        setSelectedDate(format(addDays(dateObj, 1), DATE_FORMAT));
    const goToday = () =>
        setSelectedDate(format(new Date(), DATE_FORMAT));

    // ── Group entries by project ───────────────────────────────
    const groupedEntries = entries.reduce<
        Map<string, { project: Project; entries: TimeEntry[]; totalDuration: number }>
    >((map, entry) => {
        if (!entry.project) return map;
        const existing = map.get(entry.projectId);
        if (existing) {
            existing.entries.push(entry);
            existing.totalDuration += entry.duration ?? 0;
        } else {
            map.set(entry.projectId, {
                project: entry.project,
                entries: [entry],
                totalDuration: entry.duration ?? 0,
            });
        }
        return map;
    }, new Map());

    const canStart = !timer.isRunning && taskName.trim().length > 0 && !!projectId;

    return (
        <div className="flex flex-col gap-6">
            {/* ═══ Timer Input Bar ═══ */}
            {timer.isLoading ? (
                /* Skeleton while restoring timer from server */
                <div className="rounded-3xl border border-border bg-surface p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            <Skeleton className="h-11 flex-1 rounded-xl" />
                            <Skeleton className="h-11 w-[180px] rounded-xl" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-[120px] rounded-lg" />
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl border border-border bg-surface p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Task input + project select */}
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            <TaskInput
                                value={taskName}
                                onChange={setTaskName}
                                suggestions={taskSuggestions.suggestions}
                                isLoadingSuggestions={taskSuggestions.isLoading}
                                onSearch={taskSuggestions.search}
                                onSelect={(t) => setTaskName(t.name)}
                                onClearSuggestions={taskSuggestions.clear}
                                disabled={timer.isRunning}
                            />
                            <ProjectSelect
                                projects={projects}
                                value={projectId}
                                onChange={setProjectId}
                                disabled={timer.isRunning}
                            />
                        </div>

                        {/* Timer controls */}
                        <TimerControls
                            isRunning={timer.isRunning}
                            isLoading={timer.isLoading}
                            formattedElapsed={timer.formattedElapsed}
                            onStart={handleStart}
                            onStop={handleStop}
                            disabled={!timer.isRunning && !canStart}
                        />
                    </div>

                    {/* Keyboard shortcut hint */}
                    {!timer.isRunning && canStart && (
                        <p className="mt-2 text-center text-[10px] tracking-wider text-text-tertiary sm:text-left">
                            Press <kbd className="rounded bg-surface-hover px-1 py-0.5 font-mono text-[10px]">Space</kbd> to start
                        </p>
                    )}
                </div>
            )}

            {/* ═══ Date Navigation ═══ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrev}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface hover:text-foreground"
                        aria-label="Previous day"
                    >
                        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
                        {todayStr ? "Today" : format(dateObj, DISPLAY_DATE_FORMAT)}
                    </span>
                    <button
                        onClick={goNext}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface hover:text-foreground"
                        aria-label="Next day"
                    >
                        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {!todayStr && (
                        <button
                            onClick={goToday}
                            className="rounded-xl px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface hover:text-foreground"
                        >
                            Today
                        </button>
                    )}

                    {/* View toggle */}
                    <div className="flex rounded-xl border border-border bg-surface p-0.5">
                        <button
                            onClick={() => setGroupByProject(false)}
                            className={cn(
                                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                                !groupByProject
                                    ? "bg-surface-hover text-foreground"
                                    : "text-text-secondary hover:text-foreground",
                            )}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setGroupByProject(true)}
                            className={cn(
                                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                                groupByProject
                                    ? "bg-surface-hover text-foreground"
                                    : "text-text-secondary hover:text-foreground",
                            )}
                        >
                            Grouped
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ Entries ═══ */}
            {groupByProject ? (
                <div className="flex flex-col gap-3">
                    {Array.from(groupedEntries.values()).length === 0 ? (
                        <TimeEntryList
                            entries={[]}
                            isLoading={isLoading}
                            totalDuration={0}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                        />
                    ) : (
                        Array.from(groupedEntries.values()).map((group, index) => (
                            <div
                                key={group.project.id}
                                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                                style={{ animationDelay: `${index * 70}ms`, animationDuration: "300ms" }}
                            >
                                <ProjectGroup
                                    project={group.project}
                                    entries={group.entries}
                                    totalDuration={group.totalDuration}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteRequest}
                                />
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <TimeEntryList
                    entries={entries}
                    isLoading={isLoading}
                    totalDuration={totalDuration}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            )}

            {/* ═══ Edit Dialog ═══ */}
            <TimeEntryEdit
                entry={editingEntry}
                projects={projects}
                open={!!editingEntry}
                onClose={() => setEditingEntry(null)}
                onSave={handleSave}
            />

            {/* ═══ Delete Confirmation Dialog ═══ */}
            <ConfirmDialog
                open={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Time Entry"
                description="This time entry will be permanently deleted. This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
