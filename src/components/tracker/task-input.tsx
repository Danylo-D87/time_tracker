"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TaskName } from "@/types";

interface TaskInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: TaskName[];
    isLoadingSuggestions: boolean;
    onSearch: (query: string) => void;
    onSelect: (taskName: TaskName) => void;
    onClearSuggestions: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export function TaskInput({
    value,
    onChange,
    suggestions,
    isLoadingSuggestions,
    onSearch,
    onSelect,
    onClearSuggestions,
    disabled = false,
    placeholder = "What are you working on?",
}: TaskInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        onChange(val);
        onSearch(val);
        setIsOpen(true);
        setHighlightIndex(-1);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1,
            );
        } else if (e.key === "Enter" && highlightIndex >= 0) {
            e.preventDefault();
            const selected = suggestions[highlightIndex];
            if (selected) {
                onSelect(selected);
                onChange(selected.name);
                setIsOpen(false);
                onClearSuggestions();
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    }

    function handleSelectSuggestion(task: TaskName) {
        onSelect(task);
        onChange(task.name);
        setIsOpen(false);
        onClearSuggestions();
        inputRef.current?.focus();
    }

    const showDropdown = isOpen && (suggestions.length > 0 || isLoadingSuggestions);

    return (
        <div className="relative flex-1">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (value.trim()) {
                        onSearch(value);
                        setIsOpen(true);
                    }
                }}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                    "w-full rounded-2xl border border-border bg-surface px-4 py-3",
                    "text-sm font-medium text-foreground placeholder:text-text-tertiary",
                    "outline-none transition-colors",
                    "focus:border-white/20 focus:ring-1 focus:ring-white/10",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                )}
                autoComplete="off"
            />

            {/* Autocomplete dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                >
                    {isLoadingSuggestions ? (
                        <div className="px-4 py-3 text-sm text-text-secondary">
                            Searching...
                        </div>
                    ) : (
                        suggestions.map((task, index) => (
                            <button
                                key={task.id}
                                onClick={() => handleSelectSuggestion(task)}
                                className={cn(
                                    "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                                    index === highlightIndex
                                        ? "bg-surface-hover text-foreground"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-foreground",
                                )}
                            >
                                {task.name}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
