"use client";

import { Header } from "@/components/layout/header";
import { ActiveTimerBar } from "@/components/layout/active-timer-bar";
import { ToastContainer } from "@/components/layout/toast-container";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <ActiveTimerBar />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
                {children}
            </main>
            <ToastContainer />
        </div>
    );
}
