
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Project {
    id: string;
    name: string;
    environment: string;
    user?: {
        email: string;
    }
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/projects')
            .then((res) => {
                setProjects(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch projects", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading projects...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>

            {projects.length === 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
                        <div className="font-semibold leading-none tracking-tight">No Projects</div>
                        <p className="text-sm text-muted-foreground">You haven't created any projects yet.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {projects.map((project) => (
                        <div key={project.id} className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
                            <div className="font-semibold leading-none tracking-tight">{project.name}</div>
                            <div className="text-xs text-muted-foreground">Env: {project.environment}</div>
                            {project.user && (
                                <div className="text-xs text-blue-500">Owner: {project.user.email}</div>
                            )}
                            <Link href={`/dashboard/projects/${project.id}`} className="text-sm underline">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
