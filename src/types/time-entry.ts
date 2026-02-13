import type { Project } from "./project";
import type { TaskName } from "./task-name";

export interface TimeEntry {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number | null; // in seconds
    projectId: string;
    project?: Project;
    taskNameId: string;
    taskName?: TaskName;
    createdAt: string;
    updatedAt: string;
}
