
"use client";

import Link from "next/link";

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
                    <div className="font-semibold leading-none tracking-tight">No Projects</div>
                    <p className="text-sm text-muted-foreground">You haven't created any projects yet.</p>
                </div>
            </div>
        </div>
    );
}
