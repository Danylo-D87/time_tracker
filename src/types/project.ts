export interface Project {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectWithStats extends Project {
    totalEntries: number;
    totalDuration: number; // in seconds
}
