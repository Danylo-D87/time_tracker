/**
 * API Route Integration Tests
 * Run with: npx tsx scripts/test-api.ts
 */

const BASE = "http://localhost:3000";

interface TestResult {
    name: string;
    passed: boolean;
    status?: number;
    body?: unknown;
    error?: string;
}

const results: TestResult[] = [];

async function req(
    method: string,
    path: string,
    body?: unknown,
): Promise<{ status: number; body: unknown }> {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = text;
    }
    return { status: res.status, body: parsed };
}

function test(name: string, passed: boolean, status?: number, body?: unknown) {
    results.push({ name, passed, status, body: passed ? undefined : body });
    const icon = passed ? "✅" : "❌";
    console.log(`${icon} ${name}${status ? ` (${status})` : ""}`);
    if (!passed && body) {
        console.log(`   Response:`, JSON.stringify(body).slice(0, 200));
    }
}

async function run() {
    console.log("\n🚀 Testing API Routes...\n");
    console.log("════════════════════════════════════════════");
    console.log("  PROJECTS");
    console.log("════════════════════════════════════════════");

    // --- PROJECTS ---

    // 1. GET projects (empty or seed data)
    const p1 = await req("GET", "/api/projects");
    test("GET /api/projects → 200", p1.status === 200, p1.status, p1.body);

    // 2. POST create project
    const p2 = await req("POST", "/api/projects", { name: "Test Project", color: "#FF5733" });
    test("POST /api/projects → 201", p2.status === 201, p2.status, p2.body);
    const projectId = (p2.body as Record<string, unknown>)?.id as string;

    // 3. POST with invalid data
    const p3 = await req("POST", "/api/projects", { name: "" });
    test("POST /api/projects (invalid) → 400", p3.status === 400, p3.status, p3.body);

    // 4. GET single project
    const p4 = await req("GET", `/api/projects/${projectId}`);
    test("GET /api/projects/:id → 200", p4.status === 200, p4.status, p4.body);

    // 5. PUT update project
    const p5 = await req("PUT", `/api/projects/${projectId}`, { name: "Updated Project" });
    test("PUT /api/projects/:id → 200", p5.status === 200 && (p5.body as Record<string, unknown>)?.name === "Updated Project", p5.status, p5.body);

    // 6. GET non-existent project
    const p6 = await req("GET", "/api/projects/non-existent-id");
    test("GET /api/projects/:id (404) → 404", p6.status === 404, p6.status, p6.body);

    console.log("\n════════════════════════════════════════════");
    console.log("  TASKS");
    console.log("════════════════════════════════════════════");

    // --- TASKS ---

    // 7. POST create task
    const t1 = await req("POST", "/api/tasks", { name: "Design mockups" });
    test("POST /api/tasks → 201", t1.status === 201, t1.status, t1.body);

    // 8. POST duplicate task (idempotent → 200)
    const t2 = await req("POST", "/api/tasks", { name: "Design mockups" });
    test("POST /api/tasks (duplicate) → 200", t2.status === 200, t2.status, t2.body);

    // 9. GET search tasks
    const t3 = await req("GET", "/api/tasks?q=design");
    test("GET /api/tasks?q=design → 200 with results", t3.status === 200 && Array.isArray(t3.body) && (t3.body as unknown[]).length > 0, t3.status, t3.body);

    // 10. GET search tasks (empty query → recent)
    const t4 = await req("GET", "/api/tasks?q=");
    test("GET /api/tasks?q= → 200", t4.status === 200, t4.status, t4.body);

    console.log("\n════════════════════════════════════════════");
    console.log("  TIME ENTRIES + TIMER");
    console.log("════════════════════════════════════════════");

    // --- TIME ENTRIES ---

    // 11. GET active timer (none yet)
    const te0 = await req("GET", "/api/time-entries/active");
    test("GET /api/time-entries/active (none) → 200 null", te0.status === 200 && te0.body === null, te0.status, te0.body);

    // 12. POST start timer
    const te1 = await req("POST", "/api/time-entries", {
        taskName: "Write unit tests",
        projectId: projectId,
    });
    test("POST /api/time-entries (start timer) → 201", te1.status === 201, te1.status, te1.body);
    const entryId = (te1.body as Record<string, unknown>)?.id as string;

    // 13. GET active timer (should exist now)
    const te2 = await req("GET", "/api/time-entries/active");
    test("GET /api/time-entries/active → running entry", te2.status === 200 && (te2.body as Record<string, unknown>)?.id === entryId, te2.status, te2.body);

    // 14. POST second timer → 409 Conflict
    const te3 = await req("POST", "/api/time-entries", {
        taskName: "Another task",
        projectId: projectId,
    });
    test("POST /api/time-entries (duplicate) → 409", te3.status === 409, te3.status, te3.body);

    // 15. POST stop timer
    const te4 = await req("POST", `/api/time-entries/${entryId}/stop`, {});
    test("POST /api/time-entries/:id/stop → 200", te4.status === 200, te4.status, te4.body);
    const stoppedEntry = te4.body as Record<string, unknown>;
    test("  → endTime is set", stoppedEntry?.endTime !== null, undefined, stoppedEntry);
    test("  → duration is calculated", typeof stoppedEntry?.duration === "number" && (stoppedEntry.duration as number) >= 0, undefined, stoppedEntry);

    // 16. POST stop again → 400
    const te5 = await req("POST", `/api/time-entries/${entryId}/stop`, {});
    test("POST stop (already stopped) → 400", te5.status === 400, te5.status, te5.body);

    // 17. GET active timer (none after stop)
    const te6 = await req("GET", "/api/time-entries/active");
    test("GET /api/time-entries/active (after stop) → null", te6.status === 200 && te6.body === null, te6.status, te6.body);

    // 18. GET time entries with date filter
    const today = new Date().toISOString().split("T")[0];
    const te7 = await req("GET", `/api/time-entries?date=${today}`);
    test(`GET /api/time-entries?date=${today} → 200`, te7.status === 200 && Array.isArray(te7.body), te7.status, te7.body);

    // 19. GET time entries with invalid date → 400
    const te8 = await req("GET", "/api/time-entries?date=invalid");
    test("GET /api/time-entries?date=invalid → 400", te8.status === 400, te8.status, te8.body);

    console.log("\n════════════════════════════════════════════");
    console.log("  SINGLE-TIMER BYPASS PROTECTION");
    console.log("════════════════════════════════════════════");

    // 20. Start a new timer
    const te9 = await req("POST", "/api/time-entries", {
        taskName: "Active task",
        projectId: projectId,
    });
    test("Start a new timer → 201", te9.status === 201, te9.status, te9.body);
    const activeEntryId = (te9.body as Record<string, unknown>)?.id as string;

    // 21. Try to re-open the stopped entry (set endTime=null) → should 409
    const te10 = await req("PUT", `/api/time-entries/${entryId}`, { endTime: null });
    test("PUT endTime=null on stopped entry (bypass attempt) → 409", te10.status === 409, te10.status, te10.body);

    // 22. Stop and cleanup
    await req("POST", `/api/time-entries/${activeEntryId}/stop`, {});

    console.log("\n════════════════════════════════════════════");
    console.log("  REPORTS");
    console.log("════════════════════════════════════════════");

    // --- REPORTS ---

    // 23. GET report
    const r1 = await req("GET", `/api/reports?from=${today}&to=${today}`);
    test("GET /api/reports → 200", r1.status === 200, r1.status, r1.body);
    const report = r1.body as Record<string, unknown>;
    test("  → has totalDuration", typeof report?.totalDuration === "number", undefined, report);
    test("  → has projectBreakdown", Array.isArray(report?.projectBreakdown), undefined, report);

    // 24. GET report without params → 400
    const r2 = await req("GET", "/api/reports");
    test("GET /api/reports (no params) → 400", r2.status === 400, r2.status, r2.body);

    // 25. GET CSV export
    const csvRes = await fetch(`${BASE}/api/reports/export?from=${today}&to=${today}&format=csv`);
    test("GET /api/reports/export → 200 CSV", csvRes.status === 200, csvRes.status);
    const contentType = csvRes.headers.get("content-type") ?? "";
    test("  → Content-Type: text/csv", contentType.includes("text/csv"));
    const csvText = await csvRes.text();
    test("  → CSV has headers", csvText.includes("Date") && csvText.includes("Project"), undefined, csvText.slice(0, 100));

    console.log("\n════════════════════════════════════════════");
    console.log("  CLEANUP: DELETE");
    console.log("════════════════════════════════════════════");

    // --- CLEANUP ---

    // 26. Delete time entries
    const allEntries = (await req("GET", "/api/time-entries")).body as Array<Record<string, unknown>>;
    for (const entry of allEntries) {
        const dr = await req("DELETE", `/api/time-entries/${entry.id}`);
        test(`DELETE /api/time-entries/${(entry.id as string).slice(0, 8)}... → 200`, dr.status === 200, dr.status, dr.body);
    }

    // 27. DELETE project (should succeed now — no linked entries)
    const dp = await req("DELETE", `/api/projects/${projectId}`);
    test("DELETE /api/projects/:id → 200", dp.status === 200, dp.status, dp.body);

    // 28. DELETE task
    const taskId = (t1.body as Record<string, unknown>)?.id as string;
    const dt = await req("DELETE", `/api/tasks/${taskId}`);
    test("DELETE /api/tasks/:id → 200", dt.status === 200, dt.status, dt.body);

    // --- SUMMARY ---
    console.log("\n════════════════════════════════════════════");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} tests`);

    if (failed > 0) {
        console.log("\n❌ Failed tests:");
        for (const r of results.filter((r) => !r.passed)) {
            console.log(`   - ${r.name}`);
        }
    } else {
        console.log("\n🎉 All tests passed!");
    }

    process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
