import { z } from "zod";
import { DEFAULT_PROJECT_COLOR } from "@/lib/constants";

// ── Project Schemas ──────────────────────────────────────────────────

export const createProjectSchema = z.object({
    name: z
        .string()
        .min(1, "Project name is required")
        .max(100, "Project name is too long"),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid HEX color")
        .default(DEFAULT_PROJECT_COLOR),
});

export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(1, "Project name is required")
        .max(100, "Project name is too long")
        .optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid HEX color")
        .optional(),
});

// ── TimeEntry Schemas ────────────────────────────────────────────────

export const createTimeEntrySchema = z.object({
    taskName: z
        .string()
        .min(1, "Task name is required")
        .max(200, "Task name is too long"),
    projectId: z.string().min(1, "Project is required"),
    startTime: z.string().datetime().optional(), // defaults to now on server
});

export const updateTimeEntrySchema = z.object({
    taskName: z
        .string()
        .min(1, "Task name is required")
        .max(200, "Task name is too long")
        .optional(),
    projectId: z.string().min(1, "Project is required").optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().nullable().optional(),
    duration: z.number().int().min(0).nullable().optional(),
});

export const stopTimerSchema = z.object({
    endTime: z.string().datetime().optional(), // defaults to now on server
});

// ── TaskName Schemas ─────────────────────────────────────────────────

export const createTaskNameSchema = z.object({
    name: z
        .string()
        .min(1, "Task name is required")
        .max(200, "Task name is too long"),
});

export const searchTaskNameSchema = z.object({
    q: z.string().max(200).optional().default(""),
});

// ── Report Schemas ───────────────────────────────────────────────────

export const reportQuerySchema = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
}).refine((data) => data.from <= data.to, {
    message: "'from' date must not be after 'to' date",
    path: ["from"],
});

// ── Type Exports ─────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type StopTimerInput = z.infer<typeof stopTimerSchema>;
export type CreateTaskNameInput = z.infer<typeof createTaskNameSchema>;
export type SearchTaskNameInput = z.infer<typeof searchTaskNameSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
