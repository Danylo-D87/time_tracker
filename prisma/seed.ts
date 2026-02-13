import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helper: create a Date for a given day offset and time ────────────
function dateAt(daysAgo: number, hours: number, minutes: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function durationSec(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / 1000);
}

async function main() {
    console.log("🌱 Seeding database…");

    // ── Cleanup ─────────────────────────────────────────────────
    await prisma.timeEntry.deleteMany({});
    await prisma.taskName.deleteMany({});
    await prisma.project.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ── Projects ────────────────────────────────────────────────
    const projects = await Promise.all([
        prisma.project.create({
            data: { name: "Website Redesign", color: "#3B82F6" },
        }),
        prisma.project.create({
            data: { name: "Mobile App", color: "#10B981" },
        }),
        prisma.project.create({
            data: { name: "API Development", color: "#F59E0B" },
        }),
        prisma.project.create({
            data: { name: "Marketing Campaign", color: "#EF4444" },
        }),
    ]);
    const [web, mobile, api, marketing] = projects;
    console.log("✅ Created 4 projects:", projects.map((p) => p.name).join(", "));

    // ── Task Names ──────────────────────────────────────────────
    const taskNames = [
        // Website Redesign tasks
        "Design homepage mockup",
        "Implement responsive header",
        "Create color palette & typography",
        "Build contact form",
        "Set up CMS integration",
        "Optimize images & assets",
        "Cross-browser testing",

        // Mobile App tasks
        "Wireframe main screens",
        "Implement login screen",
        "Build navigation component",
        "Push notifications setup",
        "Local storage caching",
        "Unit tests for auth module",

        // API Development tasks
        "Create REST endpoints",
        "Database schema design",
        "JWT authentication middleware",
        "Rate limiting implementation",
        "Write API documentation",
        "Integration tests",

        // Marketing Campaign tasks
        "Competitor analysis",
        "Content calendar planning",
        "Design social media graphics",
        "Write blog post drafts",
        "Set up email automation",
        "Analytics dashboard setup",
        "A/B testing landing pages",
    ];

    const tasks: Record<string, { id: string }> = {};
    for (const name of taskNames) {
        const task = await prisma.taskName.create({ data: { name } });
        tasks[name] = task;
    }
    console.log(`✅ Created ${taskNames.length} task names`);

    // ── Time Entries ────────────────────────────────────────────
    // Spread across today (0), yesterday (1), and 2–4 days ago for reports

    interface EntryDef {
        daysAgo: number;
        startH: number;
        startM: number;
        endH: number;
        endM: number;
        projectId: string;
        taskName: string;
    }

    const entries: EntryDef[] = [
        // ── Website Redesign (7 entries) ────────────────────────
        { daysAgo: 0, startH: 9,  startM: 0,  endH: 10, endM: 30, projectId: web!.id, taskName: "Design homepage mockup" },
        { daysAgo: 0, startH: 10, startM: 45, endH: 12, endM: 15, projectId: web!.id, taskName: "Create color palette & typography" },
        { daysAgo: 1, startH: 9,  startM: 0,  endH: 11, endM: 0,  projectId: web!.id, taskName: "Implement responsive header" },
        { daysAgo: 1, startH: 13, startM: 0,  endH: 15, endM: 30, projectId: web!.id, taskName: "Build contact form" },
        { daysAgo: 2, startH: 10, startM: 0,  endH: 12, endM: 0,  projectId: web!.id, taskName: "Set up CMS integration" },
        { daysAgo: 3, startH: 14, startM: 0,  endH: 16, endM: 45, projectId: web!.id, taskName: "Optimize images & assets" },
        { daysAgo: 4, startH: 9,  startM: 30, endH: 11, endM: 0,  projectId: web!.id, taskName: "Cross-browser testing" },

        // ── Mobile App (6 entries) ──────────────────────────────
        { daysAgo: 0, startH: 13, startM: 0,  endH: 14, endM: 45, projectId: mobile!.id, taskName: "Wireframe main screens" },
        { daysAgo: 0, startH: 15, startM: 0,  endH: 16, endM: 30, projectId: mobile!.id, taskName: "Implement login screen" },
        { daysAgo: 1, startH: 11, startM: 15, endH: 12, endM: 45, projectId: mobile!.id, taskName: "Build navigation component" },
        { daysAgo: 2, startH: 13, startM: 0,  endH: 15, endM: 0,  projectId: mobile!.id, taskName: "Push notifications setup" },
        { daysAgo: 3, startH: 9,  startM: 0,  endH: 11, endM: 30, projectId: mobile!.id, taskName: "Local storage caching" },
        { daysAgo: 4, startH: 13, startM: 0,  endH: 15, endM: 15, projectId: mobile!.id, taskName: "Unit tests for auth module" },

        // ── API Development (6 entries) ─────────────────────────
        { daysAgo: 0, startH: 16, startM: 45, endH: 18, endM: 0,  projectId: api!.id, taskName: "Create REST endpoints" },
        { daysAgo: 1, startH: 15, startM: 45, endH: 17, endM: 30, projectId: api!.id, taskName: "Database schema design" },
        { daysAgo: 2, startH: 15, startM: 15, endH: 17, endM: 0,  projectId: api!.id, taskName: "JWT authentication middleware" },
        { daysAgo: 2, startH: 17, startM: 15, endH: 18, endM: 30, projectId: api!.id, taskName: "Rate limiting implementation" },
        { daysAgo: 3, startH: 11, startM: 45, endH: 13, endM: 30, projectId: api!.id, taskName: "Write API documentation" },
        { daysAgo: 4, startH: 15, startM: 30, endH: 17, endM: 45, projectId: api!.id, taskName: "Integration tests" },

        // ── Marketing Campaign (5 entries) ──────────────────────
        { daysAgo: 1, startH: 8,  startM: 30, endH: 9,  endM: 0,  projectId: marketing!.id, taskName: "Competitor analysis" },
        { daysAgo: 2, startH: 8,  startM: 30, endH: 10, endM: 0,  projectId: marketing!.id, taskName: "Content calendar planning" },
        { daysAgo: 3, startH: 16, startM: 45, endH: 18, endM: 0,  projectId: marketing!.id, taskName: "Design social media graphics" },
        { daysAgo: 4, startH: 11, startM: 15, endH: 12, endM: 45, projectId: marketing!.id, taskName: "Write blog post drafts" },
        { daysAgo: 4, startH: 8,  startM: 30, endH: 9,  endM: 15, projectId: marketing!.id, taskName: "Set up email automation" },
    ];

    for (const e of entries) {
        const start = dateAt(e.daysAgo, e.startH, e.startM);
        const end = dateAt(e.daysAgo, e.endH, e.endM);

        await prisma.timeEntry.create({
            data: {
                startTime: start,
                endTime: end,
                duration: durationSec(start, end),
                projectId: e.projectId,
                taskNameId: tasks[e.taskName]!.id,
            },
        });
    }

    console.log(`✅ Created ${entries.length} time entries`);
    console.log("");
    console.log("📊 Summary:");
    console.log("   Website Redesign:    7 entries");
    console.log("   Mobile App:          6 entries");
    console.log("   API Development:     6 entries");
    console.log("   Marketing Campaign:  5 entries");
    console.log("   Total:              24 entries");
    console.log("");
    console.log("🌱 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
