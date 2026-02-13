import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to human-readable string.
 * @example formatDuration(3661) // "1:01:01"
 * @example formatDuration(90)   // "0:01:30"
 */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hours}:${mm}:${ss}`;
}

/**
 * Format duration in seconds to decimal hours.
 * @example formatDurationHours(5400) // "1.50"
 */
export function formatDurationHours(totalSeconds: number): string {
  return (totalSeconds / 3600).toFixed(2);
}

/**
 * Calculate duration between two dates in seconds.
 * Returns 0 if endTime is before startTime.
 */
export function calculateDuration(
  startTime: Date | string,
  endTime: Date | string,
): number {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}

/**
 * Compute elapsed seconds from a start time to now.
 * Used by the timer to calculate running time from server startTime.
 */
export function elapsedSince(startTime: Date | string): number {
  const start =
    startTime instanceof Date ? startTime : new Date(startTime);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
}

/**
 * Convert an inclusive "to" date (YYYY-MM-DD) to exclusive by adding 1 day.
 * Used in report date ranges where "to" is inclusive in the UI but exclusive in queries.
 * @example toExclusiveDate("2026-02-13") // "2026-02-14"
 */
export function toExclusiveDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0]!;
}
