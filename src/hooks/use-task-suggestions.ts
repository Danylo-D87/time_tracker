"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as taskService from "@/services/task-service";
import { AUTOCOMPLETE_DEBOUNCE_MS } from "@/lib/constants";
import type { TaskName } from "@/types";

// ── useTaskSuggestions Hook ─────────────────────────────────────────
// Debounced task name autocomplete with result caching.
// Searches via GET /api/tasks?q=... with 300ms debounce.

export function useTaskSuggestions() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<TaskName[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const cacheRef = useRef<Map<string, TaskName[]>>(new Map());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Search with debounce and caching
    useEffect(() => {
        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const trimmed = query.trim();

        // Check cache first
        const cached = cacheRef.current.get(trimmed);
        if (cached) {
            setSuggestions(cached);
            return;
        }

        // Debounced search
        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await taskService.searchTasks(trimmed);
                cacheRef.current.set(trimmed, results);
                setSuggestions(results);
            } catch {
                // Silently fail — autocomplete is non-critical
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, AUTOCOMPLETE_DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    /** Update the search query (triggers debounced search) */
    const search = useCallback((q: string) => {
        setQuery(q);
    }, []);

    /** Clear suggestions and query */
    const clear = useCallback(() => {
        setQuery("");
        setSuggestions([]);
    }, []);

    /** Invalidate the cache (e.g., after creating a new task) */
    const invalidateCache = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    return {
        query,
        suggestions,
        isLoading,
        search,
        clear,
        invalidateCache,
    };
}
