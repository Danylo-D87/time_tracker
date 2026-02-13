import { NextResponse } from "next/server";
import * as timeEntryRepo from "@/repositories/time-entry-repository";

// GET /api/time-entries/active — get the currently running timer
// Used to restore timer state after page reload
export async function GET() {
    try {
        const active = await timeEntryRepo.findActive();

        // Return null (not 404) when no active timer — this is a normal state
        return NextResponse.json(active);
    } catch (error) {
        console.error("GET /api/time-entries/active error:", error);
        return NextResponse.json(
            { error: "Failed to fetch active timer" },
            { status: 500 },
        );
    }
}
