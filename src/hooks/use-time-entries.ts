"use client";

import { useState, useEffect, useCallback } from "react";
import * as timeEntryService from "@/services/time-entry-service";
import { useAppStore } from "@/store/app-store";
import type { TimeEntry } from "@/types";
import type { UpdateTimeEntryInput } from "@/lib/validators";

// ── useTimeEntries Hook ───────────────────────────────────────────
// CRUD operations for time entries.
// Loads entries for a given date, supports update/delete with auto-reload.

export function useTimeEntries(date?: string) {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const addToast = useAppStore((s) => s.addToast);

    /** Load entries for the given date */
    const loadEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await timeEntryService.getEntries(date);
            setEntries(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load entries";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [date]);

    // Auto-load when date changes
    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    /** Update a time entry and reload the list */
    const updateEntry = useCallback(
        async (id: string, data: UpdateTimeEntryInput) => {
            try {
                const updated = await timeEntryService.updateEntry(id, data);
                // Optimistic: replace in the local list
                setEntries((prev) =>
                    prev.map((e) => (e.id === id ? updated : e)),
                );
                addToast("success", "Entry updated");
                return updated;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update entry";
                addToast("error", message);
                throw err;
            }
        },
        [addToast],
    );

    /** Delete a time entry and remove from local list */
    const deleteEntry = useCallback(
        async (id: string) => {
            try {
                await timeEntryService.deleteEntry(id);
                // Optimistic: remove from local list
                setEntries((prev) => prev.filter((e) => e.id !== id));
                addToast("success", "Entry deleted");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to delete entry";
                addToast("error", message);
                throw err;
            }
        },
        [addToast],
    );

    /** Total duration of all entries in seconds */
    const totalDuration = entries.reduce(
        (sum, e) => sum + (e.duration ?? 0),
        0,
    );

    return {
        entries,
        isLoading,
        error,
        totalDuration,
        reload: loadEntries,
        updateEntry,
        deleteEntry,
    };
}
