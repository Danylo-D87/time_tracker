"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useAppStore } from "@/store/app-store";
import { formatDuration } from "@/lib/utils";
import type { TimeEntry } from "@/types";

// ── useTimer Hook ─────────────────────────────────────────────────
// Timer logic with server-driven persistence.
// On first mount calls store.restore() to recover timer from server.
// Runs setInterval(tick, 1000) when isRunning, clears on stop/unmount.
// elapsed is ALWAYS recomputed from server startTime — never drifts.

export function useTimer() {
    const {
        isRunning,
        activeEntryId,
        startTime,
        elapsed,
        currentTaskName,
        currentProjectId,
        isLoading,
        error,
        restore,
        start,
        stop,
        tick,
        reset,
    } = useTimerStore();

    const addToast = useAppStore((s) => s.addToast);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const restoredRef = useRef(false);

    // Restore timer from server on first mount
    useEffect(() => {
        if (!restoredRef.current) {
            restoredRef.current = true;
            restore();
        }
    }, [restore]);

    // Tick interval: runs every second when isRunning
    useEffect(() => {
        if (isRunning) {
            // Tick immediately to avoid 1-second delay
            tick();
            intervalRef.current = setInterval(tick, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, tick]);

    /** Start a new timer with validation */
    const startTimer = useCallback(
        async (taskName: string, projectId: string): Promise<TimeEntry | null> => {
            try {
                const entry = await start(taskName, projectId);
                return entry;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to start timer";
                addToast("error", message);
                return null;
            }
        },
        [start, addToast],
    );

    /** Stop the running timer (with retry on failure) */
    const stopTimer = useCallback(async (): Promise<TimeEntry | null> => {
        try {
            const stopped = await stop();
            return stopped;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to stop timer";
            addToast("error", `${message}. Please try again.`);
            return null;
        }
    }, [stop, addToast]);

    return {
        // State
        isRunning,
        activeEntryId,
        startTime,
        elapsed,
        currentTaskName,
        currentProjectId,
        isLoading,
        error,
        /** Pre-formatted elapsed time string ("H:MM:SS") */
        formattedElapsed: formatDuration(elapsed),

        // Actions
        startTimer,
        stopTimer,
        reset,
        restore,
    };
}
