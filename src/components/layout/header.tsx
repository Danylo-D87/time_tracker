"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock, FolderOpen, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", label: "Tracker", icon: Clock },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface">
                        <Clock className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        Time Tracker
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const isActive =
                            href === "/" ? pathname === "/" : pathname.startsWith(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-surface text-foreground"
                                        : "text-text-secondary hover:text-foreground hover:bg-surface/50",
                                )}
                            >
                                <Icon className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
