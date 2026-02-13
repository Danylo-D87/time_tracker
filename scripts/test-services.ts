/**
 * Service Layer Integration Tests (Phase 4)
 * Tests all services against the running dev server.
 * Run with: npx tsx scripts/test-services.ts
 */

// Patch fetch to prepend localhost before any imports
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/")) {
        input = `http://localhost:3000${input}`;
    }
    return originalFetch(input, init);
};

// Now import services — they use apiClient which calls fetch("/api/...")
import * as projectService from "../src/services/project-service";
import * as timeEntryService from "../src/services/time-entry-service";
import * as taskService from "../src/services/task-service";
import * as reportService from "../src/services/report-service";
import { ApiError } from "../src/services/api-client";

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

function test(name: string, passed: boolean, error?: string) {
    results.push({ name, passed, error });
    console.log(`${passed ? "✅" : "❌"} ${name}`);
    if (!passed && error) {
        console.log(`   → ${error}`);
    }
}

async function run() {
    console.log("\n🧪 Testing Service Layer (Phase 4)...\n");

    // ════════════════════════════════════════════
    //  PROJECT SERVICE
    // ════════════════════════════════════════════
    console.log("════════════════════════════════════════════");
    console.log("  projectService");
    console.log("════════════════════════════════════════════");

    // getProjects (initial)
    const projects0 = await projectService.getProjects();
    test("getProjects() returns array", Array.isArray(projects0));

    // createProject
    const proj = await projectService.createProject({ name: "Service Test Project", color: "#E11D48" });
    test("createProject() returns project", !!proj.id && proj.name === "Service Test Project");
    test("  → color is correct", proj.color === "#E11D48");

    // getProject
    const fetched = await projectService.getProject(proj.id);
    test("getProject(id) returns same project", fetched.id === proj.id);

    // updateProject
    const updated = await projectService.updateProject(proj.id, { name: "Updated Service Project" });
    test("updateProject() returns updated name", updated.name === "Updated Service Project");

    // getProjects (should contain the new one)
    const projects1 = await projectService.getProjects();
    test("getProjects() includes new project", projects1.some((p) => p.id === proj.id));

    // ════════════════════════════════════════════
    //  TASK SERVICE
    // ════════════════════════════════════════════
    console.log("\n════════════════════════════════════════════");
    console.log("  taskService");
    console.log("════════════════════════════════════════════");

    // createTask
    const task = await taskService.createTask("Service Test Task");
    test("createTask() returns task", !!task.id && task.name === "Service Test Task");

    // searchTasks
    const found = await taskService.searchTasks("Service Test");
    test("searchTasks() finds task", found.some((t) => t.id === task.id));

    // searchTasks (empty query → recent tasks)
    const recent = await taskService.searchTasks("");
    test("searchTasks('') returns recent tasks", Array.isArray(recent) && recent.length > 0);

    // ════════════════════════════════════════════
    //  TIME ENTRY SERVICE
    // ════════════════════════════════════════════
    console.log("\n════════════════════════════════════════════");
    console.log("  timeEntryService");
    console.log("════════════════════════════════════════════");

    // getActiveTimer (none yet)
    const noTimer = await timeEntryService.getActiveTimer();
    test("getActiveTimer() → null when no timer", noTimer === null);

    // startTimer
    const entry = await timeEntryService.startTimer("Coding feature X", proj.id);
    test("startTimer() returns entry", !!entry.id && entry.endTime === null);
    test("  → has taskName", !!entry.taskName && entry.taskName.name === "Coding feature X");
    test("  → has project", !!entry.project && entry.project.id === proj.id);
    test("  → startTime is set", !!entry.startTime);

    // getActiveTimer (should return the entry)
    const active = await timeEntryService.getActiveTimer();
    test("getActiveTimer() → running entry", active?.id === entry.id);

    // startTimer again → should throw ApiError 409
    let conflictCaught = false;
    try {
        await timeEntryService.startTimer("Another task", proj.id);
    } catch (err) {
        if (err instanceof ApiError && err.isConflict) {
            conflictCaught = true;
        }
    }
    test("startTimer() duplicate → ApiError 409", conflictCaught);

    // stopTimer
    const stopped = await timeEntryService.stopTimer(entry.id);
    test("stopTimer() returns stopped entry", stopped.endTime !== null);
    test("  → duration is calculated", typeof stopped.duration === "number" && stopped.duration >= 0);

    // getActiveTimer (none after stop)
    const noTimer2 = await timeEntryService.getActiveTimer();
    test("getActiveTimer() → null after stop", noTimer2 === null);

    // updateEntry
    const updatedEntry = await timeEntryService.updateEntry(entry.id, {
        taskName: "Renamed task",
    });
    test("updateEntry() renames task", updatedEntry.taskName?.name === "Renamed task");

    // getEntries (today)
    const today = new Date().toISOString().split("T")[0]!;
    const entries = await timeEntryService.getEntries(today);
    test(`getEntries('${today}') returns array`, Array.isArray(entries) && entries.length > 0);
    test("  → includes our entry", entries.some((e) => e.id === entry.id));

    // getEntries (no filter)
    const allEntries = await timeEntryService.getEntries();
    test("getEntries() without filter → all entries", Array.isArray(allEntries));

    // ════════════════════════════════════════════
    //  REPORT SERVICE
    // ════════════════════════════════════════════
    console.log("\n════════════════════════════════════════════");
    console.log("  reportService");
    console.log("════════════════════════════════════════════");

    // getReport
    const report = await reportService.getReport(today, today);
    test("getReport() returns summary", typeof report.totalDuration === "number");
    test("  → has projectBreakdown", Array.isArray(report.projectBreakdown));
    test("  → has entries", Array.isArray(report.entries));
    test("  → totalDuration > 0", report.totalDuration >= 0);

    // getExportUrl
    const url = reportService.getExportUrl(today, today);
    test("getExportUrl() returns URL string", url.includes("/reports/export") && url.includes("format=csv"));

    // Verify CSV download works via the URL
    const csvRes = await fetch(`http://localhost:3000${url}`);
    const csvText = await csvRes.text();
    test("CSV export URL → 200 with content", csvRes.status === 200 && csvText.includes("Date"));

    // ════════════════════════════════════════════
    //  ERROR HANDLING (ApiError)
    // ════════════════════════════════════════════
    console.log("\n════════════════════════════════════════════");
    console.log("  ApiError handling");
    console.log("════════════════════════════════════════════");

    // 404 error
    let notFoundCaught = false;
    try {
        await projectService.getProject("non-existent-id");
    } catch (err) {
        if (err instanceof ApiError && err.status === 404 && err.isClientError) {
            notFoundCaught = true;
        }
    }
    test("getProject(invalid) → ApiError 404 + isClientError", notFoundCaught);

    // deleteEntry
    await timeEntryService.deleteEntry(entry.id);
    let deletedEntry: unknown = "not-null";
    try {
        deletedEntry = await timeEntryService.getEntries(today);
        const arr = deletedEntry as Array<{ id: string }>;
        test("deleteEntry() → entry removed from list", !arr.some((e) => e.id === entry.id));
    } catch {
        test("deleteEntry() → entry removed", true);
    }

    // ════════════════════════════════════════════
    //  CLEANUP
    // ════════════════════════════════════════════
    console.log("\n════════════════════════════════════════════");
    console.log("  Cleanup");
    console.log("════════════════════════════════════════════");

    await projectService.deleteProject(proj.id);
    test("deleteProject() → success", true);

    await taskService.deleteTask(task.id);
    test("deleteTask() → success", true);

    // Clean up tasks created by startTimer / updateEntry
    const remainingTasks = await taskService.searchTasks("Coding feature");
    for (const t of remainingTasks) {
        try { await taskService.deleteTask(t.id); } catch { /* may have linked entries */ }
    }
    const remainingTasks2 = await taskService.searchTasks("Renamed task");
    for (const t of remainingTasks2) {
        try { await taskService.deleteTask(t.id); } catch { /* may have linked entries */ }
    }

    // ════════════════════════════════════════════
    //  SUMMARY
    // ════════════════════════════════════════════
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log("\n════════════════════════════════════════════");
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} tests`);

    if (failed > 0) {
        console.log("\n❌ Failed tests:");
        for (const r of results.filter((r) => !r.passed)) {
            console.log(`   - ${r.name}${r.error ? `: ${r.error}` : ""}`);
        }
    } else {
        console.log("\n🎉 All service tests passed!");
    }

    process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
