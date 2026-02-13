"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectSelectProps {
    projects: Project[];
    value: string | null;
    onChange: (projectId: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ProjectSelect({
    projects,
    value,
    onChange,
    disabled = false,
    placeholder = "Select project",
}: ProjectSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selected = projects.find((p) => p.id === value);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset highlight when dropdown opens/closes
    useEffect(() => {
        if (isOpen) {
            // Highlight current selection when opening
            const idx = projects.findIndex((p) => p.id === value);
            setHighlightIndex(idx >= 0 ? idx : 0);
        } else {
            setHighlightIndex(-1);
        }
    }, [isOpen, projects, value]);

    const selectProject = useCallback(
        (project: Project) => {
            onChange(project.id);
            setIsOpen(false);
            buttonRef.current?.focus();
        },
        [onChange],
    );

    function handleKeyDown(e: React.KeyboardEvent) {
        if (disabled) return;

        if (!isOpen) {
            // Open on ArrowDown, ArrowUp, Enter, or Space
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightIndex((prev) =>
                    prev < projects.length - 1 ? prev + 1 : 0,
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightIndex((prev) =>
                    prev > 0 ? prev - 1 : projects.length - 1,
                );
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (highlightIndex >= 0 && projects[highlightIndex]) {
                    selectProject(projects[highlightIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                buttonRef.current?.focus();
                break;
        }
    }

    return (
        <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
            <button
                ref={buttonRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={cn(
                    "flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3",
                    "text-sm transition-colors",
                    "hover:border-white/20 focus:border-white/20 focus:ring-1 focus:ring-white/10",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "outline-none min-w-[160px]",
                )}
            >
                {selected ? (
                    <>
                        <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: selected.color }}
                        />
                        <span className="flex-1 truncate text-left font-medium text-foreground">
                            {selected.name}
                        </span>
                    </>
                ) : (
                    <span className="flex-1 text-left text-text-tertiary">
                        {placeholder}
                    </span>
                )}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-text-secondary transition-transform",
                        isOpen && "rotate-180",
                    )}
                    strokeWidth={1.5}
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                >
                    {projects.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-text-secondary">
                            No projects yet
                        </div>
                    ) : (
                        projects.map((project, index) => (
                            <button
                                key={project.id}
                                role="option"
                                aria-selected={project.id === value}
                                onClick={() => selectProject(project)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                                    index === highlightIndex
                                        ? "bg-surface-hover text-foreground"
                                        : project.id === value
                                            ? "text-foreground"
                                            : "text-text-secondary hover:bg-surface-hover hover:text-foreground",
                                )}
                            >
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                />
                                <span className="truncate">{project.name}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
