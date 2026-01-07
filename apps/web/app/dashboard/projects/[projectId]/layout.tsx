"use client"

import { use } from "react"
import { ProjectNav } from "@/components/dashboard/project-nav"

export default function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ projectId: string }>
}) {
    const { projectId } = use(params)

    return (
        <div className="flex flex-col min-h-screen">
            <ProjectNav projectId={projectId} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
