import type { Project } from "./project";
import type { TaskName } from "./task-name";

export interface ReportEntry {
    project: Project;
    taskName: TaskName;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
}

export interface ReportSummary {
    totalDuration: number; // in seconds
    projectBreakdown: ProjectReportItem[];
    entries: ReportEntry[];
}

export interface ProjectReportItem {
    project: Project;
    totalDuration: number; // in seconds
    percentage: number;
    taskCount: number;
}

export interface ReportFilters {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
}
