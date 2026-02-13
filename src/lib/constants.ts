export const APP_NAME = "Time Tracker";

export const PROJECT_COLORS = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#A855F7", // Purple
] as const;

/** Default color for new projects (first from PROJECT_COLORS) */
export const DEFAULT_PROJECT_COLOR = PROJECT_COLORS[0];

/** Maximum length for task names */
export const MAX_TASK_NAME_LENGTH = 200;

/** Maximum length for project names */
export const MAX_PROJECT_NAME_LENGTH = 100;

/** Debounce delay for autocomplete search (ms) */
export const AUTOCOMPLETE_DEBOUNCE_MS = 300;

export const REPORT_PERIODS = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
} as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[keyof typeof REPORT_PERIODS];

export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT = "yyyy-MM-dd";
export const DISPLAY_DATE_FORMAT = "dd MMM yyyy";
