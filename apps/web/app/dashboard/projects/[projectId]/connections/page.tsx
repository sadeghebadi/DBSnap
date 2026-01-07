"use client"

import { use, useEffect } from "react"
import { ConnectionList } from "@/components/connections/connection-list"
import { AddConnectionModal } from "@/components/connections/add-connection-modal"

interface ConnectionsPageProps {
    params: Promise<{ projectId: string }>
}

export default function ConnectionsPage({ params }: ConnectionsPageProps) {
    // In Next.js 15+, params is a Promise. We use React.use() to unwrap it.
    const { projectId } = use(params);

    return (
        <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Connections</h2>
                    <p className="text-muted-foreground">
                        Manage your database connections for this project.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddConnectionModal projectId={projectId} />
                </div>
            </div>

            <ConnectionList projectId={projectId} />
        </div>
    )
}
