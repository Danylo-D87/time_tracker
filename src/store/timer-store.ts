import { create } from "zustand";
import * as timeEntryService from "@/services/time-entry-service";
import { elapsedSince } from "@/lib/utils";
import type { TimeEntry } from "@/types";

// ── Timer Store ──────────────────────────────────────────────────────
// Server-driven Zustand store for the active timer.
// Source of truth: TimeEntry with endTime IS NULL in Supabase.
// The client store mirrors server state and ticks elapsed every second.

export interface TimerState {
    /** Whether a timer is currently running */
    isRunning: boolean;
    /** ID of the active TimeEntry on the server */
    activeEntryId: string | null;
    /** startTime from the server record (ISO string) */
    startTime: string | null;
    /** Elapsed seconds — computed as Math.floor((now - startTime) / 1000) */
    elapsed: number;
    /** Current task name for the running timer */
    currentTaskName: string;
    /** Current project ID for the running timer */
    currentProjectId: string | null;
    /** Loading state while restoring from server */
    isLoading: boolean;
    /** Error message from the last failed action */
    error: string | null;
}

export interface TimerActions {
    /**
     * ⭐ MAIN ACTION: Restore timer from server on mount/reload.
     * Calls GET /api/time-entries/active.
     * If active entry exists → sets isRunning=true, startTime,
     * computes elapsed = Math.floor((Date.now() - startTime) / 1000).
     * If no active entry → sets isRunning=false, resets state.
     */
    restore: () => Promise<void>;

    /**
     * Start a new timer.
     * 1. Checks isRunning — if true, blocks (single timer!)
     * 2. POST /api/time-entries → gets created entry with server startTime
     * 3. Stores activeEntryId, startTime from server response
     */
    start: (taskName: string, projectId: string) => Promise<TimeEntry>;

    /**
     * Stop the running timer.
     * 1. POST /api/time-entries/:id/stop
     * 2. Server computes duration = endTime - startTime
     * 3. Resets store
     */
    stop: () => Promise<TimeEntry | null>;

    /**
     * Tick — update elapsed from server startTime.
     * elapsed = Math.floor((Date.now() - startTime) / 1000)
     * Does NOT depend on previous elapsed — always recomputes from startTime.
     */
    tick: () => void;

    /** Full reset of the store */
    reset: () => void;
}

const initialState: TimerState = {
    isRunning: false,
    activeEntryId: null,
    startTime: null,
    elapsed: 0,
    currentTaskName: "",
    currentProjectId: null,
    isLoading: false,
    error: null,
};

export const useTimerStore = create<TimerState & TimerActions>()((set, get) => ({
    ...initialState,

    restore: async () => {
        set({ isLoading: true, error: null });
        try {
            const active = await timeEntryService.getActiveTimer();

            if (active && active.endTime === null) {
                // Active timer found — restore state from server
                set({
                    isRunning: true,
                    activeEntryId: active.id,
                    startTime: active.startTime,
                    elapsed: elapsedSince(active.startTime),
                    currentTaskName: active.taskName?.name ?? "",
                    currentProjectId: active.projectId,
                    isLoading: false,
                });
            } else {
                // No active timer — reset
                set({
                    ...initialState,
                    isLoading: false,
                });
            }
        } catch {
            set({
                ...initialState,
                isLoading: false,
                error: "Failed to restore timer from server",
            });
        }
    },

    start: async (taskName: string, projectId: string) => {
        const { isRunning } = get();

        // Level 2 guard: store-level single-timer check
        if (isRunning) {
            throw new Error("A timer is already running. Stop it first.");
        }

        set({ isLoading: true, error: null });
        try {
            // POST to server — Level 3 guard (409 if already active)
            const entry = await timeEntryService.startTimer(taskName, projectId);

            set({
                isRunning: true,
                activeEntryId: entry.id,
                startTime: entry.startTime,
                elapsed: elapsedSince(entry.startTime),
                currentTaskName: entry.taskName?.name ?? taskName,
                currentProjectId: entry.projectId,
                isLoading: false,
            });

            return entry;
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : "Failed to start timer",
            });
            throw err;
        }
    },

    stop: async () => {
        const { activeEntryId, isRunning } = get();

        if (!isRunning || !activeEntryId) {
            return null;
        }

        set({ isLoading: true, error: null });
        try {
            const stopped = await timeEntryService.stopTimer(activeEntryId);

            // Reset store after successful stop
            set({
                ...initialState,
                isLoading: false,
            });

            return stopped;
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : "Failed to stop timer",
            });
            throw err;
        }
    },

    tick: () => {
        const { isRunning, startTime } = get();
        if (!isRunning || !startTime) return;

        // Always recompute from startTime — never depend on previous elapsed
        set({ elapsed: elapsedSince(startTime) });
    },

    reset: () => {
        set(initialState);
    },
}));
